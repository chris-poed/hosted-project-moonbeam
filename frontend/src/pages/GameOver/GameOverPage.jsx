import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../../socket";
import "./GameOverPage.css";

export function GameOverPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const gameState = location.state?.gameState;
  //const playerId = location.state?.playerId;

  //UseEffect needed here to listen for broadcst on delete - broadcast required to room
  // in case users players have not manually transitioned to home screen 
  useEffect(()=> {
    function handleGameClosed(payload){
      alert (payload.message || "Game room has been closed");

   
      //clear game data fromlocal storage data
      localStorage.removeItem("PlayerId");
      localStorage.removeItem("RoomCode");
      localStorage.removeItem("gameID");

      //return to the home page
    navigate("/");
    }
    socket.on("game:closed", handleGameClosed);
    return ()=> {
      socket.off("game:closed", handleGameClosed);
    };
  },[navigate])

  function handleGoHome(){
   
    //clear game from database
    socket.emit(
      "game:delete",
      {
        join_code: gameState.join_code,
        //player_id:playerId,
      },
      (response) => {
        if(!response.ok){
          console.log(response.error)
        }
      }
    )
    
  }

  if (!gameState) {
    return (
      <div className="gameover-root">
        <div className="gameover-card">
          <p className="gameover-empty">No game result available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gameover-root">

      <div className="gameover-card">
        <p className="gameover-eyebrow">Thanks for playing</p>
        <h1 className="gameover-title">Game Over</h1>
        <p className="gameover-subtitle">Final results page coming next.</p>

        <div className="gameover-stat">
          <span className="gameover-stat__label">Rounds Completed</span>
          <span className="gameover-stat__value">{gameState.round_no}</span>
        </div>

        <button className="btn btn-primary" type="button" onClick={handleGoHome}>
          Start New Game
        </button>
      </div>

    </div>
  );
}
