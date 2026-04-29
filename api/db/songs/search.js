import { writeFileSync, readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createInterface } from 'readline'

const __dirname  = dirname(fileURLToPath(import.meta.url))
const OUTPUT     = join(__dirname, 'manual-songs.js')

// ─── Load existing manual songs ───────────────────────────────────────────────
//
// If manual-songs.js already exists we read its contents so we can
// append to it rather than overwrite it each session.
//

function loadExisting() {
  if (!existsSync(OUTPUT)) return []

  try {
    // Read the file and parse out the song objects crudely
    // We do this without importing so we don't need to restart on each write
    const content = readFileSync(OUTPUT, 'utf-8')
    const matches = [...content.matchAll(/\{([^}]+)\}/g)]

    return matches.map(m => {
      const block    = m[1]
      const title    = block.match(/title:\s*"([^"]+)"/)?.[1]    ?? block.match(/title:\s*'([^']+)'/)?.[1]
      const artist   = block.match(/artist:\s*"([^"]+)"/)?.[1]   ?? block.match(/artist:\s*'([^']+)'/)?.[1]
      const year     = parseInt(block.match(/year:\s*(\d{4})/)?.[1])
      const preview  = block.match(/previewUrl:\s*'([^']+)'/)?.[1] ?? ''
      return { title, artist, year, previewUrl: preview }
    }).filter(s => s.title && s.artist && s.year)

  } catch {
    return []
  }
}

// ─── Save to manual-songs.js ──────────────────────────────────────────────────

function save(songs) {
  const lines = songs.map(s =>
    `  { title: ${JSON.stringify(s.title).padEnd(55)}, artist: ${JSON.stringify(s.artist).padEnd(45)}, year: ${s.year}, previewUrl: '${s.previewUrl}' },`
  )
  const output = `export const songs = [\n${lines.join('\n')}\n]\n`
  writeFileSync(OUTPUT, output, 'utf-8')
}

// ─── iTunes search ────────────────────────────────────────────────────────────

async function search(query) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=musicTrack&limit=10`

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return (data.results ?? []).filter(r => r.previewUrl)
  } catch (err) {
    console.error(`\n❌  Search failed: ${err.message}\n`)
    return []
  }
}

// ─── Display top 3 ────────────────────────────────────────────────────────────

function displayTop3(results) {
  const top = results.slice(0, 3)

  if (top.length === 0) {
    console.log('\n  No results with a preview URL found.\n')
    return top
  }

  console.log()
  top.forEach((track, i) => {
    const year = track.releaseDate ? new Date(track.releaseDate).getFullYear() : '?'
    console.log(`  [${i + 1}] ${track.trackName}`)
    console.log(`      ${track.artistName} · ${year}`)
    console.log(`      ${track.collectionName ?? 'Unknown album'}`)
    console.log()
  })

  return top
}

// ─── Main loop ────────────────────────────────────────────────────────────────

async function main() {
  const saved = loadExisting()

  const rl  = createInterface({ input: process.stdin, output: process.stdout })
  const ask = (prompt) => new Promise(resolve => rl.question(prompt, resolve))

  console.log('\n🎵  Hitster — Manual Song Search')
  console.log('─'.repeat(45))
  console.log(`  Saving to:   manual-songs.js`)
  console.log(`  Existing:    ${saved.length} song${saved.length !== 1 ? 's' : ''} already saved`)
  console.log('─'.repeat(45))
  console.log('  Search for a song, pick 1-3 to save it.')
  console.log('  Type "list" to see saved songs.')
  console.log('  Type "exit" to quit.\n')

  while (true) {
    const input = (await ask('Search: ')).trim()

    if (!input) continue

    if (input.toLowerCase() === 'exit') break

    if (input.toLowerCase() === 'list') {
      if (saved.length === 0) {
        console.log('\n  No songs saved yet.\n')
      } else {
        console.log(`\n  ${saved.length} songs saved:\n`)
        saved.forEach((s, i) => {
          console.log(`  ${String(i + 1).padStart(3)}. ${s.artist} – ${s.title} (${s.year})`)
        })
        console.log()
      }
      continue
    }

    console.log(`\n  Searching for "${input}"...`)

    const results = await search(input)
    const top     = displayTop3(results)

    if (top.length === 0) continue

    const pick = (await ask(`  Pick [1${top.length > 1 ? `-${top.length}` : ''}] or press Enter to skip: `)).trim()

    const index = parseInt(pick) - 1

    if (!pick || isNaN(index) || index < 0 || index >= top.length) {
      console.log('  Skipped.\n')
      continue
    }

    const chosen = top[index]
    const year   = chosen.releaseDate ? new Date(chosen.releaseDate).getFullYear() : 0

    const song = {
      title:      chosen.trackName,
      artist:     chosen.artistName,
      year,
      previewUrl: chosen.previewUrl,
    }

    // Check for duplicate
    const duplicate = saved.find(
      s => s.title.toLowerCase() === song.title.toLowerCase()
        && s.artist.toLowerCase() === song.artist.toLowerCase()
    )

    if (duplicate) {
      console.log(`\n  ⚠️  "${song.artist} – ${song.title}" is already in manual-songs.js. Skipping.\n`)
      continue
    }

    saved.push(song)
    save(saved)

    console.log(`\n  ✅  Saved: ${song.artist} – ${song.title} (${song.year})`)
    console.log(`  Total saved: ${saved.length}\n`)
  }

  rl.close()
  console.log(`\nDone. ${saved.length} song${saved.length !== 1 ? 's' : ''} in manual-songs.js\n`)
}

main().catch(err => {
  console.error('Unexpected error:', err.message)
  process.exit(1)
})