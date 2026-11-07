import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { QueryProvider } from './providers/QueryProvider.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';

// Foreground push notification handler — shows a native browser notification when app is open
import { messaging, onMessage } from './firebase.js';
if (messaging) {
  onMessage(messaging, (payload) => {
    const title = payload.notification?.title || 'Norozz';
    const body = payload.notification?.body || '';
    const icon = payload.notification?.image || '/logo.png';
    const link = payload.data?.link || '/';
    if (Notification.permission === 'granted') {
      const n = new Notification(title, { body, icon });
      n.onclick = () => { window.focus(); window.location.pathname = link; };
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  </StrictMode>,
);
