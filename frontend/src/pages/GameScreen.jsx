
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { socket } from "../socket";
import CountdownTimer from "../components/CountdownTimer";
import DragAndDrop from "../components/DragAndDrop";
import AudioPlayer from "../components/AudioPlayer";

export function GameScreen() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialGameState = location.state?.gameState;
  const playerId = location.state?.playerId;

  const [gameState, setGameState] = useState(initialGameState);

  useEffect(() => {
    function handlePhaseChanged(updatedGameState) {
      
      setGameState(updatedGameState);
    }

    socket.on("game:phase_changed", handlePhaseChanged);

    return () => {
      socket.off("game:phase_changed", handlePhaseChanged);
    };
  }, []);


  useEffect(()=> {
    if(!gameState) return;

    if(gameState.phase !== "placement-ended") return;

    if(gameState.current_player?.player_id !== playerId) return;


    const curretPlayer = gameState.players.find((player)=>{
      return player.player_id === playerId;
    });

    
    socket.emit(
        "placement:submit",
        {
          join_code:gameState.join_code,
          player_id:playerId,
          timeline: myPlayer?.timeline || [],
        },
        (response)=>{
          
          if(!response.ok){
            console.log(response.error)
          }
        }
      );
    
  }, [gameState?.phase, gameState, playerId])

  useEffect(() => {
  function handleReveal(revealPayload) {
    
    navigate("/reveal", {
      state: {
        revealState: revealPayload,
        playerId,
      },
    });
  }

  socket.on("game:reveal", handleReveal);

  return () => {
    socket.off("game:reveal", handleReveal);
  };
}, [navigate, playerId]);

//for debugging 
useEffect(() => {
  function logAnyEvent(event, ...args) {
    console.log("SOCKET EVENT RECEIVED:", event, args);
  }

  socket.onAny(logAnyEvent);

  return () => {
    socket.offAny(logAnyEvent);
  };
}, []);




  if (!gameState) {
    return <p>No game state found.</p>;
  }

  const roomId = `game:${gameState.join_code}`;

  const myPlayer = gameState.players.find((player) => {
    return player.player_id === playerId;
  });

  const isCurrentPlayer =
    gameState.current_player?.player_id === playerId;

  const canMoveCards =
    gameState.phase === "listening-placement-phase" && isCurrentPlayer;

  return (
    <>
      <h1>The GameScreen</h1>

      <p>SOCKET ID: {socket.id}</p>

      <h3>Round number: {gameState.round_no}</h3>
      <h3>Current player's turn: {gameState.current_player.display_name}</h3>
      <h3>My name: {myPlayer?.display_name}</h3>
      <h3>Phase: {gameState.phase}</h3>

      {gameState.phase === "intro-countdown" && (
        <>
        <h3>Get Ready...</h3>
        <CountdownTimer
          roomId={roomId}
          label="Get ready"
          size="lg"
        />
        </>
      )}

      {gameState.phase === "listening-placement-phase" && (
      <>
        <AudioPlayer previewUrl={gameState.current_song?.previewUrl}/>
        <CountdownTimer
          roomId={roomId}
          label="Place your cards"
          size="md"
        />
      </> 
  )}


      {canMoveCards ? (
        <p>You can move your cards now.</p>
      ) : (
        <p>You cannot move cards right now.</p>
      )}

      {/* to be used in timeline/cards component */} <DragAndDrop />
      {/* <Timeline disabled={!canMoveCards} if not current player/> */}
    </>
  );
}
