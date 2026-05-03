import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Feed() {
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await api.get("/api/notes/feed");
        setNotes(res.data.notes || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchFeed();
  }, []);

  if (notes.length === 0) {
    return <p>No notes available</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      {notes.map((note) => (
        <div
          key={note._id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
          }}
        >
          <h3>{note.title}</h3>

          <p>{note.desc}</p>

          <p>
            <strong>By:</strong>{" "}
            <span
              style={{ cursor: "pointer", color: "blue" }}
              onClick={() => {
                if (note.userId?.username) {
                  navigate(`/profile/${note.userId.username}`);
                }
              }}
            >
              {note.userId?.username || "Unknown"}
            </span>
          </p>

          <p>Likes: {note.likesCount || 0}</p>

          <button
            onClick={() => navigate(`/notes/${note._id}`)}
            style={{ marginTop: "10px" }}
          >
            View
          </button>
        </div>
      ))}
    </div>
  );
}

export default Feed;
