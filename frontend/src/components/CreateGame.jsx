import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { socket } from "../socket"
import "./CreateGame.css";

export function CreateGame(){
    const [displayName, setDisplayName] = useState("");
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        function onConnect() {
          setIsConnected(true);
        }
    
        function onDisconnect() {
          setIsConnected(false);
        }
    
        socket.connect() 
    
        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

         return () => {
          socket.off("connect", onConnect);
          socket.off("disconnect", onDisconnect);
        };
      }, []);

      function handleCreateGame(event){
        event.preventDefault();
        setError("");

        if(!displayName.trim()){
            setError("Please enter a display name");
            return;
        }

        socket.emit(
          "game:create",
          {display_name: displayName.trim()},
          (response)=>{
            if(!response.ok){
              setError(response.error || "Failed to create game");
              return;
            }
            
            localStorage.setItem("playerId", response.player_id);
            localStorage.setItem("roomCode", response.join_code);
            localStorage.setItem("gameID", response.game_id);
    
            navigate("/lobby", {
                state:{
                    lobby:response.lobby,
                    playerId:response.player_id
                }
            })
          }
    
        )

      }


return (
    <div className="create-root">
      <div className="create-card">

        <h1 className="create-title">Create Game</h1>

        <span className={`create-status ${isConnected ? "create-status--on" : "create-status--off"}`}>
          {isConnected ? "● Connected" : "○ Disconnected"}
        </span>

        <form className="create-form" onSubmit={handleCreateGame}>
          <div className="create-field">
            <label className="create-label" htmlFor="create-display-name">
              Display Name
            </label>
            <input
              className="create-input"
              id="create-display-name"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Enter your display name"
            />
          </div>

          {error && <p className="create-error">{error}</p>}

          <button className="btn btn-primary" type="submit">
            Create Game
          </button>
        </form>

      </div>
    </div>

);

}