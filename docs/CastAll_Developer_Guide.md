# CastAll Developer Guide

## Overview

This guide is for developers who want to understand, modify, or extend the CastAll codebase.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, Socket.IO |
| Signaling | Socket.IO |
| Media | WebRTC (peer-to-peer) |
| Validation | Zod |
| Logging | Pino |

---

## Project Structure

```
castall/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts           # Environment config with Zod validation
│   │   ├── constants/
│   │   │   └── index.ts         # App constants (timeouts, limits)
│   │   ├── logger/
│   │   │   └── pino.ts          # Pino logger setup
│   │   ├── managers/
│   │   │   └── roomManager.ts   # In-memory room state machine
│   │   ├── routes/
│   │   │   └── health.ts        # GET /health endpoint
│   │   ├── services/
│   │   │   └── roomService.ts   # Room business logic facade
│   │   ├── sockets/
│   │   │   ├── index.ts         # Socket.IO server setup
│   │   │   └── room.ts          # Socket event handlers
│   │   ├── types/
│   │   │   ├── room.ts          # Room type definitions
│   │   │   └── socket.ts        # Socket type definitions
│   │   ├── utils/
│   │   │   ├── codeGenerator.ts # Room code + session token generation
│   │   │   ├── rateLimiter.ts   # Per-socket room creation rate limiting
│   │   │   └── validation.ts    # Zod schemas for inputs
│   │   ├── app.ts               # Express middleware + Socket.IO init
│   │   └── server.ts            # HTTP server entry point
│   ├── .env                     # Local env (not committed)
│   ├── .env.example             # Env template
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── castall-logo.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── presentation/
│   │   │   │   ├── BackgroundEffects.tsx   # Physics ball animation
│   │   │   │   ├── PresentationScreen.tsx  # Video display
│   │   │   │   ├── ScreenRecommendation.tsx # Pre-share guidance
│   │   │   │   └── StartSharing.tsx        # Share start flow
│   │   │   ├── qr/
│   │   │   │   ├── QRCodeCard.tsx          # QR display
│   │   │   │   └── QRCodeScanner.tsx       # Camera/image QR scanner
│   │   │   ├── room/
│   │   │   │   ├── HostCard.tsx            # Host room UI
│   │   │   │   ├── JoinCard.tsx            # Join room form
│   │   │   │   └── WaitingForApproval.tsx  # Approval wait UI
│   │   │   └── ui/
│   │   │       ├── ConnectionStatusButton.tsx
│   │   │       └── Spinner.tsx
│   │   ├── contexts/
│   │   │   ├── RoomContext.tsx      # Room state provider
│   │   │   └── ThemeContext.tsx     # Theme state provider
│   │   ├── hooks/
│   │   │   ├── useClipboard.ts     # Clipboard copy
│   │   │   ├── useScreenShare.ts   # Screen capture hook
│   │   │   ├── useSocket.ts        # Socket.IO connection state
│   │   │   └── useWebRTC.ts        # WebRTC peer connection lifecycle
│   │   ├── layouts/
│   │   │   └── AppLayout.tsx       # Navbar + main layout
│   │   ├── pages/
│   │   │   ├── HostPage.tsx        # Room creation page
│   │   │   ├── LandingPage.tsx     # Home page
│   │   │   ├── PresentationPage.tsx # Active presentation view
│   │   │   └── SharePage.tsx       # Join room page
│   │   ├── services/
│   │   │   ├── room.ts             # Frontend room API calls
│   │   │   ├── socket.ts           # Socket.IO singleton
│   │   │   └── webrtc.ts           # WebRTC service class
│   │   ├── types/
│   │   │   ├── room.ts
│   │   │   ├── socket.ts
│   │   │   └── webrtc.ts
│   │   ├── utils/
│   │   │   ├── constants.ts
│   │   │   ├── formatters.ts
│   │   │   └── validators.ts       # Zod schemas
│   │   ├── App.tsx                 # Root component + routes
│   │   ├── main.tsx                # Entry point (HashRouter)
│   │   └── index.css               # Global styles
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

---

## Architecture

### Signaling Flow

```
Host creates room
    ↓
