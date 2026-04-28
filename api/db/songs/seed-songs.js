const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const Song = require('../../models/song.js');
const { songs: songsData } = require('./songs-deezer-updated.js');

function normalize(s) {
  return (s ?? '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // strip accents
    .replace(/^the\s+/, '')                             // "The Beatles" → "beatles"
    .replace(/[^a-z0-9\s]/g, '')                        // strip punctuation
    .trim();
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URL);

  // Deduplicate source data using normalized title+artist
  const seen = new Map();        // key → song (keeps first occurrence)
  const duplicates = [];

  for (const song of songsData) {
    const key = `${normalize(song.artist)}|||${normalize(song.title)}`;
    if (seen.has(key)) {
      duplicates.push(song);
      continue;
    }
    seen.set(key, song);
  }

  const uniqueSongs = [...seen.values()];

  if (duplicates.length > 0) {
    console.log(`⚠  Skipping ${duplicates.length} duplicate(s) in source data:`);
    duplicates.forEach(d => console.log(`   • ${d.artist} – ${d.title}`));
    console.log('');
  }

  let seeded = 0;
  let skippedNoPreview = 0;

  for (const s of uniqueSongs) {
    if (!s.previewUrl) {
      skippedNoPreview++;
      continue;
    }

    await Song.updateOne(
      { title: s.title, artist: s.artist },
      { $set: { year: s.year, previewUrl: s.previewUrl } },
      { upsert: true }
    );
    seeded++;
  }

  console.log(`✅  Seeded ${seeded} songs`);
  console.log(`   Skipped: ${skippedNoPreview} (no preview URL), ${duplicates.length} (duplicates)`);

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });