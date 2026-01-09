import { db } from "./db";

// Mock Data from Dashboard
const FRIENDS = [
  {
    id: "1",
    name: "Alex",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  },
  {
    id: "2",
    name: "Jordan",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
  },
  {
    id: "3",
    name: "Riley",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Riley",
  },
  {
    id: "4",
    name: "Casey",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Casey",
  },
  {
    id: "5",
    name: "Sam",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
  },
  {
    id: "6",
    name: "Charlie",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
  },
  {
    id: "7",
    name: "Taylor",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor",
  },
  {
    id: "8",
    name: "Morgan",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan",
  },
];

const INITIAL_HANGS = [
  {
    id: "h1",
    title: "Sleepover & Gaming",
    time: "2026-01-09T19:00:00Z", // Approximating Friday 7 PM
    suggestedBy: "1", // Alex
    friendsIn: ["1", "2", "3", "6", "7"],
    status: "suggested",
    parentCool: 0,
  },
  {
    id: "h2",
    title: "Park Soccer",
    time: "2026-01-09T15:30:00Z", // Approximating Tomorrow 3:30 PM
    suggestedBy: "2", // Jordan
    friendsIn: ["2", "4", "5", "1", "8", "6"],
    status: "confirmed",
    parentCool: 1,
  },
];

// Current User (Hardcoded for now as requested)
const ME = {
  id: "me",
  name: "Me",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Me",
  status: "Active",
  is_online: 1,
};

async function seed() {
  console.log("Seeding database...");

  // Insert Current User
  await db.execute({
    sql: "INSERT OR REPLACE INTO users (id, name, avatar, status, is_online) VALUES (?, ?, ?, ?, ?)",
    args: [ME.id, ME.name, ME.avatar, ME.status, ME.is_online],
  });

  // Insert Friends (as users)
  for (const friend of FRIENDS) {
    await db.execute({
      sql: "INSERT OR REPLACE INTO users (id, name, avatar, status, is_online) VALUES (?, ?, ?, ?, ?)",
      args: [friend.id, friend.name, friend.avatar, "Offline", 0],
    });

    // Create friendships
    await db.execute({
      sql: "INSERT OR IGNORE INTO friendships (user_id, friend_id) VALUES (?, ?)",
      args: [ME.id, friend.id],
    });
  }

  // Insert Hangs
  for (const hang of INITIAL_HANGS) {
    await db.execute({
      sql: "INSERT OR REPLACE INTO hangs (id, title, scheduled_at, suggested_by, parent_approved, status) VALUES (?, ?, ?, ?, ?, ?)",
      args: [
        hang.id,
        hang.title,
        hang.time,
        hang.suggestedBy,
        hang.parentCool,
        hang.status,
      ],
    });

    // Insert Participants
    for (const userId of hang.friendsIn) {
      await db.execute({
        sql: "INSERT OR IGNORE INTO hang_participants (hang_id, user_id) VALUES (?, ?)",
        args: [hang.id, userId],
      });
    }
  }

  // Add "Me" to hangs
  await db.execute({
    sql: "INSERT OR IGNORE INTO hang_participants (hang_id, user_id) VALUES (?, ?)",
    args: ["h2", "me"],
  });

  // Add some activity
  await db.execute({
    sql: "INSERT OR REPLACE INTO activities (id, type, actor_id, target_user_id, content, hang_id) VALUES (?, ?, ?, ?, ?, ?)",
    args: [
      "a1",
      "hang_suggested",
      "1",
      "me",
      "Alex suggested Sleepover & Gaming",
      "h1",
    ],
  });

  console.log("Seeding completed successfully.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error seeding database:", err);
    process.exit(1);
  });
