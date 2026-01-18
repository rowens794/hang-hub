"use server";

import { db } from "./db";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { sendParentInviteEmail, sendHangApprovalEmail } from "./mail";

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
  const userId = await getAuthenticatedUserId();

  // Only get hangs where user is a participant (creator or accepted invite)
  const result = await db.execute({
    sql: `
      SELECT DISTINCT
        h.id,
        h.title,
        h.scheduled_at as time,
        h.suggested_by as suggestedById,
        u.name as suggestedBy,
        h.status,
        h.parent_approved as parentCool
      FROM hangs h
      JOIN users u ON h.suggested_by = u.id
      JOIN hang_participants hp ON h.id = hp.hang_id
      WHERE hp.user_id = ?
      ORDER BY h.created_at DESC
    `,
    args: [userId],
  });

  const hangs = await Promise.all(
    (result.rows as unknown as HangRow[]).map(async (row) => {
      const participants = await db.execute({
        sql: "SELECT user_id, parent_approved FROM hang_participants WHERE hang_id = ?",
        args: [row.id],
      });

      // Get current user's approval status for this hang
      const myParticipation = participants.rows.find(
        (p: any) => p.user_id === userId
      ) as any;

      // Check if the creator's participation was cancelled (status 4)
      const creatorParticipation = participants.rows.find(
        (p: any) => p.user_id === (row as any).suggestedById
      ) as any;
      const isCancelled = creatorParticipation?.parent_approved === 4 || myParticipation?.parent_approved === 4;

      return {
        ...row,
        friendsIn: participants.rows.map((p) => p.user_id as string),
        parentCool: row.parentCool === 1,
        // 0 = not pinged, 1 = pending, 2 = approved, 3 = declined, 4 = cancelled
        myApprovalStatus: myParticipation?.parent_approved ?? null,
        isCreator: (row as any).suggestedById === userId,
        isCancelled,
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

export async function createHang(
  title: string,
  date: string,
  time: string,
  invitedFriendIds: string[] = []
) {
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

  // Creator automatically joins with parent_approved = 1 (pending - auto-ping)
  await db.execute({
    sql: "INSERT INTO hang_participants (hang_id, user_id, parent_approved) VALUES (?, ?, 1)",
    args: [id, userId],
  });

  // Create invites for selected friends
  for (const friendId of invitedFriendIds) {
    await db.execute({
      sql: "INSERT INTO hang_invites (hang_id, user_id, status) VALUES (?, ?, 'pending')",
      args: [id, friendId],
    });
  }

  // Auto-send approval request to parent
  const childResult = await db.execute({
    sql: `
      SELECT c.display_name, p.email, p.name as parent_name
      FROM children c
      JOIN parents p ON c.parent_id = p.id
      WHERE c.id = ?
    `,
    args: [userId],
  });

  if (childResult.rows.length > 0) {
    const child = childResult.rows[0] as any;

    // Generate tokens for approve and decline actions
    const approveToken = uuidv4();
    const declineToken = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Store tokens
    await db.execute({
      sql: "INSERT INTO hang_approval_tokens (id, hang_id, child_id, action, expires_at) VALUES (?, ?, ?, 'approve', ?)",
      args: [approveToken, id, userId, expiresAt],
    });

    await db.execute({
      sql: "INSERT INTO hang_approval_tokens (id, hang_id, child_id, action, expires_at) VALUES (?, ?, ?, 'decline', ?)",
      args: [declineToken, id, userId, expiresAt],
    });

    // Send email to parent (non-blocking)
    sendHangApprovalEmail({
      parentEmail: child.email,
      parentName: child.parent_name,
      childName: child.display_name,
      hangTitle: title,
      hangDate: scheduled_at,
      approveToken,
      declineToken,
    }).catch((err) => console.error("Failed to send hang approval email:", err));
  }

  revalidatePath("/dashboard");
  revalidatePath("/parent/dashboard");
  return { success: true };
}

export async function toggleHangParticipation(hangId: string) {
  const userId = await getAuthenticatedUserId();

  // Get hang details
  const hang = await db.execute({
    sql: "SELECT suggested_by, parent_approved FROM hangs WHERE id = ?",
    args: [hangId],
  });

  if (hang.rows.length === 0) {
    return { error: "Hang not found" };
  }

  const hangData = hang.rows[0] as any;
  const isCreator = hangData.suggested_by === userId;

  // Check if already participating
  const existing = await db.execute({
    sql: "SELECT 1 FROM hang_participants WHERE hang_id = ? AND user_id = ?",
    args: [hangId, userId],
  });

  if (existing.rows.length > 0) {
    // Leave - but creators can't leave their own hang
    if (isCreator) {
      return { error: "Creator cannot leave their own hang" };
    }
    await db.execute({
      sql: "DELETE FROM hang_participants WHERE hang_id = ? AND user_id = ?",
      args: [hangId, userId],
    });
  } else {
    // Join - check if creator's parent has approved (unless this user is the creator)
    if (!isCreator && hangData.parent_approved !== 1) {
      return { error: "Hang is not open for joining yet - creator's parent hasn't approved" };
    }

    // Join with parent_approved = 0 (not yet pinged)
    await db.execute({
      sql: "INSERT INTO hang_participants (hang_id, user_id, parent_approved) VALUES (?, ?, 0)",
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
  const userId = await getAuthenticatedUserId();

  // Check if user is a participant
  const participation = await db.execute({
    sql: "SELECT parent_approved FROM hang_participants WHERE hang_id = ? AND user_id = ?",
    args: [hangId, userId],
  });

  if (participation.rows.length === 0) {
    return { error: "You are not participating in this hang" };
  }

  const currentStatus = (participation.rows[0] as any).parent_approved;

  // Only allow pinging if not already pending or approved
  if (currentStatus === 1) {
    return { error: "Already waiting for parent approval" };
  }
  if (currentStatus === 2) {
    return { error: "Already approved by parent" };
  }

  // Get hang details
  const hangResult = await db.execute({
    sql: "SELECT title, scheduled_at FROM hangs WHERE id = ?",
    args: [hangId],
  });

  if (hangResult.rows.length === 0) {
    return { error: "Hang not found" };
  }

  const hang = hangResult.rows[0] as any;

  // Get child and parent info
  const childResult = await db.execute({
    sql: `
      SELECT c.display_name, p.email, p.name as parent_name
      FROM children c
      JOIN parents p ON c.parent_id = p.id
      WHERE c.id = ?
    `,
    args: [userId],
  });

  if (childResult.rows.length === 0) {
    return { error: "Child profile not found" };
  }

  const child = childResult.rows[0] as any;

  // Generate tokens for approve and decline actions
  const approveToken = uuidv4();
  const declineToken = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  // Store tokens
  await db.execute({
    sql: "INSERT INTO hang_approval_tokens (id, hang_id, child_id, action, expires_at) VALUES (?, ?, ?, 'approve', ?)",
    args: [approveToken, hangId, userId, expiresAt],
  });

  await db.execute({
    sql: "INSERT INTO hang_approval_tokens (id, hang_id, child_id, action, expires_at) VALUES (?, ?, ?, 'decline', ?)",
    args: [declineToken, hangId, userId, expiresAt],
  });

  // Set status to pending (1)
  await db.execute({
    sql: "UPDATE hang_participants SET parent_approved = 1 WHERE hang_id = ? AND user_id = ?",
    args: [hangId, userId],
  });

  // Send email to parent (non-blocking)
  sendHangApprovalEmail({
    parentEmail: child.email,
    parentName: child.parent_name,
    childName: child.display_name,
    hangTitle: hang.title,
    hangDate: hang.scheduled_at,
    approveToken,
    declineToken,
  }).catch((err) => console.error("Failed to send hang approval email:", err));

  revalidatePath("/dashboard");
  revalidatePath("/parent/dashboard");
  return { success: true };
}

export async function getFriends() {
  const userId = await getAuthenticatedUserId();

  const friends = await db.execute({
    sql: `
      SELECT u.id, u.name, u.avatar, u.status, u.is_online,
             GROUP_CONCAT(fg.group_name) as groups
      FROM users u
      JOIN friendships f ON (f.friend_id = u.id OR f.user_id = u.id)
      LEFT JOIN friend_groups fg ON fg.owner_id = ? AND fg.friend_id = u.id
      WHERE (f.user_id = ? OR f.friend_id = ?) AND u.id != ?
      GROUP BY u.id, u.name, u.avatar, u.status, u.is_online
    `,
    args: [userId, userId, userId, userId],
  });

  return (friends.rows as unknown as any[]).map((f) => ({
    id: f.id,
    name: f.name,
    avatar: f.avatar,
    status: f.status,
    isOnline: f.is_online === 1,
    groups: f.groups ? (f.groups as string).split(",") : [],
  }));
}

export async function getMyGroups() {
  const userId = await getAuthenticatedUserId();

  const result = await db.execute({
    sql: `
      SELECT DISTINCT group_name FROM friend_groups
      WHERE owner_id = ?
      ORDER BY group_name
    `,
    args: [userId],
  });

  return result.rows.map((r: any) => r.group_name as string);
}

export async function toggleFriendGroup(friendId: string, groupName: string) {
  const userId = await getAuthenticatedUserId();

  // Verify they are friends
  const friendship = await db.execute({
    sql: `
      SELECT 1 FROM friendships
      WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
    `,
    args: [userId, friendId, friendId, userId],
  });

  if (friendship.rows.length === 0) {
    return { error: "Not friends with this user" };
  }

  // Check if already in this group
  const existing = await db.execute({
    sql: "SELECT 1 FROM friend_groups WHERE owner_id = ? AND friend_id = ? AND group_name = ?",
    args: [userId, friendId, groupName],
  });

  if (existing.rows.length > 0) {
    // Remove from group
    await db.execute({
      sql: "DELETE FROM friend_groups WHERE owner_id = ? AND friend_id = ? AND group_name = ?",
      args: [userId, friendId, groupName],
    });
  } else {
    // Add to group
    await db.execute({
      sql: "INSERT INTO friend_groups (owner_id, friend_id, group_name) VALUES (?, ?, ?)",
      args: [userId, friendId, groupName],
    });
  }

  revalidatePath("/dashboard/friends");
  return { success: true };
}

export async function addCustomGroup(friendId: string, groupName: string) {
  const userId = await getAuthenticatedUserId();

  if (!groupName.trim()) {
    return { error: "Group name cannot be empty" };
  }

  // Verify they are friends
  const friendship = await db.execute({
    sql: `
      SELECT 1 FROM friendships
      WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
    `,
    args: [userId, friendId, friendId, userId],
  });

  if (friendship.rows.length === 0) {
    return { error: "Not friends with this user" };
  }

  // Add to group (ignore if already exists)
  await db.execute({
    sql: "INSERT OR IGNORE INTO friend_groups (owner_id, friend_id, group_name) VALUES (?, ?, ?)",
    args: [userId, friendId, groupName.trim()],
  });

  revalidatePath("/dashboard/friends");
  return { success: true };
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
    sql: "SELECT id, name, avatar, status, is_online, created_at FROM users WHERE id = ?",
    args: [targetId],
  });

  if (!user.rows[0]) return null;

  // Convert to plain object for Client Component serialization
  const row = user.rows[0] as any;
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    status: row.status,
    isOnline: row.is_online === 1,
  };
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

export async function searchUsers(query: string) {
  const userId = await getAuthenticatedUserId();

  if (!query || query.trim().length < 2) {
    return [];
  }

  // Search for children by username, excluding self and existing friends
  const result = await db.execute({
    sql: `
      SELECT c.id, c.username, c.display_name, c.avatar_url
      FROM children c
      WHERE c.username LIKE ?
        AND c.id != ?
        AND c.id NOT IN (
          SELECT friend_id FROM friendships WHERE user_id = ?
          UNION
          SELECT user_id FROM friendships WHERE friend_id = ?
        )
      LIMIT 10
    `,
    args: [`%${query.trim()}%`, userId, userId, userId],
  });

  return result.rows.map((row: any) => ({
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatar: row.avatar_url,
  }));
}

export async function sendFriendRequest(toUserId: string) {
  const userId = await getAuthenticatedUserId();

  if (userId === toUserId) {
    return { error: "Cannot add yourself as a friend" };
  }

  // Verify the user exists
  const userExists = await db.execute({
    sql: "SELECT id FROM children WHERE id = ?",
    args: [toUserId],
  });

  if (userExists.rows.length === 0) {
    return { error: "User not found" };
  }

  // Check if already friends
  const existingFriendship = await db.execute({
    sql: `
      SELECT 1 FROM friendships
      WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
    `,
    args: [userId, toUserId, toUserId, userId],
  });

  if (existingFriendship.rows.length > 0) {
    return { error: "Already friends" };
  }

  // Check if request already exists (in either direction)
  const existingRequest = await db.execute({
    sql: `
      SELECT id, from_user_id FROM friend_requests
      WHERE status = 'pending'
        AND ((from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?))
    `,
    args: [userId, toUserId, toUserId, userId],
  });

  if (existingRequest.rows.length > 0) {
    const request = existingRequest.rows[0] as any;
    if (request.from_user_id === toUserId) {
      return { error: "They already sent you a request! Check your pending requests." };
    }
    return { error: "Friend request already sent" };
  }

  // Create friend request
  const requestId = uuidv4();
  await db.execute({
    sql: "INSERT INTO friend_requests (id, from_user_id, to_user_id) VALUES (?, ?, ?)",
    args: [requestId, userId, toUserId],
  });

  // Create activity notification
  await db.execute({
    sql: `
      INSERT INTO activities (id, type, actor_id, target_user_id, content)
      VALUES (?, 'friend_request', ?, ?, 'sent you a friend request!')
    `,
    args: [uuidv4(), userId, toUserId],
  });

  revalidatePath("/dashboard/friends");
  return { success: true };
}

export async function getFriendRequests() {
  const userId = await getAuthenticatedUserId();

  const result = await db.execute({
    sql: `
      SELECT fr.id, fr.from_user_id, fr.created_at, c.username, c.display_name, c.avatar_url
      FROM friend_requests fr
      JOIN children c ON fr.from_user_id = c.id
      WHERE fr.to_user_id = ? AND fr.status = 'pending'
      ORDER BY fr.created_at DESC
    `,
    args: [userId],
  });

  return result.rows.map((row: any) => ({
    id: row.id,
    fromUserId: row.from_user_id,
    username: row.username,
    displayName: row.display_name,
    avatar: row.avatar_url,
    createdAt: row.created_at,
  }));
}

export async function getSentFriendRequests() {
  const userId = await getAuthenticatedUserId();

  const result = await db.execute({
    sql: `
      SELECT fr.id, fr.to_user_id, fr.created_at, c.username, c.display_name, c.avatar_url
      FROM friend_requests fr
      JOIN children c ON fr.to_user_id = c.id
      WHERE fr.from_user_id = ? AND fr.status = 'pending'
      ORDER BY fr.created_at DESC
    `,
    args: [userId],
  });

  return result.rows.map((row: any) => ({
    id: row.id,
    toUserId: row.to_user_id,
    username: row.username,
    displayName: row.display_name,
    avatar: row.avatar_url,
    createdAt: row.created_at,
  }));
}

export async function cancelFriendRequest(requestId: string) {
  const userId = await getAuthenticatedUserId();

  // Verify the request was sent by this user
  const request = await db.execute({
    sql: "SELECT from_user_id FROM friend_requests WHERE id = ? AND status = 'pending'",
    args: [requestId],
  });

  if (request.rows.length === 0) {
    return { error: "Request not found" };
  }

  const req = request.rows[0] as any;
  if (req.from_user_id !== userId) {
    return { error: "Unauthorized" };
  }

  // Delete the request
  await db.execute({
    sql: "DELETE FROM friend_requests WHERE id = ?",
    args: [requestId],
  });

  revalidatePath("/dashboard/friends");
  return { success: true };
}

export async function acceptFriendRequest(requestId: string) {
  const userId = await getAuthenticatedUserId();

  // Get the request and verify it's for this user
  const request = await db.execute({
    sql: "SELECT from_user_id, to_user_id FROM friend_requests WHERE id = ? AND status = 'pending'",
    args: [requestId],
  });

  if (request.rows.length === 0) {
    return { error: "Request not found" };
  }

  const req = request.rows[0] as any;
  if (req.to_user_id !== userId) {
    return { error: "Unauthorized" };
  }

  // Update request status
  await db.execute({
    sql: "UPDATE friend_requests SET status = 'accepted' WHERE id = ?",
    args: [requestId],
  });

  // Create friendship
  await db.execute({
    sql: "INSERT INTO friendships (user_id, friend_id) VALUES (?, ?)",
    args: [req.from_user_id, userId],
  });

  // Create activity for both users
  await db.execute({
    sql: `
      INSERT INTO activities (id, type, actor_id, target_user_id, content)
      VALUES (?, 'new_friend', ?, ?, 'accepted your friend request!')
    `,
    args: [uuidv4(), userId, req.from_user_id],
  });

  revalidatePath("/dashboard/friends");
  return { success: true };
}

export async function declineFriendRequest(requestId: string) {
  const userId = await getAuthenticatedUserId();

  // Verify the request is for this user
  const request = await db.execute({
    sql: "SELECT to_user_id FROM friend_requests WHERE id = ? AND status = 'pending'",
    args: [requestId],
  });

  if (request.rows.length === 0) {
    return { error: "Request not found" };
  }

  const req = request.rows[0] as any;
  if (req.to_user_id !== userId) {
    return { error: "Unauthorized" };
  }

  // Update request status
  await db.execute({
    sql: "UPDATE friend_requests SET status = 'declined' WHERE id = ?",
    args: [requestId],
  });

  revalidatePath("/dashboard/friends");
  return { success: true };
}

export async function removeFriend(friendId: string) {
  const userId = await getAuthenticatedUserId();

  // Delete friendship in either direction
  await db.execute({
    sql: `
      DELETE FROM friendships
      WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
    `,
    args: [userId, friendId, friendId, userId],
  });

  revalidatePath("/dashboard/friends");
  return { success: true };
}

export async function getMyInvites() {
  const userId = await getAuthenticatedUserId();

  // Get pending invites where the hang is open (creator's parent approved)
  const result = await db.execute({
    sql: `
      SELECT
        hi.hang_id,
        hi.status,
        hi.created_at as invited_at,
        h.title,
        h.scheduled_at,
        h.suggested_by,
        h.parent_approved as hang_open,
        u.name as suggested_by_name,
        u.avatar as suggested_by_avatar
      FROM hang_invites hi
      JOIN hangs h ON hi.hang_id = h.id
      JOIN users u ON h.suggested_by = u.id
      WHERE hi.user_id = ? AND hi.status = 'pending' AND h.parent_approved = 1
      ORDER BY h.scheduled_at ASC
    `,
    args: [userId],
  });

  return result.rows.map((row: any) => ({
    hangId: row.hang_id,
    title: row.title,
    scheduledAt: row.scheduled_at,
    suggestedBy: row.suggested_by,
    suggestedByName: row.suggested_by_name,
    suggestedByAvatar: row.suggested_by_avatar,
    invitedAt: row.invited_at,
  }));
}

export async function acceptHangInvite(hangId: string) {
  const userId = await getAuthenticatedUserId();

  // Verify invite exists and is pending
  const invite = await db.execute({
    sql: "SELECT status FROM hang_invites WHERE hang_id = ? AND user_id = ?",
    args: [hangId, userId],
  });

  if (invite.rows.length === 0) {
    return { error: "Invite not found" };
  }

  if ((invite.rows[0] as any).status !== "pending") {
    return { error: "Invite already responded to" };
  }

  // Update invite status
  await db.execute({
    sql: "UPDATE hang_invites SET status = 'accepted' WHERE hang_id = ? AND user_id = ?",
    args: [hangId, userId],
  });

  // Add user to participants with parent_approved = 0
  await db.execute({
    sql: "INSERT INTO hang_participants (hang_id, user_id, parent_approved) VALUES (?, ?, 0)",
    args: [hangId, userId],
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function declineHangInvite(hangId: string) {
  const userId = await getAuthenticatedUserId();

  // Verify invite exists and is pending
  const invite = await db.execute({
    sql: "SELECT status FROM hang_invites WHERE hang_id = ? AND user_id = ?",
    args: [hangId, userId],
  });

  if (invite.rows.length === 0) {
    return { error: "Invite not found" };
  }

  if ((invite.rows[0] as any).status !== "pending") {
    return { error: "Invite already responded to" };
  }

  // Update invite status
  await db.execute({
    sql: "UPDATE hang_invites SET status = 'declined' WHERE hang_id = ? AND user_id = ?",
    args: [hangId, userId],
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function inviteParent(parentEmail: string) {
  if (!parentEmail || !parentEmail.includes("@")) {
    return { error: "Please enter a valid email address" };
  }

  const result = await sendParentInviteEmail(parentEmail);

  if (result.error) {
    return { error: "Failed to send email. Please try again." };
  }

  return { success: true };
}
