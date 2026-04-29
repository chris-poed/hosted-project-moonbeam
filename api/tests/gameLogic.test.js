const {
  generateCode,
  shuffleDeck,
  isValidPlacement,
  checkWinCondition,
  buildRankings,
} = require('../gameLogic.js')

const SAFE_CHARS = new Set('ABCDEFGHJKLMNPQRSTUVWXYZ23456789')
const AMBIGUOUS = new Set('0O1IL')

describe('generateCode', () => {
  it('returns a 4-character string', () => {
    expect(generateCode()).toHaveLength(4)
  })

  it('only uses safe characters', () => {
    for (let i = 0; i < 100; i++) {
      const code = generateCode()
      for (const ch of code) {
        expect(SAFE_CHARS.has(ch)).toBe(true)
      }
    }
  })

  it('never uses ambiguous characters', () => {
    for (let i = 0; i < 200; i++) {
      const code = generateCode()
      for (const ch of code) {
        expect(AMBIGUOUS.has(ch)).toBe(false)
      }
    }
  })

  it('generates different codes across many calls', () => {
    const codes = new Set(Array.from({ length: 50 }, generateCode))
    expect(codes.size).toBeGreaterThan(1)
  })
})

describe('shuffleDeck', () => {
  const original = [
    { id: 's001', title: 'A', artist: 'X', year: 1980, previewUrl: '' },
    { id: 's002', title: 'B', artist: 'Y', year: 1990, previewUrl: '' },
    { id: 's003', title: 'C', artist: 'Z', year: 2000, previewUrl: '' },
    { id: 's004', title: 'D', artist: 'W', year: 2010, previewUrl: '' },
    { id: 's005', title: 'E', artist: 'V', year: 2020, previewUrl: '' },
  ]

  it('returns an array of the same length', () => {
    expect(shuffleDeck(original)).toHaveLength(original.length)
  })

  it('does not mutate the original array', () => {
    const copy = [...original]
    shuffleDeck(original)
    expect(original).toEqual(copy)
  })

  it('contains all the same songs', () => {
    const shuffled = shuffleDeck(original)
    const origIds = original.map(s => s.id).sort()
    const shuffledIds = shuffled.map(s => s.id).sort()
    expect(shuffledIds).toEqual(origIds)
  })

  it('produces different orderings across multiple calls', () => {
    const orders = new Set()
    for (let i = 0; i < 20; i++) {
      orders.add(shuffleDeck(original).map(s => s.id).join(','))
    }
    expect(orders.size).toBeGreaterThan(1)
  })
})

describe('isValidPlacement', () => {
  const c = (year) => ({ id: `s${year}`, title: 'T', artist: 'A', year, previewUrl: '' })

  it('accepts any position on an empty timeline', () => {
    expect(isValidPlacement([], c(1990), 0)).toBe(true)
  })

  it('accepts placing before the only song when year is earlier', () => {
    expect(isValidPlacement([c(1990)], c(1980), 0)).toBe(true)
  })

  it('accepts placing after the only song when year is later', () => {
    expect(isValidPlacement([c(1990)], c(2000), 1)).toBe(true)
  })

  it('rejects placing before the only song when year is later', () => {
    expect(isValidPlacement([c(1990)], c(2000), 0)).toBe(false)
  })

  it('rejects placing after the only song when year is earlier', () => {
    expect(isValidPlacement([c(1990)], c(1980), 1)).toBe(false)
  })

  it('accepts placing between two songs when year is in range', () => {
    expect(isValidPlacement([c(1980), c(2000)], c(1990), 1)).toBe(true)
  })

  it('rejects placing between two songs when year is before left neighbour', () => {
    expect(isValidPlacement([c(1980), c(2000)], c(1970), 1)).toBe(false)
  })

  it('rejects placing between two songs when year is after right neighbour', () => {
    expect(isValidPlacement([c(1980), c(2000)], c(2010), 1)).toBe(false)
  })

  it('accepts same year as neighbour', () => {
    expect(isValidPlacement([c(1990)], c(1990), 0)).toBe(true)
    expect(isValidPlacement([c(1990)], c(1990), 1)).toBe(true)
  })

  it('accepts placing at the first position', () => {
    expect(isValidPlacement([c(1990), c(2000)], c(1970), 0)).toBe(true)
  })

  it('accepts placing at the last position', () => {
    expect(isValidPlacement([c(1980), c(1990)], c(2000), 2)).toBe(true)
  })
})

describe('checkWinCondition', () => {
  const makePlayer = (n) => ({ timeline: Array(n).fill({}) })

  it('returns false for 0 songs', () => {
    expect(checkWinCondition(makePlayer(0))).toBe(false)
  })

  it('returns false for 9 songs', () => {
    expect(checkWinCondition(makePlayer(9))).toBe(false)
  })

  it('returns true for exactly 10 songs', () => {
    expect(checkWinCondition(makePlayer(10))).toBe(true)
  })

  it('returns true for 11 songs', () => {
    expect(checkWinCondition(makePlayer(11))).toBe(true)
  })
})

describe('buildRankings', () => {
  const makePlayer = (name, n) => ({ name, timeline: Array(n).fill({}) })

  it('sorts by timeline length descending', () => {
    const players = [makePlayer('A', 2), makePlayer('B', 5), makePlayer('C', 3)]
    const ranked = buildRankings(players)
    expect(ranked.map(p => p.name)).toEqual(['B', 'C', 'A'])
  })

  it('handles a single player', () => {
    const players = [makePlayer('Solo', 4)]
    expect(buildRankings(players)).toHaveLength(1)
  })

  it('does not mutate the original array', () => {
    const players = [makePlayer('A', 2), makePlayer('B', 5)]
    const copy = [...players]
    buildRankings(players)
    expect(players[0].name).toBe(copy[0].name)
  })

  it('preserves order for tied scores', () => {
    const players = [makePlayer('First', 3), makePlayer('Second', 3)]
    const ranked = buildRankings(players)
    expect(ranked[0].name).toBe('First')
    expect(ranked[1].name).toBe('Second')
  })
})