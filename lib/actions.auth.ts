"use server";

import { db } from "./db";
import { v4 as uuidv4 } from "uuid";
import { hashPassword, comparePassword, encrypt } from "./auth";
import { sendWelcomeEmail } from "./mail";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signUpParent(state: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password || !name) {
    return { error: "Missing fields" };
  }

  const id = uuidv4();
  const verificationToken = uuidv4();
  const passwordHash = await hashPassword(password);

  try {
    await db.execute({
      sql: `
        INSERT INTO parents (id, email, password_hash, name, verification_token)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [id, email, passwordHash, name, verificationToken],
    });
  } catch (err: any) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return { error: "Email already exists" };
    }
    return { error: "Database error" };
  }

  // Send welcome email with verification link (non-blocking)
  sendWelcomeEmail(email, name, verificationToken).catch((err) =>
    console.error("Welcome email failed:", err)
  );

  const expires = new Date(Date.now() + 120 * 60 * 1000);
  const session = await encrypt({
    userId: id,
    name: name,
    role: "parent",
    emailVerified: false,
    expires,
  });

  (await cookies()).set("session", session, { expires, httpOnly: true });

  redirect("/parent/dashboard");
}

export async function loginParent(state: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Missing fields" };
  }

  const result = await db.execute({
    sql: "SELECT * FROM parents WHERE email = ?",
    args: [email],
  });

  const parent = result.rows[0];

  if (
    !parent ||
    !(await comparePassword(password, parent.password_hash as string))
  ) {
    return { error: "Invalid email or password" };
  }

  const expires = new Date(Date.now() + 120 * 60 * 1000);
  const session = await encrypt({
    userId: parent.id as string,
    name: parent.name as string,
    role: "parent",
    emailVerified: parent.email_verified === 1,
    expires,
  });
  (await cookies()).set("session", session, { expires, httpOnly: true });

  redirect("/parent/dashboard");
}

export async function verifyEmail(token: string) {
  const result = await db.execute({
    sql: "SELECT id FROM parents WHERE verification_token = ?",
    args: [token],
  });

  if (result.rows.length === 0) {
    return { error: "Invalid or expired token" };
  }

  const parentId = result.rows[0].id;

  await db.execute({
    sql: "UPDATE parents SET email_verified = 1, verification_token = NULL WHERE id = ?",
    args: [parentId],
  });

  // Update session if they are logged in
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (sessionToken) {
    try {
      const payload = await decrypt(sessionToken);
      if (payload.userId === parentId) {
        const expires = new Date(payload.expires);
        const newSession = await encrypt({
          ...payload,
          emailVerified: true,
        });
        cookieStore.set("session", newSession, { expires, httpOnly: true });
      }
    } catch (e) {
      // Session invalid, ignore
    }
  }

  return { success: true };
}

export async function loginChild(state: any, formData: FormData) {
  const username = formData.get("username") as string;
  const pin = formData.get("pin") as string;

  if (!username || !pin) {
    return { error: "Missing fields" };
  }

  const result = await db.execute({
    sql: "SELECT * FROM children WHERE username = ?",
    args: [username],
  });

  const child = result.rows[0];

  if (!child || !(await comparePassword(pin, child.pin_hash as string))) {
    return { error: "Invalid username or PIN" };
  }

  const expires = new Date(Date.now() + 120 * 60 * 1000);
  const session = await encrypt({
    userId: child.id as string,
    parentId: child.parent_id as string,
    name: child.display_name as string,
    role: "child",
    expires,
  });
  (await cookies()).set("session", session, { expires, httpOnly: true });

  redirect("/dashboard");
}

import { decrypt } from "./auth";

export async function createChild(state: any, formData: FormData) {
  const session = (await cookies()).get("session")?.value;
  if (!session) return { error: "Unauthorized" };

  const payload = await decrypt(session);
  if (payload.role !== "parent")
    return { error: "Only parents can create child profiles" };

  if (!payload.emailVerified) {
    return { error: "Please verify your email address first" };
  }

  const username = formData.get("username") as string;
  const displayName = formData.get("displayName") as string;
  const pin = formData.get("pin") as string;
  const avatarUrl = formData.get("avatarUrl") as string;

  if (!username || !displayName || !pin) {
    return { error: "Missing fields" };
  }

  if (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
    return { error: "PIN must be 4-6 digits" };
  }

  const pinHash = await hashPassword(pin);
  const id = uuidv4();

  try {
    await db.execute({
      sql: "INSERT INTO children (id, parent_id, username, display_name, pin_hash, avatar_url) VALUES (?, ?, ?, ?, ?, ?)",
      args: [id, payload.userId, username, displayName, pinHash, avatarUrl],
    });

    // Also sync to users table to match existing expectations
    await db.execute({
      sql: "INSERT OR REPLACE INTO users (id, name, avatar) VALUES (?, ?, ?)",
      args: [id, displayName, avatarUrl],
    });
  } catch (err: any) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return { error: "Username already exists" };
    }
    return { error: "Database error" };
  }

  return { success: true };
}

export async function logout() {
  (await cookies()).delete("session");
  redirect("/");
}

export async function updateProfileImage(avatarUrl: string) {
  const session = (await cookies()).get("session")?.value;
  if (!session) return { error: "Unauthorized" };

  const payload = await decrypt(session);
  if (payload.role !== "child")
    return { error: "Only children can update their profile image" };

  try {
    await db.execute({
      sql: "UPDATE children SET avatar_url = ? WHERE id = ?",
      args: [avatarUrl, payload.userId],
    });

    // Also sync to users table
    await db.execute({
      sql: "UPDATE users SET avatar = ? WHERE id = ?",
      args: [avatarUrl, payload.userId],
    });
  } catch (err) {
    return { error: "Database error" };
  }

  return { success: true };
}
