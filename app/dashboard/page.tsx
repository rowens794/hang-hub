import { getHangs, getFriends, getUserProfile, getMyInvites } from "@/lib/actions";
import DashboardClient from "./DashboardClient";

export default async function Dashboard() {
  const hangs = await getHangs();
  const friends = await getFriends();
  const currentUser = await getUserProfile();
  const invites = await getMyInvites();

  return (
    <DashboardClient
      initialHangs={hangs}
      friends={friends}
      currentUser={currentUser}
      initialInvites={invites}
    />
  );
}
