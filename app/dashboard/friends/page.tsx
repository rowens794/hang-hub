import { getFriends } from "@/lib/actions";
import FriendsClient from "./FriendsClient";

export default async function FriendsPage() {
  const friends = await getFriends();

  return <FriendsClient initialFriends={friends as any} />;
}
