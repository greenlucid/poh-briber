import { HashRouter, Routes, Route, Link } from "react-router-dom"
import Auction from "./pages/Auction"
import Create from "./pages/Create"
import Home from "./pages/Home"

const AppBar = () => {
  return (
    <div className="appbar">
      <Link to={"/"}>Briber</Link>
      <Link to={"create"}>Create</Link>
    </div>
  )
}

const App = () => {
  return (
    <div>
      <HashRouter>
        <AppBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="auction/*" element={<Auction />} />
          <Route path="create" element={<Create />} />
        </Routes>
      </HashRouter>
    </div>
  )
}

export default App
