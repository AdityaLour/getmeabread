import { useEffect, useState } from "react";
import api from "../api/axios";

function Feed() {
  const [notes, setNotes] = useState([]);
  const [loadingIds, setLoadingIds] = useState([]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await api.get("/api/notes/feed");
        setNotes(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchFeed();
  }, []);

  const handleLike = async (noteId) => {
    if (loadingIds.includes(noteId)) return;

    setLoadingIds((prev) => [...prev, noteId]);

    try {
      const res = await api.post(`/api/notes/${noteId}/toggle-like`);

      setNotes((prev) =>
        prev.map((note) =>
          note._id === noteId
            ? {
                ...note,
                likedByMe: res.data.liked,
                likesCount: res.data.likesCount,
              }
            : note,
        ),
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== noteId));
    }
  };

  return (
    <div>
      <h2>Feed</h2>

      {notes.map((note) => (
        <div
          key={note._id}
          style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}
        >
          <h3>{note.title}</h3>
          <p>{note.content}</p>
          <p>By: {note.userId?.username}</p>

          <p>Likes: {note.likesCount || 0}</p>

          <button
            onClick={() => handleLike(note._id)}
            disabled={loadingIds.includes(note._id)}
          >
            {loadingIds.includes(note._id)
              ? "..."
              : note.likedByMe
                ? "❤️ Unlike"
                : "🤍Like"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default Feed;
