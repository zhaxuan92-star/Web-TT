# Web-TT / VZC News

A mobile-first community news platform built with React and Vite.

## Features
- Create and browse community news branches.
- Publish articles and search across the public news feed.
- Embed World Simulator OSM at `/world-simulator` behind the activation gate.
- Shared Google Firebase / Cloud Firestore backend with World-Simulator-OSM.
- Public read access for branches/articles; authenticated owner-only writes and deletes.
- LocalStorage fallback when Firebase is unavailable.

## Shared database
Web-TT uses the same Firebase project as [World-Simulator-OSM](https://github.com/zhaxuan92-star/World-Simulator-OSM):
- `news_branches`: branch metadata and owner ID.
- `news_articles`: article content and author ID.
- Existing game collections (`players`, `worlds`, `ai_training`, `global_champion`) remain separate and retain their existing rules.

Before cloud sync works, publish the updated `firestore.rules` from the World-Simulator-OSM repository to the Firebase project. Without that step, Web-TT will continue to save locally and show a cloud-sync warning.

## Development
```bash
npm install
npm run dev
npm run build
```

## Notes
The Firebase web config is a public client configuration, not a server secret. Firestore Security Rules are the access-control boundary. Do not put Firebase Admin credentials or service-account private keys in this frontend repository.
