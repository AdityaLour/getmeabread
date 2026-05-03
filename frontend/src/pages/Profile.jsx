import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function Profile() {
  const { username } = useParams();

  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("public");

  useEffect(
    () => {
      const fetchProfile = async () => {
        try {
          setLoading(true);

          const res = await api.get(`/api/users/${username}`, {
            params: { type: tab },
          });

          setUser(res.data.user);
          setNotes(res.data.notes);
        } catch (err) {
          console.log("PROFILE ERROR:", err.response?.data);
        } finally {
          setLoading(false);
        }
      };

      if (username) {
        fetchProfile();
      }
    },
    [username],
    tab,
  );

  if (loading) return <p>Loading...</p>;

  if (!user) return <p>User not found</p>;

  return (
    <div>
      <h2>{user.username}</h2>

      <p>Followers: {user.followersCount}</p>
      <p>Following: {user.followingCount}</p>

      <div>
        <button onClick={() => setTab("public")}>Public</button>
        <button onClick={() => setTab("private")}>Private</button>
      </div>
      <h3>Notes</h3>

      {notes.length === 0 ? (
        <p>No notes yet</p>
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
