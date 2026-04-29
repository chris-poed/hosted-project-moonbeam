
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { socket } from "../socket";
import CountdownTimer from "../components/CountdownTimer";
import DragAndDrop from "../components/DragAndDrop";
import AudioPlayer from "../components/AudioPlayer";
import Timeline from "../components/Timeline";
//import CardBank from "../components/CardBank";
//import Timeline from "../components/Timeline";

export function GameScreen() {
    const location = useLocation();
    const navigate = useNavigate();

    const initialGameState = location.state?.gameState;
    const playerId = location.state?.playerId;

    const [gameState, setGameState] = useState(initialGameState);

    const [cardBank, setCardBank] = useState([]);
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

    const isCurrentPlayer =
        gameState?.current_player?.player_id === playerId;

    const canMoveCards =
        gameState?.phase === "listening-placement-phase" && isCurrentPlayer;

    const playersWithTimelinesToShow = useMemo(() => {
        if (!gameState?.players) return [];

        const currentPlayerId = gameState.current_player?.player_id;

        // if it's my turn, DragAndDrop already shows my own timeline.
        if (isCurrentPlayer) {
            return gameState.players.filter((player) => {
                return player.player_id !== playerId;
            });
        }

        // if it's not my turn, show all players, but put the current players timeline first
        const currentTurnPlayer = gameState.players.find((player) => {
            return player.player_id === currentPlayerId;
        });

        const otherPlayers = gameState.players.filter((player) => {
            return player.player_id !== currentPlayerId;
        });

        if (!currentTurnPlayer) return gameState.players;

        return [currentTurnPlayer, ...otherPlayers];
    }, [
        gameState?.players,
        gameState?.current_player?.player_id,
        isCurrentPlayer,
        playerId,
    ]);

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
    }, [
        myPlayer?.player_id,
        gameState?.current_player?.player_id,
        gameState?.current_song?.id,
    ]);

    useEffect(() => {
        if (!gameState) return;
        if (gameState.phase === "listening-placement-phase") {
        setHasSubmittedPlacement(false);
        }
    }, [gameState?.phase]);

    useEffect(() => {
        if (!gameState?.current_song) return;

        setCardBank([
            {
            id: gameState.current_song.id,
            title: gameState.current_song.title,
            artist: gameState.current_song.artist,
            previewUrl: gameState.current_song.previewUrl,
            },
        ]);

        setActiveTimelineCard(null);
        setPlacement(null);
        }, [gameState?.current_song?.id]);

    useEffect(() => {
        if (!gameState) return;
        if (!isCurrentPlayer) return;
        if (gameState.phase !== "placement-ended") return;
        if (hasSubmittedPlacement) return;
        if(gameState.current_player?.player_id !== playerId) return;
        if (!placement) {
        setHasSubmittedPlacement(true);

        socket.emit(
            "placement:submit",
            {
                join_code: gameState.join_code,
                player_id: playerId,
                song_id: gameState.current_song?.id,
                position: null,
            },
            (response) => {
                if (!response.ok) {
                    console.log(response.error);
                }
            }
        );

        return;
        }
        setHasSubmittedPlacement(true);
            socket.emit(
            "placement:submit",
            {
                join_code: gameState.join_code,
                player_id: playerId,
                song_id: placement?.song_id || gameState.current_song?.id,
                position: placement ? placement.position : null,
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
        gameState,
        myPlayer?.timeline
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

    return (
        <>
        <h1>The GameScreen</h1>

        <h3>Round number: {gameState.round_no}</h3>
        <h3>Current players turn: {gameState.current_player?.display_name}</h3>
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
            <p>
                {"It's"} {gameState.current_player?.display_name}
                {"'s turn."}
            </p>
        )}

        <h2>{canMoveCards ? "Other Players" : "Player Timelines"}</h2>

        {playersWithTimelinesToShow.map((player) => {
            const isMe = player.player_id === playerId;
            const isCurrentTurnPlayer =
                player.player_id === gameState.current_player?.player_id;

            return (
                <div key={player.player_id}>
                    <h3>
                        {isMe ? "My Timeline" : `${player.display_name}'s Timeline`}
                        {!canMoveCards && isCurrentTurnPlayer ? " - Current Turn" : ""}
                    </h3>

                    <Timeline
                        timeline={player.timeline || []}
                        disabled={true}
                    />
                </div>
            );
        })}
        
        </>
    );
}
