import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {useEffect} from "react";
import "./App.css";
import { HomePage } from "./pages/Home/HomePage";
import { Lobby } from "./pages/Lobby/LobbyPage";
import { GameScreen } from "./pages/GameScreen/GameScreen";
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
   useEffect(() => {
    function unlockAudio() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext
            if (!AudioContext) return
            const ctx    = new AudioContext()
            const buffer = ctx.createBuffer(1, 1, 22050)
            const source = ctx.createBufferSource()
            source.buffer = buffer
            source.connect(ctx.destination)
            source.start(0)
            ctx.resume()
        } catch (e) {
            console.log('Audio unlock failed silently:', e)
        }
        document.removeEventListener('touchstart', unlockAudio)
        document.removeEventListener('touchend',   unlockAudio)
    }
    document.addEventListener('touchstart', unlockAudio, { passive: true })
    document.addEventListener('touchend',   unlockAudio, { passive: true })
    return () => {
        document.removeEventListener('touchstart', unlockAudio)
        document.removeEventListener('touchend',   unlockAudio)
    }
}, [])
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App