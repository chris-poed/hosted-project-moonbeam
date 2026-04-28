import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { songs } from './songs.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DELAY_MS = 120
const SEARCH_LIMIT = 25

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalize(s) {
  return (s ?? '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // strip accents (Beyoncé → beyonce)
    .replace(/^the\s+/, '')                             // "The Beatles" → "beatles"
    .replace(/[^a-z0-9\s]/g, '')                        // strip punctuation (P!nk → pnk)
    .trim()
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ─── Deezer Search ────────────────────────────────────────────────────────────

async function searchDeezer(query, artistHint) {
  const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${SEARCH_LIMIT}`

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    const results = (data.data ?? []).filter(r => r.preview)
    if (!results.length) return null

    const artistNorm = normalize(artistHint)

    // Strong match: normalized artist names overlap meaningfully in either direction.
    const match = results.find(r => {
      const a = normalize(r.artist?.name)
      if (!a || !artistNorm) return false
      return a.includes(artistNorm) || artistNorm.includes(a)
    })

    if (!match) return null

    return {
      previewUrl: match.preview,
      matchedArtist: match.artist.name,
      matchedTitle: match.title,
    }
  } catch {
    return null
  }
}

// ─── Structured search (more precise) ─────────────────────────────────────────

async function searchDeezerStructured(title, artist) {
  // Deezer supports field-specific queries: track:"X" artist:"Y"
  const query = `track:"${title}" artist:"${artist}"`
  return searchDeezer(query, artist)
}

// ─── Fetch with fallbacks ─────────────────────────────────────────────────────

async function fetchPreviewUrl(title, artist) {
  // 1. Structured query (most precise — uses Deezer's field operators)
  let result = await searchDeezerStructured(title, artist)
  if (result) return result

  // 2. Plain query: title + artist
  result = await searchDeezer(`${title} ${artist}`, artist)
  if (result) return result

  // 3. Strip featured artists and parentheticals, try again
  const cleanArtist = artist
    .replace(/\s*ft\..*$/i, '')
    .replace(/\s*feat\..*$/i, '')
    .replace(/\s*&.*$/, '')
    .replace(/\s*,.*$/, '')
    .trim()
  const cleanTitle = title
    .replace(/\s*\(.*?\)/g, '')   // remove "(Remastered 2009)" etc.
    .replace(/\s*-\s*.*$/, '')    // remove "- Single Version" etc.
    .trim()

  if (cleanArtist !== artist || cleanTitle !== title) {
    result = await searchDeezerStructured(cleanTitle, cleanArtist)
    if (result) return result

    result = await searchDeezer(`${cleanTitle} ${cleanArtist}`, cleanArtist)
    if (result) return result
  }

  return null
}

// ─── Output formatting ────────────────────────────────────────────────────────

function formatSongsFile(results) {
  const lines = results.map(s => {
    const url = s.previewUrl ? `'${s.previewUrl}'` : `''`
    return `  { id: '${s.id}', title: ${JSON.stringify(s.title).padEnd(50)}, artist: ${JSON.stringify(s.artist).padEnd(45)}, year: ${s.year}, previewUrl: ${url} },`
  })
  return `export const songs = [\n${lines.join('\n')}\n]\n`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const toFetch = songs.filter(s => !s.previewUrl)
  const alreadyHave = songs.filter(s => s.previewUrl)

  console.log('🎵  Hitster — Deezer Preview URL Fetcher')
  console.log('─'.repeat(60))
  console.log(`   Total songs:        ${songs.length}`)
  console.log(`   Already have URL:   ${alreadyHave.length} (skipping)`)
  console.log(`   Need fetching:      ${toFetch.length}`)
  console.log('─'.repeat(60))

  if (toFetch.length === 0) {
    console.log('\n✅  All songs already have preview URLs. Nothing to do.\n')
    process.exit(0)
  }

  console.log('\nNo credentials needed — Deezer search is public.\n')

  const results = [...songs] // work on a copy preserving order
  const matchLog = []        // track what we matched, for spot-checking
  let found = 0
  let missing = 0
  let fetchCount = 0

  for (let i = 0; i < results.length; i++) {
    const song = results[i]

    if (song.previewUrl) continue

    fetchCount++
    const progress = `[${String(fetchCount).padStart(3)}/${toFetch.length}]`
    process.stdout.write(`${progress} ${song.artist} – ${song.title} ... `)

    const result = await fetchPreviewUrl(song.title, song.artist)

    if (result) {
      found++
      results[i] = { ...song, previewUrl: result.previewUrl }

      // Flag matches where the artist name differs noticeably — these need eyeballing
      const expected = normalize(song.artist)
      const actual = normalize(result.matchedArtist)
      const suspicious = !actual.includes(expected) && !expected.includes(actual)

      if (suspicious) {
        process.stdout.write(`⚠  matched as "${result.matchedArtist}"\n`)
      } else {
        process.stdout.write(`✓\n`)
      }

      matchLog.push({
        id: song.id,
        expected: `${song.artist} – ${song.title}`,
        matched: `${result.matchedArtist} – ${result.matchedTitle}`,
        suspicious,
      })
    } else {
      missing++
      process.stdout.write(`✗  (no preview found)\n`)
    }

    if (fetchCount < toFetch.length) {
      await delay(DELAY_MS)
    }
  }

  // ─── Write output files ───────────────────────────────────────────────────

  console.log('\n' + '─'.repeat(60))
  console.log(`\n📊  Results: ${found} fetched, ${missing} still missing\n`)

  // 1. songs-deezer-updated.js — drop into project as songs.js
  const jsPath = join(__dirname, 'songs-deezer-updated.js')
  writeFileSync(jsPath, formatSongsFile(results), 'utf-8')
  console.log('📄  songs-deezer-updated.js   ← drop into your project as songs.js')

  // 2. songs-deezer-updated.json — full data for inspection
  const jsonPath = join(__dirname, 'songs-deezer-updated.json')
  writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf-8')
  console.log('📄  songs-deezer-updated.json ← full data for inspection')

  // 3. matches-deezer.json — what we matched against, for spot-checking
  const matchesPath = join(__dirname, 'matches-deezer.json')
  writeFileSync(matchesPath, JSON.stringify(matchLog, null, 2), 'utf-8')
  console.log('📄  matches-deezer.json       ← every match we made (eyeball this!)')

  // 4. missing-deezer.json — songs still without a URL
  const stillMissing = results.filter(s => !s.previewUrl)
  if (stillMissing.length > 0) {
    const missingPath = join(__dirname, 'missing-deezer.json')
    writeFileSync(missingPath, JSON.stringify(stillMissing, null, 2), 'utf-8')
    console.log(`📄  missing-deezer.json       ← ${stillMissing.length} songs still need manual URLs`)
  }

  // 5. suspicious-deezer.json — matches that need verification
  const suspicious = matchLog.filter(m => m.suspicious)
  if (suspicious.length > 0) {
    const suspiciousPath = join(__dirname, 'suspicious-deezer.json')
    writeFileSync(suspiciousPath, JSON.stringify(suspicious, null, 2), 'utf-8')
    console.log(`📄  suspicious-deezer.json    ← ${suspicious.length} matches with mismatched artist names`)
  }

  console.log('\n✅  Done!\n')

  if (suspicious.length > 0) {
    console.log('─'.repeat(60))
    console.log(`⚠  ${suspicious.length} matches had mismatched artist names — check suspicious-deezer.json`)
    console.log('   These might be wrong songs (covers, karaoke, tribute albums).\n')
  }

  if (stillMissing.length > 0) {
    console.log('─'.repeat(60))
    console.log('Songs still missing a preview URL:')
    stillMissing.forEach(s => console.log(`   • ${s.artist} – ${s.title} (${s.year})`))
    console.log('\nFor these, search manually at:')
    console.log('   https://api.deezer.com/search?q=track:"SONG" artist:"ARTIST"')
    console.log('Copy the "preview" field from the JSON response.\n')
  }
}

main().catch(err => {
  console.error('\n❌  Unexpected error:', err.message)
  process.exit(1)
})