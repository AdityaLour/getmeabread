import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Feed from "./pages/feed";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/feed" element={<Feed />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
