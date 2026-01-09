import { db } from "./db";

async function fixSchema() {
  console.log("Checking and updating schema...");
  try {
    // Check if columns exist by trying to select them
    await db.execute(
      "SELECT email_verified, verification_token FROM parents LIMIT 1"
    );
    console.log("Schema is already up to date.");
  } catch (err: any) {
    console.log("Updating schema...");
    try {
      await db.execute(
        "ALTER TABLE parents ADD COLUMN email_verified INTEGER DEFAULT 0"
      );
      console.log("Added email_verified column.");
    } catch (e: any) {
      console.log("email_verified column might already exist:", e.message);
    }

    try {
      await db.execute(
        "ALTER TABLE parents ADD COLUMN verification_token TEXT"
      );
      console.log("Added verification_token column.");
    } catch (e: any) {
      console.log("verification_token column might already exist:", e.message);
    }
  }
}

fixSchema()
  .then(() => {
    console.log("Schema fix completed.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Schema fix failed:", err);
    process.exit(1);
  });
