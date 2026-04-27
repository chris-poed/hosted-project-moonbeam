import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./App.css";
import { HomePage } from "./pages/Home/HomePage";

import { Lobby } from "./pages/Lobby/LobbyPage";
import { GameScreen } from "./pages/GameScreen";
import { TimerTest } from "./pages/TimerTest";

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
    path: "/timer-test",
    element: <TimerTest />,
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
