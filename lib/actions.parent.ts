"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function getChildrenAction() {
  const session = await getSession();
  if (!session || session.role !== "parent") return [];

  const result = await db.execute({
    sql: "SELECT id, username, display_name, avatar_url FROM children WHERE parent_id = ?",
    args: [session.userId],
  });

  return result.rows;
}
