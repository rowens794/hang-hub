import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import Link from "next/link";

interface Props {
  params: Promise<{ token: string }>;
}

async function processApprovalToken(token: string) {
  // Look up the token
  const tokenResult = await db.execute({
    sql: `
      SELECT t.*, h.title as hang_title, h.scheduled_at, c.display_name as child_name
      FROM hang_approval_tokens t
      JOIN hangs h ON t.hang_id = h.id
      JOIN children c ON t.child_id = c.id
      WHERE t.id = ?
    `,
    args: [token],
  });

  if (tokenResult.rows.length === 0) {
    return { error: "invalid", message: "This approval link is invalid or has expired." };
  }

  const tokenData = tokenResult.rows[0] as any;

  // Check if already used
  if (tokenData.used === 1) {
    return {
      error: "used",
      message: "This approval link has already been used.",
      action: tokenData.action,
      childName: tokenData.child_name,
      hangTitle: tokenData.hang_title,
    };
  }

  // Check if expired
  if (new Date(tokenData.expires_at) < new Date()) {
    return { error: "expired", message: "This approval link has expired." };
  }

  // Mark token as used
  await db.execute({
    sql: "UPDATE hang_approval_tokens SET used = 1 WHERE id = ?",
    args: [token],
  });

  // Also mark the paired token (approve/decline) as used to prevent double actions
  await db.execute({
    sql: `
      UPDATE hang_approval_tokens
      SET used = 1
      WHERE hang_id = ? AND child_id = ? AND id != ?
    `,
    args: [tokenData.hang_id, tokenData.child_id, token],
  });

  // Perform the action
  if (tokenData.action === "approve") {
    // Update participant status to approved (2)
    await db.execute({
      sql: "UPDATE hang_participants SET parent_approved = 2 WHERE hang_id = ? AND user_id = ?",
      args: [tokenData.hang_id, tokenData.child_id],
    });

    // Check if this child is the hang creator - if so, also approve the hang itself
    const hangResult = await db.execute({
      sql: "SELECT suggested_by FROM hangs WHERE id = ?",
      args: [tokenData.hang_id],
    });

    if (hangResult.rows.length > 0) {
      const hang = hangResult.rows[0] as any;
      if (hang.suggested_by === tokenData.child_id) {
        await db.execute({
          sql: "UPDATE hangs SET parent_approved = 1, status = 'parent_approved' WHERE id = ?",
          args: [tokenData.hang_id],
        });
      }
    }
  } else if (tokenData.action === "decline") {
    // Update participant status to declined (3)
    await db.execute({
      sql: "UPDATE hang_participants SET parent_approved = 3 WHERE hang_id = ? AND user_id = ?",
      args: [tokenData.hang_id, tokenData.child_id],
    });
  }

  revalidatePath("/parent/dashboard");
  revalidatePath("/dashboard");

  return {
    success: true,
    action: tokenData.action,
    childName: tokenData.child_name,
    hangTitle: tokenData.hang_title,
    scheduledAt: tokenData.scheduled_at,
  };
}

export default async function ApprovalPage({ params }: Props) {
  const { token } = await params;
  const result = await processApprovalToken(token);

  const formattedDate = result.scheduledAt
    ? new Date(result.scheduledAt).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4">
      <div className="w-full max-w-md text-center">
        {result.success ? (
          <>
            <div
              className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl ${
                result.action === "approve"
                  ? "bg-green-500/20 text-green-500"
                  : "bg-red-500/20 text-red-500"
              }`}
            >
              {result.action === "approve" ? "✓" : "✗"}
            </div>

            <h1 className="text-3xl font-black mb-2">
              {result.action === "approve" ? "Approved!" : "Declined"}
            </h1>

            <p className="text-[var(--muted)] text-lg mb-6">
              {result.action === "approve" ? (
                <>
                  <span className="font-bold text-[var(--foreground)]">{result.childName}</span> is
                  all set to attend:
                </>
              ) : (
                <>
                  You've declined <span className="font-bold text-[var(--foreground)]">{result.childName}</span>'s
                  request to attend:
                </>
              )}
            </p>

            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 mb-8">
              <p className="text-xl font-bold mb-1">{result.hangTitle}</p>
              {formattedDate && <p className="text-[var(--muted)]">{formattedDate}</p>}
            </div>

            <Link
              href="/parent/dashboard"
              className="inline-block bg-[#8b5cf6] hover:bg-[#7c4dff] text-white font-bold py-3 px-8 rounded-xl transition-all"
            >
              Go to Parent Dashboard
            </Link>
          </>
        ) : (
          <>
            <div className="w-24 h-24 bg-yellow-500/20 text-yellow-500 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl">
              !
            </div>

            <h1 className="text-3xl font-black mb-2">
              {result.error === "used" ? "Already Responded" : "Link Invalid"}
            </h1>

            <p className="text-[var(--muted)] text-lg mb-8">{result.message}</p>

            {result.error === "used" && result.hangTitle && (
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 mb-8">
                <p className="text-sm text-[var(--muted)] mb-2">Previous response:</p>
                <p className="font-bold">
                  {result.action === "approve" ? "Approved" : "Declined"} for {result.childName}
                </p>
                <p className="text-[var(--muted)]">{result.hangTitle}</p>
              </div>
            )}

            <Link
              href="/parent/dashboard"
              className="inline-block bg-[#8b5cf6] hover:bg-[#7c4dff] text-white font-bold py-3 px-8 rounded-xl transition-all"
            >
              Go to Parent Dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
