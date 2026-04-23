import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { socket } from "../../socket"

import "./HomePage.css";

export function HomePage() {

    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.connect() // we missed this bit

    console.log(socket.id, '<---frontend socket id')

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <div className="home">
      <h1>Welcome to Moonbeam!</h1>
      <p>Socket status: {isConnected ? "connected" : "disconnected"}</p>
      <Link to="/signup">Sign Up</Link>
      <Link to="/login">Log In</Link>
    </div>
  );
}
