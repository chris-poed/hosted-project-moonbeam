import { useLocation } from "react-router-dom";
import DragAndDrop from "../../components/DragAndDrop";

export function RevealPage() {
  const location = useLocation();

  const revealState = location.state?.revealState;
  const playerId = location.state?.playerId;

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
      <DragAndDrop />
    </div>
  );
}
