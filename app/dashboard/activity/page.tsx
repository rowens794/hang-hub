import { getActivities } from "@/lib/actions";
import ActivityClient from "./ActivityClient";

export default async function ActivityPage() {
  const activities = await getActivities();

  return <ActivityClient initialActivities={activities as any} />;
}
