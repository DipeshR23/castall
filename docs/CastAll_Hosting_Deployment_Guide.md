# CastAll Hosting and Deployment Guide

## Current Production Deployment

CastAll is currently deployed on **Render** with two services:

| Service | Type | URL |
|---------|------|-----|
| Frontend | Static Site | https://castall.onrender.com |
| Backend | Web Service | https://castall-backend.onrender.com |

---

## Prerequisites

- Node.js 18+ and npm
- Git
- Render account (free tier sufficient)

---

## Local Development

### 1. Clone the Repository

```bash
git clone <repository-url>
cd castall
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Configure Environment Variables

Create `backend/.env`:
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
STUN_SERVER=stun:stun.l.google.com:19302
```

Create `frontend/.env`:
```env
VITE_SOCKET_URL=http://localhost:3000
VITE_STUN_SERVER=stun:stun.l.google.com:19302
```

### 4. Start Development Servers

```bash
npm run dev
```

This starts:
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

### 5. Open the App

Navigate to http://localhost:5173

---

## Production Deployment on Render

### Frontend (Static Site)

1. **Create a new Static Site** on Render
2. **Connect your GitHub repository**
3. **Configure build settings**:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist/`
   - **Node Version**: 18+
4. **Add environment variable**:
   - `VITE_SOCKET_URL` = `https://castall-backend.onrender.com`
5. **Click Create Static Site**

### Backend (Web Service)

1. **Create a new Web Service** on Render
2. **Connect your GitHub repository**
3. **Configure build settings**:
   - **Build Command**: `npm run build --workspace=backend`
   - **Start Command**: `npm start --workspace=backend`
   - **Node Version**: 18+
   - **Plan**: Free tier is sufficient for testing
4. **Add environment variables**:
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://castall.onrender.com`
   - `STUN_SERVER` = `stun:stun.l.google.com:19302` (optional, this is the default)
5. **Click Create Web Service**

### Important: Order of Deployment

When deploying for the first time or after major changes:

1. **Deploy backend first** — ensure it is running and healthy
2. **Deploy frontend second** — it needs the backend URL to be live
3. **Verify health**: `https://castall-backend.onrender.com/health` should return `{"status":"ok"}`

### Environment Variables Reference

#### Frontend (Render Static Site)

| Variable | Value | Required |
|----------|-------|----------|
| `VITE_SOCKET_URL` | `https://castall-backend.onrender.com` | Yes |

#### Backend (Render Web Service)

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | Yes |
| `FRONTEND_URL` | `https://castall.onrender.com` | Yes |
| `STUN_SERVER` | `stun:stun.l.google.com:19302` | No (default) |
| `TURN_SERVER` | Your TURN URL | No (optional) |
| `TURN_USERNAME` | Your TURN username | No (optional) |
| `TURN_PASSWORD` | Your TURN password | No (optional) |

---

## Post-Deployment Checklist

- [ ] Backend health check returns `{"status":"ok"}` at `/health`
- [ ] Frontend loads at the production URL
- [ ] Host page loads and shows room creation
- [ ] Share page loads and shows join form
- [ ] QR code is generated correctly
- [ ] QR scanner works (camera + image upload)
- [ ] Room joining works via code entry
- [ ] Host can accept/decline requests
- [ ] WebRTC connection establishes (test on same LAN)
- [ ] Screen sharing works from desktop Chrome
- [ ] Presentation page displays shared screen
- [ ] Exit button returns to landing page
- [ ] Connection status button shows correct state
- [ ] Toast notifications appear for actions

---

## Custom Domain (Optional)

To use a custom domain instead of `*.onrender.com`:

### Frontend

1. In Render → Frontend Static Site → Settings → Custom Domains
2. Add your custom domain
3. Update DNS records as instructed by Render
4. Update `VITE_SOCKET_URL` to use your custom domain for the backend

### Backend

1. In Render → Backend Web Service → Settings → Custom Domains
2. Add your custom domain
3. Update `FRONTEND_URL` to match your custom frontend domain
4. Update `VITE_SOCKET_URL` in frontend to match your custom backend domain

---

## Troubleshooting Deployment

### Frontend shows "Not Found" on refresh or direct URL

**Cause**: SPA routing on static host.

**Solution**: CastAll uses `HashRouter` which avoids this issue. URLs will include a hash fragment (e.g., `/#/host`). If you changed to `BrowserRouter`, you need SPA fallback configuration on your host.

### Backend CORS errors

**Cause**: `FRONTEND_URL` not set or mismatched.

**Solution**: Ensure `FRONTEND_URL` in backend env exactly matches the frontend origin (including `https://`).

### Socket.IO connection fails

**Cause**: `VITE_SOCKET_URL` not set or incorrect.

**Solution**: Ensure `VITE_SOCKET_URL` in frontend env points to the backend WebSocket URL (e.g., `https://castall-backend.onrender.com`). After changing, redeploy the frontend.

### Cold start delays

**Cause**: Render free tier spins down inactive services.

**Solution**: Normal behavior. The first request after inactivity takes 10-30 seconds. Subsequent requests are fast. Upgrade to paid plan for always-on.

### Room creation fails with rate limit

**Cause**: Too many room creations from the same socket.

**Solution**: Wait 1 hour or use a different browser/incognito window. Rate limit is 10 rooms/hour per socket.

---

## Scaling Considerations

### Free Tier Limits

| Resource | Limit |
|----------|-------|
| Frontend bandwidth | 100 GB/month |
| Backend bandwidth | 100 GB/month |
| Backend RAM | 512 MB |
| Backend CPU | Shared |
| Cold start | 10-30 seconds after inactivity |

### When to Upgrade

- If you need faster cold starts → upgrade to Render paid plan
- If you need persistent room storage → add a database
- If you need cross-network sharing → add a TURN server
- If you need multi-viewer rooms → significant architecture changes needed

---

## Security Checklist for Production

- [ ] `NODE_ENV=production` set on backend
- [ ] `FRONTEND_URL` matches actual frontend origin
- [ ] `VITE_SOCKET_URL` points to production backend
- [ ] No `.env` files committed to git
- [ ] Helmet security headers enabled (default)
- [ ] CORS restricted to frontend origin only
- [ ] HTTPS enabled on both services (Render provides this)
- [ ] Rate limiting enabled
- [ ] Input validation on all Socket.IO events
- [ ] Session tokens used for WebRTC signaling

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/DipeshR23">Dipesh Rijal</a>
</p>
