import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./App.css";
import { HomePage } from "./pages/Home/HomePage";
import { Lobby } from "./pages/Lobby/LobbyPage";
import { GameScreen } from "./pages/GameScreen";
import { RevealPage } from "./pages/Reveal/RevealPage";
import { GameOverPage } from "./pages/GameOver/GameOverPage"

// docs: https://reactrouter.com/en/main/start/overview
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/lobby",
    element: <Lobby />,
  },
  {
    path: "/gamescreen",
    element: <GameScreen/>
 },
  {
    path: "/reveal",
    element: <RevealPage />,
  },
  {
    path: "/gameover",
    element: <GameOverPage />,
  }
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
