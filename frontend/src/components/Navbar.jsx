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

  const handleProfileClick = () => {
    const username = localStorage.getItem("username");

    if (!username || username.trim() === "") {
      localStorage.setItem("redirectAfterLogin", `/profile/${username}`);
      navigate("/login");
      return;
    }

    navigate(`/profile/${username}`);
  };

  return (
    <div>
      {/* Logo */}
      <h2 onClick={() => navigate("/feed")}>MyApp</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Profile */}
      <button onClick={handleProfileClick}>Profile</button>

      {/* Loading */}
      {loading && <p>Searching...</p>}

      {/* No results */}
      {query.trim().length >= 2 &&
        results.users.length === 0 &&
        results.notes.length === 0 &&
        !loading && <p>No results found</p>}

      {/* Users */}
      {results.users.map((user) => (
        <div
          key={user._id}
          onClick={() => navigate(`/profile/${user.username}`)}
        >
          {user.username}
        </div>
      ))}

      {/* Notes */}
      {results.notes.map((note) => (
        <div key={note._id} onClick={() => navigate(`/notes/${note._id}`)}>
          {note.title}
        </div>
      ))}
    </div>
  );
}

export default Navbar;
