# Afterglow

A dark Y2K / liquid-glass watch discovery experience made for Harshita.

## What's included

- Mood-first browsing, keyword search, genre filtering and sorting
- Six catalogue shelves: movies, TV shows, K-dramas, Chinese dramas, Chinese movies and anime
- Saved picks and custom 1–5 Karma ratings stored in the browser
- 140 offline starter picks
- Live catalogue pagination through a Netlify Function

## Netlify deployment

This repository is configured for Netlify at its root. The `netlify.toml` sets the publish directory to `.` and functions directory to `netlify/functions`; no build command is needed.

Connect this repository to the existing Netlify project **afterglow-harshita**:

1. In Netlify, open Project configuration → Developer settings → Continuous deployment → Repository → Link repository.
2. Choose GitHub, authorize Netlify to access `karmatalukdar-cloud/Afterglow`, and select the `main` branch.
3. Deploy with the root directory as the publish directory. The committed `netlify.toml` contains the correct settings.

## Live catalogue credential

Set `TMDB_API_KEY` as a secret environment variable in the Netlify project, with Functions scope, then trigger a new production deploy. The key is used only by the server-side Netlify Function. Without it, the offline starter picks and the public Jikan anime catalogue remain available; TMDB-backed film and drama shelves return a clear configuration message.

The project requests up to 1,000 items per shelf through pagination; the number of unique results actually available depends on each upstream catalogue.

## Local notes

`.netlify`, `.env` and local dependencies are ignored by Git.
