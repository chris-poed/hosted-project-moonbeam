import { Link, useNavigate } from "react-router-dom";
import { CreateGame } from "../../components/CreateGame";
import { JoinGame } from "../../components/JoinGame";
import { useState } from "react";


import "./HomePage.css";

export function HomePage() {
  const [activeView, setActiveView] = useState(null);

  return(
    <div>
      <h1> Hitster</h1>

      {/* On page entry default view*/}
      {!activeView && (
        <div>
          <button onClick={()=> setActiveView("create")}>
            Create a game
          </button>

          <button onClick={()=> setActiveView("join")}>
            Join a game
          </button>
        </div>
         )
      }

      {/* Active view = create after user button click*/}
      {activeView === "create" && <CreateGame/>}

      {/* Active view = join game after user button click*/}
      {activeView === "join" && <JoinGame/>}


    </div>
  )





  //   const [isConnected, setIsConnected] = useState(socket.connected);
   
  //   const navigate = useNavigate();
  //   useEffect(() => {
  //   function onConnect() {
  //     setIsConnected(true);
  //   }

  //   function onDisconnect() {
  //     setIsConnected(false);
  //   }

  //   socket.connect() // we missed this bit

  //   console.log(socket.id, '<---frontend socket id')

  //   socket.emit(
  //     "game:create",
  //     {display_name: "testing",
  //       max_players: 4
  //     },
  //     (response)=>{
  //       if(!response.ok){
  //         setError(response.error || "Failed to create game");
  //       }
        
  //       localStorage.setItem("playerId", response.player_id);
  //       localStorage.setItem("roomCode", response.join_code);

  //       navigate("/lobby")
  //     }

  //   )

  //   socket.on("connect", onConnect);
  //   socket.on("disconnect", onDisconnect);



  //   return () => {
  //     socket.off("connect", onConnect);
  //     socket.off("disconnect", onDisconnect);
  //   };
  // }, []);

  // return (
  //   <div className="home">
  //     <h1>Welcome to Moonbeam!</h1>
  //     <p>Socket status: {isConnected ? "connected" : "disconnected"}</p>
  //     <Link to="/signup">Sign Up</Link>
  //     <Link to="/login">Log In</Link>
  //   </div>
  // );
}
