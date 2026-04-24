import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

export function JoinGame() {

    const [displayName, setDisplayName] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [error, setError ] = useState("");

    const navigate = useNavigate();

     function handleSubmit(event){
        event.preventDefault();
        setError("");
        console.log("INSIDE GAME:JOIN HANDLE SUBMIT");
        console.log("DISPLAYNAME", displayName);
         console.log("DISPLAYNAME", joinCode);

        if(!displayName.trim()){
            console.log("STOPPING: displayname")
            setError("Enter a display name");
            return;
        }


        if(!joinCode.trim()){
            console.log("STOPPING: join code")
            setError("Enter a join code name");
            return;
        }
        if(!socket.connected){
            console.log("Socket not connected");
            socket.connect();
        }
        
       
        socket.emit("game:join", {
            display_name:displayName.trim(),
            join_code:joinCode.trim().toUpperCase(),
        },
        (response) => {

            console.log("GAME:JOIN---->", response);
            if(!response.ok){
                setError(response?.error|| "Game join failed");
                return;
            }

            console.log("game:join response---->", response);
            //TODO: Add response data to local storage
            navigate("/lobby", {
                state:{
                    lobby:response.lobby,
                    playerId:response.player_id
                }
            })

        }
        );
    }
    return (
        <div>
            <h2>Join a Game</h2>
            <form onSubmit={handleSubmit}>
                <div>

                    <label htmlFor="join-display-name">Display name</label>
                    <input
                    id="join-display-name"
                    type="text"
                    value={displayName}
                    onChange={(event)=> setDisplayName(event.target.value)}
                    placeholder="Enter display name"

                    />
                    
                </div>

                <div>

                    <label htmlFor="join-code">Game pin</label>
                    <input
                    id="join-code"
                    type="text"
                    value={joinCode}
                    onChange={(event)=> setJoinCode(event.target.value)}
                    placeholder="Enter game pin"

                    />
                    
                </div>
                {error && <p>{error}</p>}

                <button type="submit">Join Game</button>
            </form>
        </div>
    )
}