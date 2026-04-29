import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import "./JoinGame.css";

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
        <div className="join-root">
            <div className="join-card">

                <h1 className="join-title">Join Game</h1>

                <form className="join-form" onSubmit={handleSubmit}>
                <div className="join-field">
                    <label className="join-label" htmlFor="join-display-name">
                    Display Name
                    </label>
                    <input
                    className="join-input"
                    id="join-display-name"
                    type="text"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Enter your display name"
                    />
                </div>

                <div className="join-field">
                    <label className="join-label" htmlFor="join-code">
                    Game Pin
                    </label>
                    <input
                    className="join-input join-input--pin"
                    id="join-code"
                    type="text"
                    value={joinCode}
                    onChange={(event) => setJoinCode(event.target.value)}
                    placeholder="Enter game pin"
                    maxLength={8}
                    />
                </div>

                {error && <p className="join-error">{error}</p>}

                <button className="btn btn-primary" type="submit">
                    Join Game
                </button>
                </form>

            </div>
        </div>
    )
}