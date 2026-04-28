const PIN_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function generateCode() {
  let pin = ''
  for (let i = 0; i < 4; i++) {
    pin += PIN_CHARS[Math.floor(Math.random() * PIN_CHARS.length)]
  }
  return pin
}

function shuffleDeck(songs) {
  const deck = [...songs]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

function isValidPlacement(timeline, song, position) {
  if (timeline.length === 0) return true
  const before = timeline[position - 1]
  const after = timeline[position]
  if (before && song.year < before.year) return false
  if (after && song.year > after.year) return false
  return true
}

function checkWinCondition(player) {
  return player.timeline.length >= 10
}

function buildRankings(players) {
  return [...players].sort((a, b) => b.timeline.length - a.timeline.length)
}

// ... your sanitiseState here, also without `export` ...

module.exports = {
  generateCode,
  shuffleDeck,
  isValidPlacement,
  checkWinCondition,
  buildRankings,
}