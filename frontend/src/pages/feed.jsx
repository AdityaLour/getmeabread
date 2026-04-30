import { useEffect, useState } from "react";
import api from "../api/axios";

function Feed() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await api.get("/api/notes/feed");
        setNotes(res.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchFeed();
  }, []);

  return (
    <div>
      <h2>Feed</h2>
      {notes.map((note) => (
        <div key={note._id}>
          <h3>{note.title}</h3>
          <p>{note.content}</p>
          <p>By:{note.userId?.username}</p>
        </div>
      ))}
    </div>
  );
}

export default Feed;
