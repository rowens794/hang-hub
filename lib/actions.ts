"use server";

import { db } from "./db";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";

import { getSession } from "./auth";

async function getAuthenticatedUserId() {
  const session = await getSession();
  if (!session || session.role !== "child") {
    throw new Error("Unauthorized");
  }
  return session.userId as string;
}

interface HangRow {
  id: string;
  title: string;
  time: string;
  suggestedBy: string;
  status: string;
  parentCool: number;
}

export async function getHangs() {
  const result = await db.execute({
    sql: `
      SELECT 
        h.id, 
        h.title, 
        h.scheduled_at as time, 
        u.name as suggestedBy, 
        h.status, 
        h.parent_approved as parentCool
      FROM hangs h
      JOIN users u ON h.suggested_by = u.id
      ORDER BY h.created_at DESC
    `,
    args: [],
  });

  const hangs = await Promise.all(
    (result.rows as unknown as HangRow[]).map(async (row) => {
      const participants = await db.execute({
        sql: "SELECT user_id FROM hang_participants WHERE hang_id = ?",
        args: [row.id],
      });
      return {
        ...row,
        friendsIn: participants.rows.map((p) => p.user_id as string),
        parentCool: row.parentCool === 1,
      };
    })
  );

  return hangs;
}

interface FriendRow {
  id: string;
  name: string;
  avatar: string;
  status: string;
  is_online: number;
  crew: string | null;
}

export async function createHang(title: string, date: string, time: string) {
  const userId = await getAuthenticatedUserId();
  const id = uuidv4();
  const scheduled_at = new Date(`${date}T${time}`).toISOString();

  await db.execute({
    sql: `
      INSERT INTO hangs (id, title, scheduled_at, suggested_by, status)
      VALUES (?, ?, ?, ?, 'suggested')
    `,
    args: [id, title, scheduled_at, userId],
  });

  // Creator automatically joins
  await db.execute({
    sql: "INSERT INTO hang_participants (hang_id, user_id) VALUES (?, ?)",
    args: [id, userId],
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleHangParticipation(hangId: string) {
  const userId = await getAuthenticatedUserId();

  // Check if already participating
  const existing = await db.execute({
    sql: "SELECT 1 FROM hang_participants WHERE hang_id = ? AND user_id = ?",
    args: [hangId, userId],
  });

  if (existing.rows.length > 0) {
    // Leave
    await db.execute({
      sql: "DELETE FROM hang_participants WHERE hang_id = ? AND user_id = ?",
      args: [hangId, userId],
    });
  } else {
    // Join
    await db.execute({
      sql: "INSERT INTO hang_participants (hang_id, user_id) VALUES (?, ?)",
      args: [hangId, userId],
    });

    // Add activity
    await db.execute({
      sql: `
        INSERT INTO activities (id, type, actor_id, target_user_id, content, hang_id)
        SELECT ?, 'hang_joined', ?, suggested_by, 'I am in for ' || title, id
        FROM hangs WHERE id = ?
      `,
      args: [uuidv4(), userId, hangId],
    });
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function pingParents(hangId: string) {
  await db.execute({
    sql: "UPDATE hangs SET parent_approved = 1, status = 'parent_approved' WHERE id = ?",
    args: [hangId],
  });

  // Add activity for parent approval
  await db.execute({
    sql: `
      INSERT INTO activities (id, type, actor_id, target_user_id, content, hang_id)
      SELECT ?, 'parent_approved', suggested_by, user_id, 'Parents allowed ' || title, hang_id
      FROM hangs h
      JOIN hang_participants hp ON h.id = hp.hang_id
      WHERE h.id = ? AND hp.user_id != h.suggested_by
    `,
    args: [uuidv4(), hangId],
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getFriends() {
  const userId = await getAuthenticatedUserId();

  const friends = await db.execute({
    sql: `
      SELECT u.id, u.name, u.avatar, u.status, u.is_online, c.name as crew
      FROM users u
      JOIN friendships f ON (f.friend_id = u.id OR f.user_id = u.id)
      LEFT JOIN user_crews uc ON u.id = uc.user_id
      LEFT JOIN crews c ON uc.crew_id = c.id
      WHERE (f.user_id = ? OR f.friend_id = ?) AND u.id != ?
    `,
    args: [userId, userId, userId],
  });

  return (friends.rows as unknown as FriendRow[]).map((f) => ({
    ...f,
    isOnline: f.is_online === 1,
    crew: f.crew || "The Squad", // Default if no crew assigned
  }));
}

interface ActivityRow {
  id: string;
  type: string;
  actor_id: string;
  target_user_id: string;
  content: string;
  hang_id: string | null;
  created_at: string;
  is_read: number;
  actorName: string;
  actorAvatar: string;
  hangTitle: string | null;
}

export async function getUserProfile(userId?: string) {
  const targetId = userId || (await getAuthenticatedUserId());

  const user = await db.execute({
    sql: "SELECT * FROM users WHERE id = ?",
    args: [targetId],
  });
  return user.rows[0];
}

export async function getActivities() {
  const userId = await getAuthenticatedUserId();

  const result = await db.execute({
    sql: `
      SELECT 
        a.*, 
        u.name as actorName, 
        u.avatar as actorAvatar,
        h.title as hangTitle
      FROM activities a
      JOIN users u ON a.actor_id = u.id
      LEFT JOIN hangs h ON a.hang_id = h.id
      WHERE a.target_user_id = ?
      ORDER BY a.created_at DESC
    `,
    args: [userId],
  });

  return (result.rows as unknown as ActivityRow[]).map((a) => ({
    id: a.id,
    type: a.type as ActivityRow["type"],
    user: {
      name: a.actorName,
      avatar: a.actorAvatar,
    },
    content: a.content,
    timestamp: new Date(a.created_at).toLocaleString(),
    isRead: a.is_read === 1,
    meta: {
      hangTitle: a.hangTitle,
    },
  }));
}
