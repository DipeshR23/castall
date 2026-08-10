# CastAll Technical Documentation

## System Overview

CastAll is a one-to-one browser-based screen sharing system using WebRTC for peer-to-peer media streaming and Socket.IO for signaling. The system is designed for same-LAN operation with zero-cost hosting.

---

## Communication Architecture

### Signaling Channel

- **Protocol**: Socket.IO over WebSocket (WSS in production)
- **Purpose**: Room management, SDP offer/answer exchange, ICE candidate relay
- **Server**: Express.js + Socket.IO on Render Web Service
- **Client**: Socket.IO client in React frontend

### Media Channel

- **Protocol**: WebRTC (DTLS-SRTP)
- **Path**: Direct peer-to-peer (no server relay)
- **STUN**: Google free STUN server (`stun:stun.l.google.com:19302`)
- **TURN**: Not configured (out of scope for same-LAN)

---

## WebRTC Lifecycle

### Offer/Answer Exchange

```
Presenter (sender)
  ↓
  createPeerConnection()
  ↓
  acquireLocalStream() → getDisplayMedia()
  ↓
  createOffer() → setLocalDescription()
  ↓
  emit 'webrtc-offer' via Socket.IO
  ↓
Host (receiver)
  ↓
  setRemoteOffer(sdp) → setRemoteDescription('offer')
  ↓
  createAnswer() → setLocalDescription()
  ↓
  emit 'webrtc-answer' via Socket.IO
  ↓
Presenter receives answer
  ↓
  setRemoteDescription('answer')
```

### ICE Candidate Exchange

```
Both sides gather ICE candidates
  ↓
  onicecandidate fires for each candidate
  ↓
  emit 'ice-candidate' via Socket.IO
  ↓
  Backend forwards to the other peer
  ↓
  Receiver adds candidate via addIceCandidate()
  ↓
  (buffered if remote description not yet set)
```

### Connection States Monitored

| State | Event | Action |
|-------|-------|--------|
| `connected` | `onconnectionstatechange` | Normal operation |
| `disconnected` | `onconnectionstatechange` | Logged, no cleanup (transient) |
| `failed` | `onconnectionstatechange` | Cleanup peer connection |
| `failed` | `oniceconnectionstatechange` | Logged + cleanup |

---

## Room Lifecycle

```
WAITING
  ↓ (presenter joins)
REQUESTED
  ↓ (host approves)
APPROVED
  ↓ (presenter starts sharing)
STREAMING
  ↓ (session ends / room expires)
ENDED / EXPIRED / DESTROYED
  ↓ (cleanup interval runs)
Deleted from memory
```

### Room Expiration

| Room State | Timeout | Action |
|-----------|---------|--------|
| `WAITING` | 15 minutes | Marked `EXPIRED`, cleaned up |
| `REQUESTED` | 5 minutes | Marked `EXPIRED`, cleaned up |
| `STREAMING` | No timeout | Must be ended manually |

---

## Socket.IO Event Flow

### Room Creation

1. Host emits `create-room`
2. Backend validates rate limit
3. Backend creates room in `RoomManager`
4. Backend emits `room-created` to host with `roomCode` and `expiresIn`

### Room Joining

1. Presenter emits `join-room` with `{ roomCode, deviceName }`
2. Backend validates room code format, room existence, room status
3. Backend adds presenter to room, sets status to `REQUESTED`
4. Backend emits `presentation-request` to host socket

### Approval

1. Host emits `accept-request` or `reject-request`
2. Backend validates host is in room
3. Backend calls `approveRequest()` or `rejectRequest()`
4. Backend emits `accept-request` to presenter with `{ approved, sessionToken? }`

### WebRTC Signaling

1. Presenter creates offer after approval
2. Presenter emits `webrtc-offer` with `{ sdp, sessionToken }`
3. Backend validates session token, forwards to host
4. Host creates answer, emits `webrtc-answer`
5. Backend validates session token, forwards to presenter
6. Both sides emit `ice-candidate` for each candidate
7. Backend validates session token, forwards to other peer

### Session Control

1. Presenter emits `start-sharing` → backend validates room state → emits `start-sharing` to host
2. Presenter emits `stop-sharing` → backend ends session → emits `stop-sharing` to host
3. Presenter emits `disconnect-session` → backend ends session → emits `disconnect-session` to host
4. Socket disconnect → backend notifies other peer via `connection-lost`

---

## Data Structures

### RoomSession (Backend)

```typescript
{
  roomId: string;          // nanoid
  roomCode: string;        // 6-char alphanumeric
  status: RoomStatus;      // WAITING | REQUESTED | APPROVED | STREAMING | ENDED | EXPIRED | DESTROYED
  host: {
    socketId: string;
    connected: boolean;
    browser?: string;
    platform?: string;
  };
  presenter: {
    socketId: string;
    deviceName: string;
    connected: boolean;
    sessionToken?: string;
    browser?: string;
    platform?: string;
  } | null;
  createdAt: Date;
  expiresAt: Date;
  sessionToken: string | null;
}
```

### WebRTCService (Frontend)

```typescript
{
  peerConnection: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  iceCandidateHandler: ((candidate: RTCIceCandidateInit) => void) | null;
  iceCandidateBuffer: RTCIceCandidateInit[];
  remoteDescriptionSet: boolean;
}
```

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