Backend generates room code + session token
    ↓
Presenter joins via QR/code
    ↓
Backend emits 'presentation-request' to host
    ↓
Host approves → session token sent to presenter
    ↓
WebRTC negotiation:
  - Presenter creates offer → backend forwards to host
  - Host creates answer → backend forwards to presenter
  - ICE candidates exchanged bidirectionally
    ↓
Peer connection established (direct P2P)
    ↓
Screen sharing begins (media flows directly, not through server)
```

### Key Design Decisions

1. **HashRouter** — used because the frontend is deployed as a static site on Render, which does not support SPA fallback rewrites. Hash fragments are handled client-side and never sent to the server.

2. **ICE candidate buffering** — candidates are buffered until `setRemoteDescription` completes, preventing `InvalidStateError` on fast networks.

3. **Room lifecycle** — rooms transition through states: `WAITING` → `REQUESTED` → `APPROVED` → `STREAMING` → `ENDED`/`EXPIRED`/`DESTROYED`.

4. **In-memory state** — all room state is stored in memory on the backend. Server restart clears all rooms. No database is used.

5. **STUN only** — Google's free STUN server is used. No TURN server is configured. This works for same-LAN but may fail across symmetric NATs.

---

## Environment Variables

### Backend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment mode |
| `PORT` | No | `3000` | Server port (Render sets this automatically) |
| `FRONTEND_URL` | Yes (production) | `http://localhost:5173` | Frontend origin for CORS |
| `STUN_SERVER` | No | `stun:stun.l.google.com:19302` | STUN server URL |
| `TURN_SERVER` | No | — | TURN server URL (optional) |
| `TURN_USERNAME` | No | — | TURN username (optional) |
| `TURN_PASSWORD` | No | — | TURN password (optional) |

### Frontend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_SOCKET_URL` | Yes (production) | `http://localhost:3000` | Backend Socket.IO URL |
| `VITE_STUN_SERVER` | No | `stun:stun.l.google.com:19302` | STUN server URL |
| `VITE_TURN_SERVER` | No | — | TURN server URL (optional) |
| `VITE_TURN_USERNAME` | No | — | TURN username (optional) |
| `VITE_TURN_PASSWORD` | No | — | TURN password (optional) |

---

## Socket.IO Events

### Client → Server

| Event | Payload | Callback Response |
|-------|---------|-------------------|
| `create-room` | `{}` | `{ success: true, data: { roomCode, expiresIn } }` or error |
| `join-room` | `{ roomCode, deviceName }` | `{ success: true }` or error |
| `accept-request` | `{}` | `{ success: true, sessionToken }` or error |
| `reject-request` | `{}` | `{ success: true }` or error |
| `start-sharing` | `{}` | `{ success: true }` or error |
| `stop-sharing` | `{}` | `{ success: true }` or error |
| `disconnect-session` | `{}` | `{ success: true }` or error |
| `webrtc-offer` | `{ sdp, sessionToken }` | `undefined` or error string |
| `webrtc-answer` | `{ sdp, sessionToken }` | `undefined` or error string |
| `ice-candidate` | `{ candidate, sdpMid, sdpMLineIndex, sessionToken }` | `undefined` or error string |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `room-created` | `{ roomCode, expiresIn }` | Sent to host after room creation |
| `presentation-request` | `{ deviceName }` | Sent to host when presenter joins |
| `accept-request` | `{ approved, sessionToken? }` | Sent to presenter after host decision |
| `webrtc-offer` | `{ sdp, sessionToken }` | Forwarded offer from presenter to host |
| `webrtc-answer` | `{ sdp, sessionToken }` | Forwarded answer from host to presenter |
| `ice-candidate` | `{ candidate, sdpMid, sdpMLineIndex, sessionToken }` | Forwarded ICE candidate |
| `start-sharing` | `{}` | Notifies host that presenter started sharing |
| `stop-sharing` | `{}` | Notifies host that presenter stopped sharing |
| `disconnect-session` | `{}` | Notifies both sides of session termination |
| `connection-lost` | `{ message }` | Sent when socket reconnection fails |

