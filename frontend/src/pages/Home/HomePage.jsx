import { useEffect, useState } from "react";
import { CreateGame } from "../../components/CreateGame";
import { JoinGame } from "../../components/JoinGame";
import { socket } from "../../socket";
import "./HomePage.css";

export function HomePage() {
  const [activeView, setActiveView] = useState(null);

  useEffect(() => {
    socket.connect();
  }, []);

  return (
    <div className="landing-root">

      <div className="blob blob-pink" />
      <div className="blob blob-purple" />
      <div className="ring ring-lg" />
      <div className="ring ring-md" />

      {!activeView && (
        <div className="landing-content">
          <p className="eyebrow">Music Timeline Game</p>
          <h1 className="logo">SNIPPIT</h1>
          <p className="tagline">Guess the year. Beat your friends.</p>

          <div className="button-group">
            <button className="btn btn-primary" onClick={() => setActiveView("create")}>
              Create Game
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveView("join")}>
              Join Game
            </button>
          </div>

          <p className="landing-note">No account needed &nbsp;·&nbsp; Multiplayer</p>
        </div>
      )}

      {activeView === "create" && <CreateGame />}
      {activeView === "join" && <JoinGame />}

    </div>
  );
}
