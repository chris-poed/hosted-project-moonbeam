import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { socket } from "../socket"


export function CreateGame(){
    const [displayName, setDisplayName] = useState("");
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        function onConnect() {
          setIsConnected(true);
          console.log(socket.id, "<-------- frontend socket id")
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

            console.log("NAVIGATING", response);
    
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
    <div>
        <h2>Create a game</h2>
        <p>Socket status: {isConnected ? "connected": "disconnected"}</p>

        <form onSubmit={handleCreateGame}>
        <div>
            <label htmlFor="create-display-name"> Display name</label>
            <input
                id="create-display-name"
                type="text"
                value={displayName}
                onChange={(event)=> setDisplayName(event.target.value)}
                placeholder="Enter your display name"

            />
        </div>

        {error && <p>{error}</p>}

        <div> 
          <button type="submit">CreateGame</button>
        
        
        </div>

        </form>
    </div>

)

}