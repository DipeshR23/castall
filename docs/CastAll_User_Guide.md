# CastAll User Guide

## What is CastAll?

CastAll is a browser-based wireless presentation system. You can share your screen or join someone else's presentation without installing any software. Everything runs in a web browser.

## Who Should Use This Guide

- **Presenters** — people who want to share their screen
- **Hosts/Viewers** — people who want to receive a presentation
- **Anyone** who needs a quick, no-install screen sharing solution

---

## Requirements

- A modern web browser: **Google Chrome** (desktop or Android) or **Microsoft Edge**
- **HTTPS** — the app must be accessed over a secure connection (required for camera and screen capture)
- Same local network (Wi-Fi/LAN) for best results
- JavaScript enabled in your browser

### Supported Devices

| Device | Role | Status |
|--------|------|--------|
| Windows laptop (Chrome/Edge) | Host or Presenter | ✅ Recommended |
| Mac laptop (Chrome/Edge) | Host or Presenter | ✅ Recommended |
| Android phone (Chrome) | Presenter | ⚠️ Conditional — see notes below |
| Android tablet (Chrome) | Presenter | ⚠️ Conditional |
| iPhone/iPad (Safari) | Not supported for screen sharing | ❌ |
| Smart TV / Panel browser | Host | ⚠️ Depends on TV browser capabilities |

### Android Screen Sharing Note

Screen sharing from an Android phone requires `navigator.mediaDevices.getDisplayMedia`, which may not be available on all Android devices or browsers. To use your phone as a presenter:

- Use **Google Chrome** (not a WebView or in-app browser)
- Chrome version 91 or higher
- Some device manufacturers restrict screen capture APIs — if unavailable, use a laptop as presenter instead

Audio capture is also not supported on Android — the system falls back to video-only screen sharing.

---

## Getting Started

### Open the App

Navigate to: **https://castall.onrender.com**

You will see the landing page with three options:
- **Host Presentation** — create a room and receive a screen share
- **Share Screen** — join an existing room and share your screen
- **Theme Toggle** — switch between light and dark mode

---

## Hosting a Presentation (Receiving a Screen)

1. On the landing page, click **Host Presentation**
2. A room is created automatically
3. You will see:
   - A **6-character room code** (e.g., `A7K4P2`)
   - A **QR code** containing the room link
   - A **Copy Code** button
4. Share the room code or QR code with the presenter
5. Wait for the presenter to join
6. When someone joins, you will see an **incoming presentation request** with their device name
7. Click **Accept** to approve, or **Decline** to reject
8. Once accepted, you will be taken to the **Presentation Page** where the shared screen appears
9. Click **Exit** to leave the session at any time

### Host Controls

| Button | Action |
|--------|--------|
| Copy Code | Copies the 6-character room code to your clipboard |
| Reset Room | Ends the current room and creates a new one |
| Back | Returns to the landing page |
| Accept | Approves the presenter's request |
| Decline | Rejects the presenter's request |
| Exit | Leaves the presentation session |

---

## Sharing Your Screen (Presenting)

### Step 1: Join a Room

On the landing page, click **Share Screen**. You will see the join form.

#### Option A — Scan QR Code
1. Click **Scan QR Code**
2. Choose **Camera Scan** or **Image Upload**
3. If using Camera: point your camera at the QR code
4. If using Image Upload: select a photo containing the QR code
5. The room code is filled in automatically

#### Option B — Enter Room Code
1. Type the 6-character room code into the **Room Code** field
2. Optionally enter your device name (visible to the host)
3. Click **Connect**

### Step 2: Wait for Approval

After joining, you will see a **Waiting for Approval** screen. The host must accept your request before you can start sharing.

### Step 3: Start Sharing

Once approved:
1. Click **Start Sharing**
2. A recommendation screen appears — select **Entire Screen** for best results
3. Click **Continue**
4. Your browser will prompt you to select what to share — choose your screen or window
5. Click **Share** in the browser dialog

### Step 4: Present

- Your screen is now being shared with the host
- Click **Stop Sharing** to end the session
- Or click **Exit** to leave the room entirely

---

## Presenter Controls

| Button | Action |
|--------|--------|
| Start Sharing | Begins screen capture and connects to host |
| Stop Sharing | Ends screen sharing but stays in the room |
| Exit | Ends session and returns to landing page |

---

## Presentation View (Host Side)

When the host accepts a presenter's request, the presentation page opens automatically.

- The shared screen fills the body area of the page (below the navigation bar)
- Connection status is shown in the top-left corner
- Click **Exit** to end the session and return to the host page
- If the screen is not playing automatically, click on the video area to start playback

---

## Connection Status

The **Connection Status** button in the top-left corner shows the current state:

| Status | Color | Meaning |
|--------|-------|---------|
| Connected | Green | You are in an active room session |
| Disconnected | Red | You are not in an active session |

---

## Theme

CastAll supports light and dark themes. Click the theme toggle in the navigation bar to switch. Your preference is saved automatically.

---

## Room Expiration

Rooms have a limited lifetime:

- **Waiting rooms** (host created, no presenter joined yet): expire after **15 minutes**
- **Requested rooms** (presenter joined, waiting for host approval): expire after **5 minutes**

Expired rooms are automatically cleaned up and cannot be rejoined.

---

## Troubleshooting

### Screen sharing does not start on Android

**Cause:** `getDisplayMedia` may not be available on all Android devices or browsers.

**Solution:**
- Ensure you are using Google Chrome (not a WebView or in-app browser)
- Chrome version 91 or higher
- Some devices restrict screen capture — try using a laptop as presenter instead

### Screen sharing permission denied

**Cause:** Browser permission was denied or not requested.

**Solution:**
- Check browser settings and allow screen capture permission for the site
- Refresh the page and try again
- Ensure the site is served over HTTPS

### Cannot see the shared screen

**Cause:** WebRTC connection not established or presenter stopped sharing.

**Solution:**
- Verify both devices are on the same network
- Check the presenter's screen is still being shared
- The host may need to refresh the presentation page

### Room code not working

**Cause:** Room may be expired, full, or code was entered incorrectly.

**Solution:**
- Room codes are case-insensitive but must be exactly 6 characters
- Check that the room has not expired
- Ask the host to verify the code or reset the room

### QR code not scanning

**Cause:** Camera permission denied, poor lighting, or QR code is not a valid CastAll room code.

**Solution:**
- Allow camera permission when prompted
- Ensure adequate lighting
- Hold the camera steady
- Try Image Upload instead of Camera Scan
- Ensure the QR code links to a CastAll room

### Host page stuck on "Connecting to server"

**Cause:** Backend server is not reachable or CORS is misconfigured.

**Solution:**
- Verify the backend is running
- Check that you are accessing the app over HTTPS
- Try refreshing the page
- Check browser console for specific error messages

### High latency or laggy video

**Cause:** Network congestion, weak Wi-Fi, or devices on different networks.

**Solution:**
- Ensure both devices are on the same local network (LAN)
- Move closer to the Wi-Fi router
- Reduce screen resolution or close other bandwidth-heavy applications
- Avoid using 2.4GHz Wi-Fi if 5GHz is available

---

## Security Notes

- Room codes are 6-character alphanumeric strings — anyone with the code can attempt to join
- No user accounts or login required
- All WebRTC media is encrypted end-to-end via SRTP
- Signaling data passes through the CastAll server but media flows directly between browsers
- Rooms are automatically cleaned up after expiration
- Session tokens protect WebRTC signaling from unauthorized access

---

## Feedback

If you encounter issues or have suggestions, please open an issue on the GitHub repository.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/DipeshR23">Dipesh Rijal</a>
</p>
