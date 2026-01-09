import { createClient } from "@libsql/client";

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_TOKEN;

if (!url) {
  throw new Error("TURSO_URL is not defined");
}

if (!authToken && !url.includes("file:")) {
  throw new Error("TURSO_TOKEN is not defined");
}

export const db = createClient({
  url,
  authToken,
});
