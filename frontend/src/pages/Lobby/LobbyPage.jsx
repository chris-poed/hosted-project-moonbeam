import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../../socket";

export function Lobby() {

    const location = useLocation();
    const navigate = useNavigate();

    const [lobby, setLobby]= useState(location.state?.lobby||null);
    const [playerId, setPlayerId] = useState(location.state?.playerId || null);
    const [error, setError] = useState("");

    //we need to wrap the following code in a useeffect in this particular instance
    //because data initially comes from a navigate transistion when host creates game or player is added - this only needs to run once
    //Further updates will be through broadcast updates when players join so we don't want this code to run again when lobby
    //broadccats update events occur
    
    useEffect(()=>{
        if(!playerId){
            const storedPlayerId = localStorage.getItem("playerId");
            if(storedPlayerId){
                setPlayerId(storedPlayerId)
            }
        }
    }, [playerId])

    useEffect(()=>{
        if(!lobby && location.state?.lobby){
            setLobby(location.state.lobby);
        }
    },[location.state, lobby]);

    useEffect(()=>{
        function handleLobbyUpdated(updatedLobby){
            setLobby(updatedLobby);
        }

        socket.on("lobby:updated", handleLobbyUpdated);

        return ()=> {
            socket.off("lobby:updated", handleLobbyUpdated)
        };
    }, []);

    useEffect(() => {

        function handleGameStarted(gameStartPayload) {
            navigate("/gamescreen", {
            state: {
                gameState: gameStartPayload,
                playerId: playerId
            },
            });
        }

        socket.on("game:started", handleGameStarted);

        return () => {
            socket.off("game:started", handleGameStarted);
        };
    }, [navigate, playerId]);

    if(!lobby){
        return (
            <div>
                <h1>Lobby Page</h1>
                <p>No lobby data available.</p>
            </div>
        )
    }

    const isHost = lobby.game_host === playerId;

    function handleStartGame(){
        socket.emit("game:start",
            {
                player_id: playerId,
                join_code: lobby.join_code
            },
            (response)=>{
                if(!response.ok){
                    setError(response.error || "Failed to start game");
                    return;
                }
            }
        )
    }
    
    return(
        <div>
            <h1>Lobby Page</h1>

            <p><strong>Game pin:</strong> {lobby.join_code}</p>

            <h2>Players</h2>

            {lobby.players.length > 0 ? (
                <ul>
                    {lobby.players.map((player)=> (
                        <li key={player.player_id}>
                            {player.display_name}
                            {player.player_id === lobby.game_host ? "(host)": ""}
                            {player.is_connected ? "connected": "disconnected"}
                        </li>
                ))}
                </ul>
            ):(
                <p>No players have joined</p>

            )}

            {isHost ? (
                <button type="button" onClick={handleStartGame}>Start Game</button>
            ):(
                <button type="button" disabled>
                    Waiting for host to start
                </button>
            )}

        </div>
    );

}
