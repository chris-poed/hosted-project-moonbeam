import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../../socket";

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
    return <p>No game result available.</p>;
  }

  return (

    <div>
      <h1>Game Over</h1>
      <p>Final results page coming next.</p>
      <p>Rounds completed: {gameState.round_no}</p>

      <button type="button" onClick={handleGoHome}>Start New Game</button>

    </div>



    
  );
}
