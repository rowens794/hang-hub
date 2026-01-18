"use server";

import { db } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getChildrenAction() {
  const session = await getSession();
  if (!session || session.role !== "parent") return [];

  const result = await db.execute({
    sql: "SELECT id, username, display_name, avatar_url FROM children WHERE parent_id = ?",
    args: [session.userId],
  });

  return result.rows;
}

export async function resetChildPin(childId: string, newPin: string) {
  const session = await getSession();
  if (!session || session.role !== "parent") {
    return { error: "Unauthorized" };
  }

  // Validate PIN format
  if (!newPin || newPin.length < 4 || newPin.length > 6 || !/^\d+$/.test(newPin)) {
    return { error: "PIN must be 4-6 digits" };
  }

  // Verify the child belongs to this parent
  const childResult = await db.execute({
    sql: "SELECT id FROM children WHERE id = ? AND parent_id = ?",
    args: [childId, session.userId],
  });

  if (childResult.rows.length === 0) {
    return { error: "Child not found" };
  }

  // Hash and update the PIN
  const pinHash = await hashPassword(newPin);

  try {
    await db.execute({
      sql: "UPDATE children SET pin_hash = ? WHERE id = ?",
      args: [pinHash, childId],
    });
  } catch (err) {
    return { error: "Database error" };
  }

  return { success: true };
}

export async function getPendingHangApprovals() {
  const session = await getSession();
  if (!session || session.role !== "parent") return [];

  // Get all pending approval requests for this parent's children
  // parent_approved = 1 means pending
  const result = await db.execute({
    sql: `
      SELECT
        hp.hang_id,
        hp.user_id as child_id,
        hp.parent_approved,
        c.display_name as child_name,
        c.avatar_url as child_avatar,
        c.username as child_username,
        h.title as hang_title,
        h.scheduled_at,
        h.suggested_by,
        h.parent_approved as creator_approved,
        u.name as suggested_by_name
      FROM hang_participants hp
      JOIN children c ON hp.user_id = c.id
      JOIN hangs h ON hp.hang_id = h.id
      JOIN users u ON h.suggested_by = u.id
      WHERE c.parent_id = ? AND hp.parent_approved = 1
      ORDER BY h.scheduled_at ASC
    `,
    args: [session.userId],
  });

  // Get participants and invites for each hang
  const approvals = await Promise.all(
    result.rows.map(async (row: any) => {
      // Get confirmed participants
      const participants = await db.execute({
        sql: `
          SELECT u.id, u.name, u.avatar, hp.parent_approved
          FROM hang_participants hp
          JOIN users u ON hp.user_id = u.id
          WHERE hp.hang_id = ?
        `,
        args: [row.hang_id],
      });

      // Get pending invites (people invited but not yet joined)
      const invites = await db.execute({
        sql: `
          SELECT u.id, u.name, u.avatar, hi.status
          FROM hang_invites hi
          JOIN users u ON hi.user_id = u.id
          WHERE hi.hang_id = ?
        `,
        args: [row.hang_id],
      });

      return {
        hangId: row.hang_id,
        childId: row.child_id,
        childName: row.child_name,
        childAvatar: row.child_avatar,
        childUsername: row.child_username,
        hangTitle: row.hang_title,
        scheduledAt: row.scheduled_at,
        suggestedBy: row.suggested_by,
        suggestedByName: row.suggested_by_name,
        creatorApproved: row.creator_approved === 1,
        participants: participants.rows.map((p: any) => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          approved: p.parent_approved === 2,
        })),
        invitedFriends: invites.rows.map((i: any) => ({
          id: i.id,
          name: i.name,
          avatar: i.avatar,
          status: i.status,
        })),
      };
    })
  );

  return approvals;
}

