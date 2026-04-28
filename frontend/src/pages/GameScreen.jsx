
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { socket } from "../socket";
import CountdownTimer from "../components/CountdownTimer";
import DragAndDrop from "../components/DragAndDrop";
import AudioPlayer from "../components/AudioPlayer";
import { songs } from "../data/songs";
import Timeline from "../components/Timeline";
//import CardBank from "../components/CardBank";
//import Timeline from "../components/Timeline";

export function GameScreen() {
    const location = useLocation();
    const navigate = useNavigate();

    const initialGameState = location.state?.gameState;
    const playerId = location.state?.playerId;

    const [gameState, setGameState] = useState(initialGameState);

    const [cardBank, setCardBank] = useState(songs);
    const [timeline, setTimeline] = useState([]);
    const [activeTimelineCard, setActiveTimelineCard] = useState(null); // only timeline card that is currently allowed to be moved again
    const [placement, setPlacement] = useState(null);
    const [hasSubmittedPlacement, setHasSubmittedPlacement] = useState(false);


    const myPlayer = useMemo(() => {
        if (!gameState?.players || !playerId) return null;

        return gameState.players.find((player) => {
        return player.player_id === playerId;
        });
    }, [gameState, playerId]);

    const currentPlayer = useMemo(() => {
        if (!gameState?.players || !gameState?.current_player?.player_id) return null;

        return gameState.players.find((player) => {
        return player.player_id === gameState.current_player.player_id;
        });
    }, [gameState]);

    const isCurrentPlayer =
        gameState.current_player?.player_id === playerId;

    const canMoveCards =
        gameState.phase === "listening-placement-phase" && isCurrentPlayer;

    const roomId = `game:${gameState.join_code}`;

  useEffect(() => {
    function handlePhaseChanged(updatedGameState) {
    setGameState(updatedGameState);
    }

    socket.on("game:phase_changed", handlePhaseChanged);

    return () => {
    socket.off("game:phase_changed", handlePhaseChanged);
    };
  }, []);


  useEffect(() => {
    if (!myPlayer) return;

    setTimeline(myPlayer.timeline || []);
  }, [myPlayer?.player_id]);


useEffect(() => {
    if (!gameState) return;

    if (gameState.phase === "listening-placement-phase") {
    setHasSubmittedPlacement(false);
    }
  }, [gameState?.phase]);


  useEffect(() => {
    if (!gameState) return;
    if (!isCurrentPlayer) return;
    if (gameState.phase !== "placement-ended") return;
    if (hasSubmittedPlacement) return;
    if(gameState.current_player?.player_id !== playerId) return;
    if (!placement) {
    console.log("No placement was made before timer ended.");
    return;
    }

    setHasSubmittedPlacement(true);

    socket.emit(
    "placement:submit",
    {
      join_code: gameState.join_code,
      player_id: playerId,
      placed_song: placement.placed_song,
      position: placement.position,
		timeline: myPlayer?.timeline || []

    },
    (response) => {
      if (!response.ok) {
      console.log(response.error);
      }
    }
    );
  }, [
    gameState?.phase,
    gameState?.join_code,
    isCurrentPlayer,
    hasSubmittedPlacement,
    placement,
    playerId,
  ]);


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

    const timelineToShow = currentPlayer?.timeline || [];

    return (
        <>
        <h1>The GameScreen</h1>

        <h3>Round number: {gameState.round_no}</h3>
        <h3>Current players turn: {gameState.current_player.display_name}</h3>
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
            <>
            <p>You can move your card now.</p>

            <DragAndDrop
                cardBank={cardBank}
                setCardBank={setCardBank}
                timeline={timeline}
                setTimeline={setTimeline}
                activeTimelineCard={activeTimelineCard}
                setActiveTimelineCard={setActiveTimelineCard}
                setPlacement={setPlacement}
            />
            </>
        ) : (
            <>
            <p>Its {gameState.current_player?.display_name}s turn.</p>

            <Timeline timeline={timelineToShow} disabled={true} />
            </>
        )}

        {/* to be used in timeline/cards component */} 
        {/* <Timeline disabled={!canMoveCards} if not current player/> */} 
        
        </>
    );
}
