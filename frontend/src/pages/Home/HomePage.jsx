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
    <div>
      <h1>Hitster</h1>
      {!activeView && (
        <div>
          <button onClick={() => setActiveView("create")}>
            Create a game
          </button>
          <button onClick={() => setActiveView("join")}>
            Join a game
          </button>
        </div>
      )}
      {activeView === "create" && <CreateGame />}
      {activeView === "join" && <JoinGame />}
    </div>
  );
}
