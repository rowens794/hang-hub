"use server";

import { db } from "./db";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "./auth";
import { hashPassword, encrypt } from "./auth";
import { sendQRInviteEmail } from "./mail";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Generate a QR invite token
export async function generateQRInvite(hangId?: string) {
  const session = await getSession();

  if (!session || session.role !== "child") {
    return { error: "Must be logged in as a child" };
  }

  const token = uuidv4();
  const inviteType = hangId ? "hang" : "friend";
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  // If hang-specific, verify the child is a participant
  if (hangId) {
    const hangCheck = await db.execute({
      sql: `SELECT 1 FROM hang_participants WHERE hang_id = ? AND user_id = ?`,
      args: [hangId, session.userId],
    });

    if (hangCheck.rows.length === 0) {
      return { error: "You must be a participant in this hang to invite others" };
    }
  }

  try {
    await db.execute({
      sql: `
        INSERT INTO qr_invites (id, inviter_child_id, hang_id, invite_type, expires_at)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [token, session.userId, hangId || null, inviteType, expiresAt],
    });

    return { success: true, token };
  } catch (err) {
    console.error("Failed to create QR invite:", err);
    return { error: "Failed to create invite" };
  }
}

// Get invite details for the landing page
export async function getQRInviteDetails(token: string) {
  const result = await db.execute({
    sql: `
      SELECT
        qi.*,
        c.display_name as inviter_name,
        c.avatar_url as inviter_avatar,
        h.title as hang_title,
        h.scheduled_at as hang_date
      FROM qr_invites qi
      JOIN children c ON qi.inviter_child_id = c.id
      LEFT JOIN hangs h ON qi.hang_id = h.id
      WHERE qi.id = ?
    `,
    args: [token],
  });

  if (result.rows.length === 0) {
    return { valid: false, error: "Invalid invite link" };
  }

  const invite = result.rows[0] as any;

  // Check if expired
  if (new Date(invite.expires_at) < new Date()) {
    return { valid: false, expired: true, error: "This invite has expired" };
  }

  // Check if already used
  if (invite.status !== "pending") {
    return { valid: false, error: "This invite has already been used" };
  }

  return {
    valid: true,
    inviterName: invite.inviter_name,
    inviterAvatar: invite.inviter_avatar,
    inviteType: invite.invite_type,
    hangTitle: invite.hang_title,
    hangDate: invite.hang_date,
  };
}

// Submit invitee info (when QR is scanned and form filled)
export async function submitQRInviteInfo(
  token: string,
  inviteeName: string,
  parentEmail: string
) {
  // Validate inputs
  if (!inviteeName || !parentEmail) {
    return { error: "Name and parent email are required" };
  }

  if (!parentEmail.includes("@")) {
    return { error: "Please enter a valid email address" };
  }

  // Get invite details
  const result = await db.execute({
    sql: `
      SELECT
        qi.*,
        c.display_name as inviter_name,
        h.title as hang_title,
        h.scheduled_at as hang_date
      FROM qr_invites qi
      JOIN children c ON qi.inviter_child_id = c.id
      LEFT JOIN hangs h ON qi.hang_id = h.id
      WHERE qi.id = ?
    `,
    args: [token],
  });

  if (result.rows.length === 0) {
    return { error: "Invalid invite link" };
  }

  const invite = result.rows[0] as any;

  if (new Date(invite.expires_at) < new Date()) {
    return { error: "This invite has expired" };
  }

  if (invite.status !== "pending") {
    return { error: "This invite has already been used" };
  }

  // Generate approval tokens
  const approvalToken = uuidv4();
  const approvalTokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours

  // Update invite with submitted info
  await db.execute({
    sql: `
      UPDATE qr_invites
      SET
        invitee_name = ?,
        parent_email = ?,
        approval_token = ?,
        approval_token_expires_at = ?,
        status = 'scanned'
      WHERE id = ?
    `,
    args: [inviteeName, parentEmail, approvalToken, approvalTokenExpires, token],
  });

  // Send email to parent
  await sendQRInviteEmail({
    parentEmail,
    inviteeName,
    inviterName: invite.inviter_name,
    hangTitle: invite.hang_title,
    hangDate: invite.hang_date,
    approvalToken,
    inviteToken: token,
  });

  return { success: true };
}

// Process parent approval (from email link)
export async function approveQRInvite(approvalToken: string) {
  const result = await db.execute({
    sql: `
      SELECT
        qi.*,
        c.display_name as inviter_name,
        h.title as hang_title,
        h.scheduled_at as hang_date
      FROM qr_invites qi
      JOIN children c ON qi.inviter_child_id = c.id
      LEFT JOIN hangs h ON qi.hang_id = h.id
      WHERE qi.approval_token = ?
    `,
    args: [approvalToken],
  });

  if (result.rows.length === 0) {
    return { error: "Invalid approval link" };
  }

  const invite = result.rows[0] as any;

  if (new Date(invite.approval_token_expires_at) < new Date()) {
    return { error: "This approval link has expired" };
  }

  if (invite.status !== "scanned") {
    return { error: "This invite has already been processed" };
  }

  // Generate signup token
  const signupToken = uuidv4();
  const signupTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

  await db.execute({
    sql: `
      UPDATE qr_invites
      SET
        status = 'approved',
        signup_token = ?,
        signup_token_expires_at = ?
      WHERE id = ?
    `,
    args: [signupToken, signupTokenExpires, invite.id],
  });

  return {
    success: true,
    signupToken,
    inviteeName: invite.invitee_name,
    parentEmail: invite.parent_email,
    inviterName: invite.inviter_name,
    hangTitle: invite.hang_title,
    hangDate: invite.hang_date,
  };
}

// Process parent decline
export async function declineQRInvite(approvalToken: string) {
  const result = await db.execute({
    sql: `SELECT * FROM qr_invites WHERE approval_token = ?`,
    args: [approvalToken],
  });

  if (result.rows.length === 0) {
    return { error: "Invalid link" };
  }

  const invite = result.rows[0] as any;

  if (invite.status !== "scanned") {
    return { error: "This invite has already been processed" };
  }

  await db.execute({
    sql: `UPDATE qr_invites SET status = 'declined' WHERE id = ?`,
    args: [invite.id],
  });

  return { success: true };
}

// Get signup invite details
export async function getSignupInviteDetails(signupToken: string) {
  const result = await db.execute({
    sql: `
      SELECT
        qi.*,
        c.display_name as inviter_name,
        h.title as hang_title,
        h.scheduled_at as hang_date
      FROM qr_invites qi
      JOIN children c ON qi.inviter_child_id = c.id
      LEFT JOIN hangs h ON qi.hang_id = h.id
      WHERE qi.signup_token = ?
    `,
    args: [signupToken],
  });

  if (result.rows.length === 0) {
    return { valid: false, error: "Invalid signup link" };
  }

  const invite = result.rows[0] as any;

  if (new Date(invite.signup_token_expires_at) < new Date()) {
    return { valid: false, error: "This signup link has expired" };
  }

  if (invite.status !== "approved") {
    return { valid: false, error: "This invite is not ready for signup" };
  }

  return {
    valid: true,
    inviteeName: invite.invitee_name,
    parentEmail: invite.parent_email,
    inviterName: invite.inviter_name,
    hangTitle: invite.hang_title,
    hangDate: invite.hang_date,
    inviteType: invite.invite_type,
  };
}

// Complete signup with QR invite
export async function completeQRInviteSignup(state: any, formData: FormData) {
  const signupToken = formData.get("signupToken") as string;
  const parentName = formData.get("parentName") as string;
  const parentPassword = formData.get("parentPassword") as string;
  const childUsername = formData.get("childUsername") as string;
  const childDisplayName = formData.get("childDisplayName") as string;
  const childPin = formData.get("childPin") as string;

  // Validate
  if (!signupToken || !parentName || !parentPassword || !childUsername || !childDisplayName || !childPin) {
    return { error: "All fields are required" };
  }

  if (!/^\d{4,6}$/.test(childPin)) {
    return { error: "PIN must be 4-6 digits" };
  }

  if (childUsername.length < 3) {
    return { error: "Username must be at least 3 characters" };
  }

  // Get invite
  const inviteResult = await db.execute({
    sql: `SELECT * FROM qr_invites WHERE signup_token = ?`,
    args: [signupToken],
  });

  if (inviteResult.rows.length === 0) {
    return { error: "Invalid signup link" };
  }

  const invite = inviteResult.rows[0] as any;

  if (invite.status !== "approved") {
    return { error: "This invite is not ready for signup" };
  }

  if (new Date(invite.signup_token_expires_at) < new Date()) {
    return { error: "This signup link has expired" };
  }

  // Check if username is taken
  const usernameCheck = await db.execute({
    sql: `SELECT 1 FROM children WHERE username = ?`,
    args: [childUsername.toLowerCase()],
  });

  if (usernameCheck.rows.length > 0) {
    return { error: "Username is already taken" };
  }

  // Check if parent email already exists
  const emailCheck = await db.execute({
    sql: `SELECT id FROM parents WHERE email = ?`,
    args: [invite.parent_email],
  });

  let parentId: string;
  let isExistingParent = false;

  if (emailCheck.rows.length > 0) {
    // Parent already exists - they'll need to log in instead
    // For now, return an error directing them to login
    return { error: "An account with this email already exists. Please log in to add a child." };
  }

  // Create parent account
  parentId = uuidv4();
  const verificationToken = uuidv4();
  const passwordHash = await hashPassword(parentPassword);

  try {
    await db.execute({
      sql: `
        INSERT INTO parents (id, email, password_hash, name, verification_token, email_verified)
        VALUES (?, ?, ?, ?, ?, 1)
      `,
      args: [parentId, invite.parent_email, passwordHash, parentName, verificationToken],
    });
  } catch (err: any) {
    console.error("Failed to create parent:", err);
    return { error: "Failed to create account" };
  }

  // Create child account
  const childId = uuidv4();
  const pinHash = await hashPassword(childPin);

  try {
    await db.execute({
      sql: `
        INSERT INTO children (id, parent_id, username, display_name, pin_hash)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [childId, parentId, childUsername.toLowerCase(), childDisplayName, pinHash],
    });

    // Also create user entry for social features
    await db.execute({
      sql: `
        INSERT INTO users (id, name, avatar, status, is_online)
        VALUES (?, ?, NULL, NULL, 0)
      `,
      args: [childId, childDisplayName],
    });
  } catch (err: any) {
    console.error("Failed to create child:", err);
    if (err.message.includes("UNIQUE constraint failed")) {
      return { error: "Username is already taken" };
    }
    return { error: "Failed to create child account" };
  }

  // Create friendship between inviter and new child
  try {
    await db.execute({
      sql: `INSERT INTO friendships (user_id, friend_id) VALUES (?, ?)`,
      args: [invite.inviter_child_id, childId],
    });
    await db.execute({
      sql: `INSERT INTO friendships (user_id, friend_id) VALUES (?, ?)`,
      args: [childId, invite.inviter_child_id],
    });
  } catch (err) {
    console.error("Failed to create friendship:", err);
    // Non-fatal, continue
  }

  // If hang-specific, add to hang participants
  if (invite.hang_id) {
    try {
      await db.execute({
        sql: `
          INSERT INTO hang_participants (hang_id, user_id, parent_approved)
          VALUES (?, ?, 0)
        `,
        args: [invite.hang_id, childId],
      });
    } catch (err) {
      console.error("Failed to add to hang:", err);
      // Non-fatal, continue
    }
  }

  // Update invite as completed
  await db.execute({
    sql: `UPDATE qr_invites SET status = 'completed', new_child_id = ? WHERE id = ?`,
    args: [childId, invite.id],
  });

  // Create session for parent
  const expires = new Date(Date.now() + 120 * 60 * 1000);
  const session = await encrypt({
    userId: parentId,
    name: parentName,
    role: "parent",
    emailVerified: true,
    expires,
  });

  (await cookies()).set("session", session, { expires, httpOnly: true });

  revalidatePath("/parent/dashboard");
  revalidatePath("/dashboard");

  redirect("/parent/dashboard");
}
