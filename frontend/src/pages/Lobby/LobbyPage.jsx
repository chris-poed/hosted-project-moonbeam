import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../../socket";
import "./LobbyPage.css";

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
            <div className="lobby-root">
                <div className="lobby-root__before" />
                <div className="lobby-card">
                <h1 className="lobby-title">Lobby</h1>
                <p className="lobby-empty">No lobby data available.</p>
                </div>
            </div>
            );
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
        <div className="lobby-root">
            <div className="lobby-card">
                <h1 className="lobby-title">Lobby</h1>

                <div className="lobby-pin">
                <span className="lobby-pin__label">Game Pin</span>
                <span className="lobby-pin__code">{lobby.join_code}</span>
                </div>

                <h2 className="lobby-players-heading">Players</h2>

                {lobby.players.length > 0 ? (
                <ul className="lobby-players">
                    {lobby.players.map((player) => (
                    <li key={player.player_id} className="lobby-player">
                        <span className="lobby-player__name">{player.display_name}</span>
                        <div className="lobby-player__tags">
                        {player.player_id === lobby.game_host && (
                            <span className="lobby-tag lobby-tag--host">Host</span>
                        )}
                        <span className={`lobby-tag ${player.is_connected ? "lobby-tag--connected" : "lobby-tag--disconnected"}`}>
                            {player.is_connected ? "Connected" : "Disconnected"}
                        </span>
                        </div>
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="lobby-empty">No players have joined yet...</p>
                )}

                {error && <p className="lobby-error">{error}</p>}

                {isHost ? (
                <button className="btn btn-primary" type="button" onClick={handleStartGame}>
                    Start Game
                </button>
                ) : (
                <button className="btn btn-waiting" type="button" disabled>
                    Waiting for host...
                </button>
                )}
            </div>
        </div>
    );

}
