import { useState, useEffect } from 'react';
import './Login.css';

/* ── SVG Icons ──────────────────────────────────── */
const IconLayers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="1.5">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconGithub = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
  </svg>
);

const IconSSO = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
  </svg>
);

/* ── Login Component ────────────────────────────── */
export default function Login() {
  const [identifier, setIdentifier]   = useState('');
  const [password,   setPassword]     = useState('');
  const [remember,   setRemember]     = useState(false);
  const [btnLabel,   setBtnLabel]     = useState('INITIALIZE SESSION');
  const [loading,    setLoading]      = useState(false);
  const [clock,      setClock]        = useState('--:--:--');
  const [sessionId,  setSessionId]    = useState('----');

  /* Live clock */
  useEffect(() => {
    const tick = () => setClock(new Date().toTimeString().slice(0, 8));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* Random session ID */
  useEffect(() => {
    const sid = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 16).toString(16).toUpperCase()
    ).join('');
    setSessionId(sid);
  }, []);

  /* Login animation */
  const handleLogin = async () => {
  if (loading) return;
  setLoading(true);
  setBtnLabel('AUTHENTICATING...');

  try {
    const response = await fetch('http://localhost:8000/api/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: identifier, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setBtnLabel('ACCESS GRANTED ✓');
      setTimeout(() => {
        // redirect or store token here
        window.location.href = '/dashboard';
      }, 1000);
    } else {
      setBtnLabel('ACCESS DENIED ✗');
      setTimeout(() => {
        setBtnLabel('INITIALIZE SESSION');
        setLoading(false);
      }, 1500);
    }
  } catch (err) {
    setBtnLabel('CONNECTION FAILED ✗');
    setTimeout(() => {
      setBtnLabel('INITIALIZE SESSION');
      setLoading(false);
    }, 1500);
  }
  };

  return (
    <div className="login-page">
      {/* Ambient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="login-wrap">
        {/* Status bar */}
        <div className="status-bar">
          <span>
            <span className="status-dot" />
            SECURE CHANNEL ACTIVE
          </span>
          <span>{clock}</span>
        </div>

        {/* Panel */}
        <div className="panel">
          {/* Logo */}
          <div className="logo-row">
            <div className="logo-icon">
              <IconLayers />
            </div>
            <div className="logo-text">
              <h1>NEXUS OS</h1>
              <p className="type-cursor">AUTHENTICATION PORTAL</p>
            </div>
          </div>

          <div className="section-label">USER CREDENTIALS</div>

          {/* Identifier field */}
          <div className="field">
            <label htmlFor="identifier">IDENTIFIER</label>
            <div className="input-wrap">
              <span className="input-icon"><IconUser /></span>
              <input
                id="identifier"
                type="text"
                placeholder="user@domain.sys"
                autoComplete="off"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
              />
              <div className="focus-line" />
            </div>
          </div>

          {/* Password field */}
          <div className="field">
            <label htmlFor="password">ACCESS KEY</label>
            <div className="input-wrap">
              <span className="input-icon"><IconLock /></span>
              <input
                id="password"
                type="password"
                placeholder="••••••••••••"
                autoComplete="off"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <div className="focus-line" />
            </div>
          </div>

          {/* Options row */}
          <div className="options-row">
            <label className="check-wrap" onClick={() => setRemember(r => !r)}>
              <input type="checkbox" readOnly checked={remember} />
              <div className={`custom-check${remember ? ' checked' : ''}`}>
                {remember && '✓'}
              </div>
              PERSIST SESSION
            </label>
            <a href="#" className="forgot-link">RECOVER ACCESS →</a>
          </div>

          {/* Submit */}
          <button
            className="btn-submit"
            onClick={handleLogin}
            disabled={loading}
          >
            <span>{btnLabel}</span>
          </button>

          {/* Divider */}
          <div className="divider">OR AUTHENTICATE VIA</div>

          {/* OAuth */}
          <div className="oauth-row">
            <button className="btn-oauth">
              <IconGithub /> GITHUB
            </button>
            <button className="btn-oauth">
              <IconSSO /> SSO
            </button>
          </div>

          {/* Footer */}
          <div className="panel-footer">
            NO ACCOUNT?&nbsp;<a href="#">REQUEST ACCESS</a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="bottom-bar">
          <span>SYS v4.2.1 // ENC:AES-256</span>
          <span>SID: {sessionId}</span>
        </div>
      </div>
    </div>
  );
}