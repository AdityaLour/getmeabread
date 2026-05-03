import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function Profile() {
  const { username } = useParams();

  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isOwner, setIsOwner] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [tab, setTab] = useState("public");

  // Get logged in username directly from token payload
  const getLoggedInUsername = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.username?.toLowerCase();
    } catch {
      return null;
    }
  };

  const loggedInUsername = getLoggedInUsername();
  const isCurrentUser = loggedInUsername === username?.toLowerCase();

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/api/users/${username}`, {
        params: { type: tab },
      });

      setUser(res.data.user);
      setNotes(res.data.notes);
      setIsOwner(res.data.isOwner);
      setIsFollowing(res.data.isFollowing);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username, tab]);

  const handleFollow = async () => {
    if (followLoading) return;

    try {
      setFollowLoading(true);

      const res = await api.post(`/api/follow/${username}/toggle`);

      setIsFollowing(res.data.isFollowing);
      setUser((prev) => ({
        ...prev,
        followersCount: res.data.followersCount,
        followingCount: res.data.followingCount,
      }));
    } catch (err) {
      if (err.response) {
        console.log(err.response.data.message);
      } else {
        console.log(err);
      }
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div>
      <h2>{user.username}</h2>

      <p>Followers: {user.followersCount}</p>
      <p>Following: {user.followingCount}</p>

      {!isCurrentUser && (
        <button onClick={handleFollow} disabled={followLoading}>
          {followLoading ? "..." : isFollowing ? "Unfollow" : "Follow"}
        </button>
      )}

      <div>
        <button onClick={() => setTab("public")}>Public</button>
        {isCurrentUser && (
          <button onClick={() => setTab("private")}>Private</button>
        )}
      </div>

      <h3>Notes</h3>

      {notes.length === 0 ? (
        <p>{tab === "private" ? "No private notes" : "No public notes"}</p>
      ) : (
        notes.map((note) => (
          <div key={note._id}>
            <h4>{note.title}</h4>
            <p>{note.content}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Profile;