# Tala Mboka Crisis Mobile

Expo / React Native mobile app for fast community crisis reports.

## Features

- Large mobile-first report workflow.
- Crisis type, infrastructure type, damage level, photo, description, modular UNDP impact fields, GPS, and landmark entry.
- Optional reporter follow-up details visible only to admin.
- Offline-first submission queue: when the server is unavailable, reports are saved locally and synced later.
- Shared backend with the web platform.

## Build checks

```bash
npm install
npx expo config --json
```

## Production notes

For the final challenge submission, package the app with EAS or Gradle, publish this repository as open source, and include a short video showing offline submission, sync, admin validation, map display, and CSV/GeoJSON export.
