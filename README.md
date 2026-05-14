# Snippit

**Snippit** is a real-time multiplayer music timeline game.

Players listen to short song previews and try to place each track in the correct chronological position on their timeline. The more songs you place correctly, the stronger your final score.

Live app: https://snippit-netlify.netlify.app

---

## How the game works

1. A host creates a new game.
2. Other players join using the game PIN.
3. The host starts the game once at least two players have joined.
4. Players take turns listening to a hidden song preview.
5. The current player drags the song card into the position where they think it belongs in their timeline.
6. The game reveals whether the placement was correct.
7. Final rankings are based on how many songs each player placed correctly.

No account is required. Players only need a display name and a game PIN.

---

## Features

- Real-time multiplayer gameplay using Socket.io
- Create and join game lobbies with shareable PIN codes
- Supports 2–4 players
- Timed listening and placement rounds
- Drag-and-drop timeline interaction
- Hidden song details during the guessing phase
- Reveal screen showing whether the placement was correct
- Final game-over screen with rankings and player timelines
- Seeded song database with preview audio URLs
- Responsive UI designed for desktop and mobile play

---

## Tech stack

### Frontend

- React
- Vite
- React Router
- Socket.io Client
- dnd-kit
- CSS modules/files

### Backend

- Node.js
- Express
- Socket.io
- MongoDB
- Mongoose
- Jest / Supertest

### Hosting

- Frontend: Netlify
- Backend: Node/Express service, suitable for Render or similar platforms
- Database: MongoDB Atlas or local MongoDB

---

## Project structure

```text
hosted-project-moonbeam/
  api/
    db/
      songs/
        seed-songs.js
        songs.js
    helpers/
    models/
      game.js
      player.js
      song.js
    sockets/
      createGameHandlers.js
      handleCreateGame.js
      handleJoinGame.js
      handleStartGame.js
      handleSubmitPlacement.js
      handleDeleteGame.js
      gameTimer.js
    tests/
    index.js
    package.json

  frontend/
    src/
      components/
      pages/
        Home/
        Lobby/
        GameScreen/
        Reveal/
        GameOver/
      services/
      socket.js
    tests/
    package.json

  docs/
  README.md
  package.json
```

The root `package.json` is intentionally a placeholder to stop packages being installed or run from the wrong directory. Run commands from either `api/` or `frontend/`.

---

## Local setup

### Prerequisites

You will need:

- Node.js 20+
- npm
- MongoDB running locally, or a MongoDB Atlas connection string

---

## 1. Clone the repo

```bash
git clone https://github.com/chris-poed/hosted-project-moonbeam.git
cd hosted-project-moonbeam
```

---

## 2. Install backend dependencies

```bash
cd api
npm install
```

Create an `.env` file inside `api/`:

```env
MONGODB_URL=mongodb://127.0.0.1:27017/snippit
NODE_ENV=development
CLIENT_URL=http://localhost:5173
PORT=3000
```

If using MongoDB Atlas, replace `MONGODB_URL` with your Atlas connection string.

---

## 3. Seed the song database

From inside the `api/` directory:

```bash
npm run seed:songs
```

This populates the database with songs and preview URLs used during gameplay.

---

## 4. Start the backend

From inside the `api/` directory:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:3000
```

---

## 5. Install frontend dependencies

Open a second terminal:

```bash
cd frontend
npm install
```

Create an `.env` file inside `frontend/`:

```env
VITE_BACKEND_URL=http://localhost:3000
```

---

## 6. Start the frontend

From inside the `frontend/` directory:

```bash
npm run dev
```

The frontend will usually run on:

```text
http://localhost:5173
```

Open that URL in your browser to play locally.

---

## Running tests

### Backend tests

```bash
cd api
npm test
```

### Frontend tests

```bash
cd frontend
npm test
```

### Frontend linting

```bash
cd frontend
npm run lint
```

---

## Environment variables

### Backend

| Variable | Purpose |
|---|---|
| `MONGODB_URL` | MongoDB connection string |
| `NODE_ENV` | App environment, for example `development`, `test`, or `production` |
| `CLIENT_URL` | Frontend URL allowed by CORS |
| `PORT` | Optional backend port. Defaults to `3000` |

### Frontend

| Variable | Purpose |
|---|---|
| `VITE_BACKEND_URL` | URL of the backend Socket.io server |

For the hosted version, the frontend URL is:

```text
https://snippit-netlify.netlify.app
```

In production, the backend `CLIENT_URL` should match the frontend origin exactly:

```env
CLIENT_URL=https://snippit-netlify.netlify.app
```

Avoid adding a trailing slash to `CLIENT_URL`, as CORS origin checks need to match the browser origin.

---

## Key socket events

The game is driven mainly by Socket.io events.

| Event | Purpose |
|---|---|
| `game:create` | Creates a new game and host player |
| `game:join` | Adds a player to an existing lobby |
| `lobby:updated` | Broadcasts lobby changes to all players |
| `game:start` | Starts the game when the host is ready |
| `game:started` | Sends initial game state to all players |
| `game:phase_changed` | Broadcasts changes between game phases |
| `placement:submit` | Submits the current player's song placement |
| `game:reveal` | Shows whether the placement was correct |
| `game:delete` | Deletes the game after the final results screen |
| `timer:start`, `timer:tick`, `timer:end` | Keeps clients in sync during timed phases |

---

## Game phases

The backend tracks the game using these phases:

```text
lobby
intro-countdown
listening-placement-phase
placement-ended
reveal-phase
game-ended
```

During the guessing phase, song title, artist and year are hidden from players. The client receives the preview URL so the song can be played, but the answer is only revealed after the placement is submitted.

---

## Data models

### Game

Stores the players, host, current player, game phase, join code, turn order, round number and song deck.

### Player

Stores the player's display name, connection state and timeline of correctly placed songs.

### Song

Stores the song title, artist, release year and preview URL.

---

## Deployment notes

The live frontend is hosted at:

```text
https://snippit-netlify.netlify.app
```

For a production deployment:

1. Deploy the backend API to a Node-compatible host such as Render.
2. Add backend environment variables:
   ```env
   MONGODB_URL=<your-production-mongodb-uri>
   NODE_ENV=production
   CLIENT_URL=https://snippit-netlify.netlify.app
   ```
3. Deploy the frontend to Netlify.
4. Add the frontend environment variable:
   ```env
   VITE_BACKEND_URL=<your-deployed-backend-url>
   ```
5. Seed the production MongoDB database with:
   ```bash
   npm run seed:songs
   ```

---

## Future improvements

Possible next steps:

- Improve reconnection handling if a player refreshes or drops connection
- Add a stronger mobile drag-and-drop experience
- Add persistent game history
- Add an admin flow for managing the song library
- Add end-to-end tests for full multiplayer game flows
- Improve accessibility for keyboard and screen reader users

---

## Credits

This project was built from a Makers MERN starter/template and adapted into a real-time multiplayer music game.