---

## Room States

| State | Description |
|-------|-------------|
| `WAITING` | Room created, waiting for presenter |
| `REQUESTED` | Presenter joined, waiting for host approval |
| `APPROVED` | Host approved, WebRTC negotiation begins |
| `STREAMING` | Screen sharing is active |
| `ENDED` | Session ended normally |
| `EXPIRED` | Room timed out |
| `DESTROYED` | Room explicitly destroyed |

---

## WebRTC Service

The `WebRTCService` class (`frontend/src/services/webrtc.ts`) manages the peer connection lifecycle:

- `createPeerConnection()` — creates a new `RTCPeerConnection` with STUN/TURN config
- `acquireLocalStream()` — calls `getDisplayMedia` with audio/video constraints
- `createOffer()` / `createAnswer()` — generates SDP offers and answers
- `setRemoteOffer()` / `setRemoteDescription()` — sets remote SDP
- `setIceCandidateHandler()` — sets callback for outgoing ICE candidates
- `addIceCandidate()` — adds remote ICE candidate (buffered if remote description not set)
- `cleanup()` — stops all tracks, closes peer connection, clears state

### ICE Candidate Buffering

Candidates arriving before `setRemoteDescription` completes are buffered and flushed automatically once the remote description is set. This prevents `InvalidStateError` on fast networks.

---

## Security Model

### Authentication

- No user accounts
- Room access controlled by 6-character room code
- WebRTC signaling protected by `sessionToken` issued on approval

### Authorization

- Socket event handlers validate caller is the room host or presenter before acting
- Session tokens are validated on every WebRTC signaling message
- Rate limiter prevents room creation abuse (10/hour per socket)

### Input Validation

- All socket payloads validated using Zod schemas
- Room codes: exactly 6 alphanumeric characters
- Device names: max 50 characters, sanitized
- SDP strings: validated before forwarding
- ICE candidates: validated before forwarding
- Session tokens: 32-character alphanumeric

---

## Error Handling

### Backend

- All socket handlers wrapped in try/catch
- Errors returned via Socket.IO callback as `{ success: false, code, message }`
- Room maintenance interval wrapped in try/catch
- Pino logger captures structured error data

### Frontend

- Socket connection errors shown via toast notifications
- Connection status button reflects actual socket state
- WebRTC errors shown with descriptive messages
- Screen capture errors include diagnostic information
- Autoplay blocks show "Tap to play" fallback

---

## Deployment

### Current Production

- **Frontend**: Render Static Site
  - URL: https://castall.onrender.com
  - Build: Vite → `dist/`
  - Routing: HashRouter
  - Env: `VITE_SOCKET_URL=https://castall-backend.onrender.com`

- **Backend**: Render Web Service
  - URL: https://castall-backend.onrender.com
  - Build: TypeScript → `dist/`
  - Env: `NODE_ENV=production`, `FRONTEND_URL=https://castall.onrender.com`

### Cold Start Behavior

Render free tier services spin down after inactivity. The first request after a period of inactivity may take 10-30 seconds while the service starts. Subsequent requests are fast.

---

## Known Technical Limitations

1. **No TURN server** — STUN-only works for same-LAN but fails across symmetric NATs
2. **In-memory state** — server restart clears all rooms
3. **No reconnection recovery** — if the socket drops mid-session, WebRTC is not automatically recreated
4. **No renegotiation** — if presenter's resolution changes, connection cannot adapt
5. **Rate limiter per-socket** — multiple tabs can bypass the limit
6. **Android screen capture** — `getDisplayMedia` availability varies by device/browser
7. **Android audio** — not supported by `getDisplayMedia` on Android Chrome
8. **iOS Safari** — `getDisplayMedia` not exposed by Apple

---

## Performance Characteristics

- Media bitrate: negotiated by WebRTC (typically 1-4 Mbps for screen sharing)
- Frame rate: 30 FPS target
- Signaling latency: ~50-200ms via Render
- Media latency on same LAN: typically <100ms
- Frontend bundle: ~745KB JS + ~27KB CSS (single page)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/DipeshR23">Dipesh Rijal</a>
</p>
