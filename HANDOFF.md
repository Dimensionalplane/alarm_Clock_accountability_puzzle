# SnoozeTax Production Handoff & Deployment Guide

### Deployment Status
SnoozeTax is at version **1.1.0** and is ready for production builds.

### Production Build Instructions

#### 1. Web Deployment
Export the web-optimized bundle:
```bash
npm run build:web
```
The output will be in the `dist/` directory. This can be hosted on static platforms like Netlify, Vercel, or GitHub Pages.

#### 2. Android Deployment (AAB/APK)
Build using EAS (Expo Application Services):
```bash
# Ensure you have eas-cli installed: npm install -g eas-cli
eas build --platform android
```
*Note: Requires an Expo account and configuration in eas.json.*

#### 3. iOS Deployment (IPA)
Build using EAS:
```bash
eas build --platform ios
```
*Note: Requires an Apple Developer Account.*

### Core Component Architecture
- **State Management**: Localized state with persistent storage in `services/`.
- **Navigation**: Expo Router (File-based routing) in `app/`.
- **Verification Logic**: Puzzle success/failure callbacks in `components/SnoozeTax.js`.

### Security & Integrity
- **Anti-Cheat**: Persistent `SNOOZE_TAX_UNRESOLVED_ALARM` flag in `expo-secure-store`.
- **Wallet**: Transactions are logged before balance is updated to ensure integrity.

### Backend Monitoring
The Go backend in `backend-go/` should be deployed as a containerized service (e.g., Docker) to provide system status and session replays for administrators.
