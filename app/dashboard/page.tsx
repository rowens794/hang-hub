import { getHangs, getFriends, getUserProfile } from "@/lib/actions";
import DashboardClient from "./DashboardClient";

export default async function Dashboard() {
  const hangs = await getHangs();
  const friends = await getFriends();
  const currentUser = await getUserProfile();

  return (
    <DashboardClient
      initialHangs={hangs}
      friends={friends}
      currentUser={currentUser}
    />
  );
}
