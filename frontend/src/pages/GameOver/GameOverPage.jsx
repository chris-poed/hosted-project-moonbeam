import { use } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function GameOverPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const gameState = location.state?.gameState;

  function handleGoHome(){
    //clear local storage data
    //clear game from database
    //any other game ending tasks can reside here

    localStorage.removeItem("PlayerId");
    localStorage.removeItem("RoomCode");
    localStorage.removeItem("gameID");

    //return to the home page
    navigate("/");
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
