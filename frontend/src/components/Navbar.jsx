import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Navbar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], notes: [] });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ users: [], notes: [] });
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await api.get("/api/search", {
          params: { q: query.trim() },
        });

        setResults(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  return (
    <div>
      <h2 onClick={() => navigate("/feed")}>MyApp</h2>

      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <p>Searching...</p>}

      {query && results.users.length === 0 && results.notes.length === 0 && !loading && (
        <p>No results found</p>
      )}

      {results.users.map((user) => (
        <div
          key={user._id}
          onClick={() => navigate(`/profile/${user.username}`)}
        >
          {user.username}
        </div>
      ))}

      {results.notes.map((note) => (
        <div
          key={note._id}
          onClick={() => navigate(`/notes/${note._id}`)}
        >
          {note.title}
        </div>
      ))}
    </div>
  );
}

export default Navbar;