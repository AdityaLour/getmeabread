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

  return (
    <div>
      {notes.length === 0 ? (
        <p>No notes available</p>
      ) : (
        notes.map((note) => (
          <div key={note._id}>
            <h3>{note.title}</h3>
            <p>{note.desc}</p>
            <p>By: {note.userId?.username}</p>

            <button onClick={() => navigate(`/notes/${note._id}`)}>View</button>
          </div>
        ))
      )}
    </div>
  );
}

export default Feed;
