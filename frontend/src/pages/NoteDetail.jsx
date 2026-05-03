import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function NoteDetail() {
  const { id } = useParams();

  const [note, setNote] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const noteRes = await api.get(`/api/notes/${id}`);
        const commentRes = await api.get(`/api/notes/${id}/comments`);

        const data = noteRes.data;

        // ✅ IMPORTANT: include isLiked + likesCount
        setNote({
          ...data.note,
          isLiked: data.isLiked,
          likesCount: data.likesCount,
        });

        setComments(commentRes.data.comments || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddComment = async () => {
    if (!text.trim()) return;

    setPosting(true);

    try {
      const res = await api.post(`/api/notes/${id}/comments`, {
        text,
      });

      setComments((prev) => [res.data.newComment, ...prev]);
      setText("");
    } catch (err) {
      console.log(err);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async () => {
    if (liking) return;

    setLiking(true);

    try {
      const res = await api.post(`/api/notes/${id}/toggle-like`);

      setNote((prev) =>
        prev
          ? {
              ...prev,
              isLiked: res.data.liked,
              likesCount: res.data.likesCount,
            }
          : prev
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLiking(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!note) return <div>No note found</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{note.title}</h1>

      <p>
        <strong>By:</strong> {note.userId?.username || "Unknown"}
      </p>

      <p>{note.content}</p>

      <hr />

      <p>Likes: {note.likesCount || 0}</p>

      <button onClick={handleLike} disabled={liking}>
        {liking ? "..." : note.isLiked ? "❤️ Unlike" : "🤍 Like"}
      </button>

      <h3>Comments</h3>

      {comments.length === 0 ? (
        <p>No comments yet</p>
      ) : (
        comments.map((c) => (
          <div key={c._id} style={{ marginBottom: "10px" }}>
            <p>
              <strong>{c.userId?.username || "User"}</strong>
            </p>
            <p>{c.text}</p>
          </div>
        ))
      )}

      <hr />

      <h3>Add Comment</h3>

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
        style={{ padding: "8px", width: "300px" }}
      />

      <button
        onClick={handleAddComment}
        disabled={posting}
        style={{ marginLeft: "10px", padding: "8px" }}
      >
        {posting ? "Posting..." : "Add"}
      </button>
    </div>
  );
}

export default NoteDetail;