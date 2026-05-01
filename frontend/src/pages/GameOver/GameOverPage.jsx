import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../../socket";
import "./GameOverPage.css";

export function GameOverPage() {
    const location  = useLocation();
    const navigate  = useNavigate();

    const rankings  = location.state?.rankings;
    const players   = location.state?.players;
    const playerId  = location.state?.playerId;
    const join_code = location.state?.join_code;

    //game is deleted from the db when this oage loads
    useEffect(() => {
    if (!join_code) return

    socket.emit(
        "game:delete",
        { join_code },
        (response) => {
            if (!response.ok) {
                console.log(response.error)
                return
            }
            localStorage.removeItem("playerId");
            localStorage.removeItem("roomCode");
            localStorage.removeItem("gameID");
        }
    )
}, [join_code])


    function getMedal(position) {
        if (position === 1) return "🥇";
        if (position === 2) return "🥈";
        if (position === 3) return "🥉";
        return position;
    }

    function handleGoHome() {
        navigate("/");
    }

    if (!rankings) {
        return (
            <main className="gameover-root">
                <div className="gameover-empty">
                    <h1 className="gameover-title">Game Over</h1>
                    <p>No results data available.</p>
                    <button className="gameover-btn" onClick={() => navigate("/")}>
                        Back to Home
                    </button>
                </div>
            </main>
        );
    }


    const topPosition = rankings[0].position;
    const winners     = rankings.filter(p => p.position === topPosition);
    const isDraw      = winners.length > 1;
    const iAmAWinner  = winners.some(p => p.player_id === playerId);

    const winnerEmoji = isDraw ? "🤝" : iAmAWinner ? "🎉" : "🏆";

    const winnerHeading = isDraw
        ? "It's a Draw!"
        : iAmAWinner
            ? "You Won!"
            : `${winners[0].display_name} Wins!`;

    const winnerSub = isDraw
        ? `${winners.map(w => w.display_name).join(" & ")} tied with ${winners[0].score} song${winners[0].score !== 1 ? "s" : ""}`
        : iAmAWinner
            ? `You placed ${winners[0].score} song${winners[0].score !== 1 ? "s" : ""} correctly`
            : `They placed ${winners[0].score} song${winners[0].score !== 1 ? "s" : ""} correctly`;

    return (
        <main className="gameover-root">

            {/* Decorative blobs and rings */}
            <div className="gameover-blob gameover-blob--pink" />
            <div className="gameover-blob gameover-blob--blue" />
            <div className="gameover-ring gameover-ring--lg" />
            <div className="gameover-ring gameover-ring--md" />

            <div className="gameover-shell">

                {/* Header */}
                <header className="gameover-header">
                    <p className="gameover-eyebrow">Snippit</p>
                    <h1 className="gameover-title">Game Over</h1>
                </header>

                {/* Winner callout */}
                <div className="gameover-card gameover-winner">
                    <span className="gameover-winner__emoji">{winnerEmoji}</span>
                    <h2 className="gameover-winner__heading">{winnerHeading}</h2>
                    <p className="gameover-winner__sub">{winnerSub}</p>
                </div>

                {/* Final rankings */}
                <div className="gameover-card">
                    <p className="gameover-section-label">Results</p>
                    <h2 className="gameover-panel-title">Final Rankings</h2>

                    <ol className="gameover-rankings">
                        {rankings.map((player) => {
                            const isMe    = player.player_id === playerId;
                            const isFirst = player.position === 1;

                            return (
                                <li
                                    key={player.player_id}
                                    className={[
                                        "gameover-rankings__item",
                                        isFirst ? "gameover-rankings__item--first" : "",
                                        isMe    ? "gameover-rankings__item--me"    : "",
                                    ].join(" ").trim()}
                                >
                                    <span className="gameover-rankings__medal">
                                        {getMedal(player.position)}
                                    </span>
                                    <span className="gameover-rankings__name">
                                        {player.display_name}
                                        {isMe && (
                                            <span className="gameover-rankings__you">you</span>
                                        )}
                                    </span>
                                    <span className="gameover-rankings__score">
                                        {player.score} song{player.score !== 1 ? "s" : ""}
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                </div>

                {/* Individual timelines */}
                <div className="gameover-card">
                    <p className="gameover-section-label">Timelines</p>
                    <h2 className="gameover-panel-title">Song Placements</h2>

                    <div className="gameover-timelines">
                        {players?.map((player) => {
                            const isMe = player.player_id === playerId;

                            return (
                                <div key={player.player_id} className="gameover-timeline-card">
                                    <h3 className={`gameover-timeline-card__heading${isMe ? " gameover-timeline-card__heading--me" : ""}`}>
                                        {isMe ? "Your Timeline" : `${player.display_name}'s Timeline`}
                                    </h3>

                                    {player.timeline.length === 0 ? (
                                        <p className="gameover-timeline-empty">No songs placed</p>
                                    ) : (
                                        <ol className="gameover-timeline-list">
                                            {player.timeline.map((song, index) => (
                                                <li key={song.id || index} className="gameover-timeline-list__item">
                                                    <span className="gameover-timeline-list__year">{song.year}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA */}
                <div className="gameover-cta">
                    <button className="gameover-btn" type="button" onClick={handleGoHome}>
                        Start New Game
                    </button>
                </div>

            </div>
        </main>
    );
}