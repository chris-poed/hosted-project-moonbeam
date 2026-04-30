import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { socket } from "../../socket";
import DragAndDrop from "../../components/DragAndDrop";
import CountdownTimer from "../../components/CountdownTimer";
import Timeline from "../../components/Timeline";
import "./RevealPage.css";

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


  const currentPlayer = revealState.players.find((player) => {
    return player.player_id === revealState.current_player?.player_id;
  });

  if (!revealState) {
    return (
      <div className="reveal-root">
        <div className="reveal-card">
          <p className="reveal-empty">No reveal data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reveal-root">

      <div className="reveal-card reveal-card--header">
        <p className="reveal-eyebrow">Round {revealState.round_no}</p>
        <h1 className="reveal-title">Reveal</h1>
        <p className="reveal-message">{revealState.reveal_message}</p>

        <div className={`reveal-result ${revealState.was_correct ? "reveal-result--correct" : "reveal-result--incorrect"}`}>
          {revealState.was_correct ? "✓ Correct Placement" : "✗ Incorrect Placement"}
        </div>
      </div>

      <div className="reveal-info-row">
        <div className="reveal-info-item">
          <span className="reveal-info-item__label">Phase</span>
          <span className="reveal-info-item__value">{revealState.phase}</span>
        </div>
        <div className="reveal-info-item">
          <span className="reveal-info-item__label">Current Player</span>
          <span className="reveal-info-item__value">
            {revealState.current_player?.display_name}
          </span>
        </div>
      </div>

      <div className="reveal-card reveal-card--timeline">
        <h2 className="reveal-section-title">
          {revealState.current_player?.display_name}'s Timeline
        </h2>
        <Timeline timeline={currentPlayer?.timeline || []} disabled={true} />
      </div>

      <div className="reveal-card">
        <h2 className="reveal-section-title">Players</h2>
        <ul className="reveal-players">
          {revealState.players.map((player) => (
            <li key={player.player_id} className="reveal-player">
              <span className="reveal-player__name">{player.display_name}</span>
              {player.player_id === playerId && (
                <span className="reveal-tag">You</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="reveal-timer">
        <CountdownTimer
          roomId={roomId}
          label={isFinalRound ? "Game ends in" : "Next round starts in"}
          size="md"
        />
      </div>

      <div className="reveal-timeline-area">
        <DragAndDrop />
      </div>

    </div>
  );
}
