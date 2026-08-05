import { Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import LandingPage from './pages/LandingPage';
import HostPage from './pages/HostPage';
import SharePage from './pages/SharePage';
import PresentationPage from './pages/PresentationPage';
import ErrorPage from './pages/ErrorPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/host" element={<HostPage />} />
        <Route path="/share" element={<SharePage />} />
        <Route path="/presentation" element={<PresentationPage />} />
        <Route path="/error" element={<ErrorPage />} />
      </Route>
    </Routes>
  );
}
