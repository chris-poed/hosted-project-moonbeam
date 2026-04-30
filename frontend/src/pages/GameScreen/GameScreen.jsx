
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { socket } from "../../socket";
import CountdownTimer from "../../components/CountdownTimer";
import DragAndDrop from "../../components/DragAndDrop";
import AudioPlayer from "../../components/AudioPlayer";
import Timeline from "../../components/Timeline";
import "./GameScreen.css";

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

        // If it's my turn, DragAndDrop already shows my own timeline,
        // so only show the other players underneath.
        if (isCurrentPlayer) {
            return gameState.players.filter((player) => {
                return player.player_id !== playerId;
            });
        }

        const currentTurnPlayer = gameState.players.find((player) => {
            return player.player_id === currentPlayerId;
        });

        const viewingPlayer = gameState.players.find((player) => {
            return player.player_id === playerId;
        });

        const otherPlayers = gameState.players.filter((player) => {
            return (
                player.player_id !== currentPlayerId &&
                player.player_id !== playerId
            );
        });

        return [
            currentTurnPlayer,
            viewingPlayer,
            ...otherPlayers,
        ].filter(Boolean);
    }, [
        gameState?.players,
        gameState?.current_player?.player_id,
        isCurrentPlayer,
        playerId,
    ]);

    const roomId = gameState ? `game:${gameState.join_code}` : null;

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

    const phaseLabelMap = {
    "intro-countdown": "Get ready",
    "listening-placement-phase": "Listening round",
    "placement-ended": "Placement locked",
    "reveal-phase": "Reveal",
};

    const phaseLabel = phaseLabelMap[gameState?.phase] || gameState?.phase;
    const currentSong = gameState?.current_song;

    if (!gameState) {
        return (
            <main className="game-root">
                <section className="game-empty-card">
                    <p className="game-section-label">Missing Game</p>
                    <h1 className="game-title game-title--small">
                        No game state found
                    </h1>
                    <p className="game-muted-copy">
                        Try returning to the lobby and joining the game again.
                    </p>
                </section>
            </main>
        );
    }

    return (
        <main className="game-root">
            <div className="game-blob game-blob--pink" />
            <div className="game-blob game-blob--blue" />
            <div className="game-ring game-ring--lg" />
            <div className="game-ring game-ring--md" />

            <section className="game-shell">
            <header className="game-header">
                <div className="game-header-content">
                    <p className="game-eyebrow">Round {gameState.round_no}</p>
                    <h1 className="game-title">Snippit</h1>
                    <p className="game-subtitle">
                        Place the track in the correct year order.
                    </p>

                    <div className="game-phase-pill">
                        {phaseLabel}
                    </div>
                </div>
            </header>

            <section className="game-hud">
                <article className="game-hud-panel">
                    <div className="game-hud-item">
                        <span className="game-hud-label">Current Turn</span>
                        <strong className="game-hud-value">
                            {gameState.current_player?.display_name}
                        </strong>
                    </div>

                    <div className="game-hud-item">
                        <span className="game-hud-label">You Are</span>
                        <strong className="game-hud-value">
                            {myPlayer?.display_name}
                        </strong>
                    </div>

                    <div className="game-hud-item">
                        <span className="game-hud-label">Players</span>
                        <strong className="game-hud-value">
                            {gameState.players?.length || 0}
                        </strong>
                    </div>

                    <div className="game-hud-item">
                        <span className="game-hud-label">Room</span>
                        <strong className="game-hud-value">
                            {gameState.join_code}
                        </strong>
                    </div>
                </article>
            </section>

                {gameState.phase === "intro-countdown" && (
                    <section className="game-focus-card game-focus-card--countdown">
                        <p className="game-section-label">Starting Soon</p>
                        <h2 className="game-focus-title">Get ready...</h2>
                        <p className="game-focus-copy">
                            The next track is about to play.
                        </p>

                        <div className="game-timer-wrap">
                            <CountdownTimer
                                roomId={roomId}
                                label="Get ready"
                                size="lg"
                            />
                        </div>
                    </section>
                )}

                {gameState.phase === "listening-placement-phase" && (
                    <section className="game-main-grid">
                        <article className="game-focus-card">
                            <div className="game-focus-header">
                                <div>
                                    <p className="game-section-label">
                                        Now Playing
                                    </p>
                                    <h2 className="game-focus-title">
                                        {canMoveCards
                                            ? "Your turn"
                                            : `${gameState.current_player?.display_name}'s turn`}
                                    </h2>
                                </div>

                                <div className="game-mini-timer">
                                    <CountdownTimer
                                        roomId={roomId}
                                        label="Place your cards"
                                        size="md"
                                    />
                                </div>
                            </div>

                            <div className="game-audio-panel">
                                <AudioPlayer previewUrl={currentSong?.previewUrl} />
                            </div>

                            <div
                                className={
                                    canMoveCards
                                        ? "game-turn-message game-turn-message--active"
                                        : "game-turn-message"
                                }
                            >
                                {canMoveCards ? (
                                    <>
                                        <strong>You can move your card now.</strong>
                                        <span>
                                            Drag the song into the position you think
                                            matches its release year.
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <strong>Waiting for placement.</strong>
                                        <span>
                                            Watch the current player&apos;s timeline
                                            while they make their choice.
                                        </span>
                                    </>
                                )}
                            </div>
                        </article>

                        <aside className="game-action-card">
                            {canMoveCards ? (
                                <>
                                    <p className="game-section-label">
                                        Your Timeline
                                    </p>
                                    <h2 className="game-panel-title">
                                        Make your move
                                    </h2>

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
                                    <p className="game-section-label">
                                        Standby
                                    </p>
                                    <h2 className="game-panel-title">
                                        It&apos;s not your turn
                                    </h2>
                                    <p className="game-muted-copy">
                                        {gameState.current_player?.display_name} is
                                        choosing where to place the song.
                                    </p>
                                </>
                            )}
                        </aside>
                    </section>
                )}

                <section className="game-timelines-section">
                    <div className="game-section-heading-row">
                        <div>
                            <p className="game-section-label">Timelines</p>
                            <h2 className="game-panel-title">
                                {canMoveCards ? "Other Players" : "Player Timelines"}
                            </h2>
                        </div>
                    </div>

                    <div className="game-timeline-grid">
                        {playersWithTimelinesToShow.map((player) => {
                            const isMe = player.player_id === playerId;
                            const isCurrentTurnPlayer =
                                player.player_id ===
                                gameState.current_player?.player_id;

                            return (
                                <article
                                    key={player.player_id}
                                    className={
                                        isCurrentTurnPlayer
                                            ? "game-timeline-card game-timeline-card--active"
                                            : "game-timeline-card"
                                    }
                                >
                                    <div className="game-timeline-card__header">
                                        <h3>
                                            {isMe
                                                ? "My Timeline"
                                                : `${player.display_name}'s Timeline`}
                                        </h3>

                                        {isCurrentTurnPlayer && !canMoveCards && (
                                            <span className="game-current-tag">
                                                Current Turn
                                            </span>
                                        )}
                                    </div>

                                    <Timeline
                                        timeline={player.timeline || []}
                                        disabled={true}
                                    />
                                </article>
                            );
                        })}
                    </div>
                </section>
            </section>
        </main>
    );
}
