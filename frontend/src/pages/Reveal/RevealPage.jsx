import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { socket } from "../../socket";
import DragAndDrop from "../../components/DragAndDrop";
import CountdownTimer from "../../components/CountdownTimer";

export function RevealPage() {
  //Thi sis for demo purposes and needs to match the value in 
  const MAX_ROUNDS = 2;
  const location = useLocation();
  const navigate = useNavigate();

  const revealState = location.state?.revealState;
  const playerId = location.state?.playerId;
  const roomId = `game:${revealState.join_code}`;

  const isFinalRound = revealState.round_no >= MAX_ROUNDS;

  useEffect(() => {
    function handlePhaseChanged(updatedGameState) {
      if (updatedGameState.phase === "intro-countdown") {
        navigate("/gamescreen", {
          state: {
            gameState: updatedGameState,
            playerId,
          },
        });
      }

      if (updatedGameState.phase === "game-ended") {
        navigate("/gameover", {
          state: {
            gameState: updatedGameState,
            playerId,
          },
        });
      }
    }

    socket.on("game:phase_changed", handlePhaseChanged);

    return () => {
      socket.off("game:phase_changed", handlePhaseChanged);
    };
  }, [navigate, playerId]);


  if (!revealState) {
    return <p>No reveal data available.</p>;
  }

  return (
    <div>
      <h1>Reveal Phase</h1>

      <p>{revealState.reveal_message}</p>

      <p>
        <strong>Round:</strong> {revealState.round_no}
      </p>

      <p>
        <strong>Phase:</strong> {revealState.phase}
      </p>

      <p>
        <strong>Current player:</strong>{" "}
        {revealState.current_player?.display_name}
      </p>

      <h2>Players</h2>

      <ul>
        {revealState.players.map((player) => (
          <li key={player.player_id}>
            {player.display_name}
            {player.player_id === playerId ? " (you)" : ""}
          </li>
        ))}
      </ul>
       <CountdownTimer
        roomId={roomId}
        label={isFinalRound ? "Game ends in": "Next round starts in"}
        size="md"
      />
      <DragAndDrop />
     
    </div>
  );
}
