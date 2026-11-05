AFTERGLOW — KARMA'S PICKS FOR HARSHITA

A dark Y2K / liquid-glass watch discovery site with mood filtering, six catalogue shelves, search, sorting, saved picks and custom ratings.

DEPLOYMENT
- Netlify build command: leave blank.
- Publish directory: .
- Functions directory: netlify/functions
- Set TMDB_API_KEY in Netlify environment variables for movie, TV, Korean drama, Chinese drama and Chinese movie discovery.
- Anime discovery uses the public Jikan API and does not require a key.

The initial offline catalogue is included in data/seed.json. Live catalogues are loaded in pages from the Netlify Function at /.netlify/functions/catalogue. The source APIs determine actual available counts; the 1,000-per-shelf display ceiling is a pagination target, not a guarantee that every source has that many distinct titles.

NETLIFY
Connect this Git repository to a Netlify project and deploy the main branch. Ensure TMDB_API_KEY has Functions scope, then trigger a fresh deploy after setting it.
