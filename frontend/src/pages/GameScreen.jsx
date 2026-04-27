import { useLocation } from "react-router-dom";
import { useState } from "react"

export function GameScreen() {

    const location = useLocation();

    const gameState = location.state?.gameState;
    const playerId = location.state?.playerId;

    const [phase, setPhase] = useState(gameState.phase)

    const myPlayer = gameState.players.find((player) => {
        return player.player_id === playerId;
    });

    console.log("GameScreen location.state:", location.state);
    console.log("GameScreen gameState:", gameState);
    console.log("GameScreen playerId:", playerId);
    console.log("Phase:", phase);

    return (
        <>
            <h1>The gamescreen</h1>
            <h3>Round number: {gameState.round_no}</h3>
            <h3>Current players turn: {gameState.current_player.display_name}</h3>
            <h3>My name: {myPlayer?.display_name}</h3>
            <h3>Phase: {phase}</h3>
            <h3>Countdown: </h3>
        </>
    )
}