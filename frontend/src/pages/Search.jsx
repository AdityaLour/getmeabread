import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function FinalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], notes: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const delay = setTimeout(() => {
      if (query.trim().length < 2) {
        setResults({ users: [], notes: [] });
        return;
      }
      fetchResults();
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/api/search", {
        params: { q: query.trim() },
      });

      setResults(res.data);
    } catch (err) {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Search</h2>

      <input
        type="text"
        placeholder="Search users or notes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <p>Searching...</p>}
      {error && <p>{error}</p>}

      {!loading &&
        query &&
        results.users.length === 0 &&
        results.notes.length === 0 && <p>No results found</p>}

      {results.users.length > 0 && (
        <>
          <h3>Users</h3>
          {results.users.map((user) => (
            <div
              key={user._id}
              onClick={() => navigate(`/profile/${user.username}`)}
            >
              {user.username}
            </div>
          ))}
        </>
      )}

      {results.notes.length > 0 && (
        <>
          <h3>Notes</h3>
          {results.notes.map((note) => (
            <div
              key={note._id}
              onClick={() => navigate(`/notes/${note._id}`)}
            >
              <strong>{note.title}</strong>
              <p>by {note.userId?.username}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default FinalSearch;