export async function approveHangParticipation(hangId: string, childId: string) {
  const session = await getSession();
  if (!session || session.role !== "parent") {
    return { error: "Unauthorized" };
  }

  // Verify the child belongs to this parent
  const childResult = await db.execute({
    sql: "SELECT id FROM children WHERE id = ? AND parent_id = ?",
    args: [childId, session.userId],
  });

  if (childResult.rows.length === 0) {
    return { error: "Child not found" };
  }

  // Update the participant's approval status to approved (2)
  await db.execute({
    sql: "UPDATE hang_participants SET parent_approved = 2 WHERE hang_id = ? AND user_id = ?",
    args: [hangId, childId],
  });

  // Check if this child is the hang creator - if so, also approve the hang itself
  const hangResult = await db.execute({
    sql: "SELECT suggested_by FROM hangs WHERE id = ?",
    args: [hangId],
  });

  if (hangResult.rows.length > 0) {
    const hang = hangResult.rows[0] as any;
    if (hang.suggested_by === childId) {
      // This child created the hang, so approve the hang too
      await db.execute({
        sql: "UPDATE hangs SET parent_approved = 1, status = 'parent_approved' WHERE id = ?",
        args: [hangId],
      });
    }
  }

  revalidatePath("/parent/dashboard");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function declineHangParticipation(hangId: string, childId: string) {
  const session = await getSession();
  if (!session || session.role !== "parent") {
    return { error: "Unauthorized" };
  }

  // Verify the child belongs to this parent
  const childResult = await db.execute({
    sql: "SELECT id FROM children WHERE id = ? AND parent_id = ?",
    args: [childId, session.userId],
  });

  if (childResult.rows.length === 0) {
    return { error: "Child not found" };
  }

  // Update to declined status (3)
  await db.execute({
    sql: "UPDATE hang_participants SET parent_approved = 3 WHERE hang_id = ? AND user_id = ?",
    args: [hangId, childId],
  });

  revalidatePath("/parent/dashboard");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function cancelHangParticipation(hangId: string, childId: string) {
  const session = await getSession();
  if (!session || session.role !== "parent") {
    return { error: "Unauthorized" };
  }

  // Verify the child belongs to this parent
  const childResult = await db.execute({
    sql: "SELECT id, display_name FROM children WHERE id = ? AND parent_id = ?",
    args: [childId, session.userId],
  });

  if (childResult.rows.length === 0) {
    return { error: "Child not found" };
  }

  // Update to cancelled status (4)
  await db.execute({
    sql: "UPDATE hang_participants SET parent_approved = 4 WHERE hang_id = ? AND user_id = ?",
    args: [hangId, childId],
  });

  revalidatePath("/parent/dashboard");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getHangHistory() {
  const session = await getSession();
  if (!session || session.role !== "parent") return [];

  // Get all approved (2), declined (3), and cancelled (4) hang participations for this parent's children
  const result = await db.execute({
    sql: `
      SELECT
        hp.hang_id,
        hp.user_id as child_id,
        hp.parent_approved,
        c.display_name as child_name,
        c.avatar_url as child_avatar,
        h.title as hang_title,
        h.scheduled_at,
        h.suggested_by,
        u.name as suggested_by_name
      FROM hang_participants hp
      JOIN children c ON hp.user_id = c.id
      JOIN hangs h ON hp.hang_id = h.id
      JOIN users u ON h.suggested_by = u.id
      WHERE c.parent_id = ? AND hp.parent_approved IN (2, 3, 4)
      ORDER BY h.scheduled_at DESC
      LIMIT 50
    `,
    args: [session.userId],
  });

  // Get participants for each hang
  const history = await Promise.all(
    result.rows.map(async (row: any) => {
      const participants = await db.execute({
        sql: `
          SELECT u.id, u.name, u.avatar
          FROM hang_participants hp
          JOIN users u ON hp.user_id = u.id
          WHERE hp.hang_id = ?
        `,
        args: [row.hang_id],
      });

      const statusMap: Record<number, "approved" | "denied" | "cancelled"> = {
        2: "approved",
        3: "denied",
        4: "cancelled",
      };

      return {
        hangId: row.hang_id,
        childId: row.child_id,
        childName: row.child_name,
        childAvatar: row.child_avatar,
        hangTitle: row.hang_title,
        scheduledAt: row.scheduled_at,
        suggestedByName: row.suggested_by_name,
        status: statusMap[row.parent_approved as number] || "denied",
        participants: participants.rows.map((p: any) => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
        })),
      };
    })
  );

  return history;
}
