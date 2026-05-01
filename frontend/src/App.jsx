import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Feed from "./pages/feed";
import NoteDetail from "./pages/NoteDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/feed" element={<Feed />} />
        <Route path="/notes/:id" element={<NoteDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
