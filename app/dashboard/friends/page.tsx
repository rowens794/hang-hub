import { getFriends, getFriendRequests, getSentFriendRequests, getMyGroups } from "@/lib/actions";
import FriendsClient from "./FriendsClient";

export default async function FriendsPage() {
  const [friends, friendRequests, sentRequests, existingGroups] = await Promise.all([
    getFriends(),
    getFriendRequests(),
    getSentFriendRequests(),
    getMyGroups(),
  ]);

  return (
    <div>
      <FriendsClient
        initialFriends={friends as any}
        pendingRequests={friendRequests as any}
        sentRequests={sentRequests as any}
        existingGroups={existingGroups}
      />
    </div>
  );
}
