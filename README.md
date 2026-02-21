# Music Timeline

An interactive timeline of composers and performers across instruments. View it at [musiker.page](https://musiker.page).

Built in collaboration with [Rightkey.app](https://rightkey.app), an app for learning to play the piano.

## Contributing Data

We welcome contributions via [issues](https://github.com/pmatos/music-timeline/issues) and pull requests. All data lives in JSON files under `public/data/`.

### Add a person to an existing instrument

1. Add the person to `public/data/people.json` (if they're not already there):

```json
{
  "id": "lastname",
  "name": "F. Lastname",
  "born": 1800,
  "died": 1870,
  "role": "composer",
  "bio": "Two to three sentences about their contributions.",
  "photoUrl": null,
  "wikiUrl": "https://en.wikipedia.org/wiki/...",
  "websiteUrl": null
}
```

- **id**: lowercase, hyphenated (e.g. `cpe-bach`, `de-larrocha`)
- **role**: `"composer"`, `"player"`, or `"both"`
- **died**: use `null` for living people
- **photoUrl**: set to `null` initially — portrait images can be added separately
- **websiteUrl**: optional personal or streaming page for modern artists

2. Add their `id` to the `peopleIds` array in the instrument file (e.g. `public/data/piano.json` or `public/data/violin.json`).

### Add a connection between two people

Append to `public/data/connections.json`:

```json
{
  "from": "teacher-id",
  "to": "student-id",
  "type": "student-teacher",
  "label": "teacher/student"
}
```

- **type**: `"student-teacher"` or `"relative"`
- **label**: describes the relationship (e.g. `"teacher/student"`, `"father/son"`, `"influence"`, `"classmates"`)
- Both `from` and `to` must be valid IDs in `people.json`
- Connections only appear on an instrument's timeline when both people are in that instrument's `peopleIds`

### Add a new instrument

1. Create `public/data/<instrument>.json`:

```json
{
  "instrument": "Cello",
  "eras": [
    { "name": "Baroque", "startYear": 1600, "endYear": 1750, "color": "#E3F2FD" },
    { "name": "Classical", "startYear": 1730, "endYear": 1820, "color": "#FFF3E0" },
    { "name": "Romantic", "startYear": 1800, "endYear": 1910, "color": "#FCE4EC" },
    { "name": "Modern", "startYear": 1890, "endYear": 1975, "color": "#E8F5E9" },
    { "name": "Contemporary", "startYear": 1950, "endYear": 2030, "color": "#F3E5F5" }
  ],
  "peopleIds": ["bach", "rostropovich", "du-pre"]
}
```

2. Add any new people to `people.json` (people already in the file can be reused by ID).
3. Add the instrument name to the `INSTRUMENTS` array in `src/App.tsx`.

### Add a portrait image

Place the image in `public/images/portraits/<id>.jpg` and set the person's `photoUrl` in `people.json` to `/images/portraits/<id>.jpg`. Prefer public domain or freely licensed images.

A download helper is available at `scripts/download-portraits.mjs` — it fetches Wikipedia article thumbnails for people who have a `photoUrl` path but no file on disk yet.

### Open an issue instead

If you'd rather not edit JSON directly, [open an issue](https://github.com/pmatos/music-timeline/issues) describing who to add, which instrument they belong to, and any connections to existing people. We'll take it from there.
