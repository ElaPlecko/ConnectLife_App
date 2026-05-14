import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const ADMIN_EMAILS = import.meta.env.VITE_ADMIN_EMAILS?.split(",") || [];

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
const email = result.user.email;
console.log("Email ki se je prijavil:", email);
console.log("Seznam adminov:", ADMIN_EMAILS);
if (ADMIN_EMAILS.includes(email)) {
        navigate("/dashboard");
      } else {
        await auth.signOut();
        setError("Dostop zavrnjen. Tvoj račun ni na seznamu adminov.");
      }
    } catch (err) {
      setError("Napaka pri prijavi. Poskusi znova.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Serif+Display&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
          background: #0a0a0a;
        }

        /* LEFT PANEL */
        .left-panel {
          position: relative;
          background: #0d1117;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          overflow: hidden;
        }

        .left-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 20% 80%, rgba(0, 180, 140, 0.12) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 80% 20%, rgba(0, 140, 200, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .brand {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #00b48c, #0088c8);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-icon svg {
          width: 20px;
          height: 20px;
          fill: none;
          stroke: white;
          stroke-width: 2;
          stroke-linecap: round;
        }

        .brand-name {
          font-size: 15px;
          font-weight: 500;
          color: rgba(255,255,255,0.9);
          letter-spacing: -0.01em;
        }

        .left-content {
          position: relative;
          z-index: 1;
        }

        .left-content h1 {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(36px, 4vw, 52px);
          color: #ffffff;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 20px;
        }

        .left-content h1 span {
          background: linear-gradient(90deg, #00b48c, #0088c8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .left-content p {
          font-size: 15px;
          color: rgba(255,255,255,0.45);
          line-height: 1.7;
          max-width: 340px;
          font-weight: 300;
        }

        .feature-list {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          font-weight: 300;
        }

        .feature-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00b48c, #0088c8);
          flex-shrink: 0;
        }

        /* RIGHT PANEL */
        .right-panel {
          background: #f8f7f4;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
          position: relative;
        }

        .right-panel::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #00b48c, #0088c8);
        }

        .login-card {
          width: 100%;
          max-width: 380px;
        }

        .login-card-header {
          margin-bottom: 40px;
        }

        .login-card-header .eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #00b48c;
          margin-bottom: 10px;
        }

        .login-card-header h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 30px;
          color: #0d1117;
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin-bottom: 8px;
        }

        .login-card-header p {
          font-size: 14px;
          color: #888;
          font-weight: 300;
          line-height: 1.6;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 28px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #e5e3de;
        }

        .divider-text {
          font-size: 12px;
          color: #bbb;
          font-weight: 300;
        }

        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px 24px;
          background: #ffffff;
          border: 1.5px solid #e5e3de;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #0d1117;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          letter-spacing: -0.01em;
        }

        .google-btn:hover:not(:disabled) {
          border-color: #00b48c;
          box-shadow: 0 0 0 4px rgba(0, 180, 140, 0.08);
          transform: translateY(-1px);
        }

        .google-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .google-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .google-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .btn-text {
          flex: 1;
          text-align: center;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0,0,0,0.1);
          border-top-color: #00b48c;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-box {
          margin-top: 16px;
          padding: 12px 16px;
          background: #fff5f5;
          border: 1px solid #fecaca;
          border-radius: 8px;
          font-size: 13px;
          color: #dc2626;
          display: flex;
          align-items: center;
          gap: 8px;
          line-height: 1.5;
        }

        .error-icon {
          font-size: 15px;
          flex-shrink: 0;
        }

        .notice {
          margin-top: 28px;
          padding: 14px 16px;
          background: rgba(0, 180, 140, 0.06);
          border: 1px solid rgba(0, 180, 140, 0.15);
          border-radius: 8px;
          font-size: 12px;
          color: #555;
          line-height: 1.6;
          font-weight: 300;
        }

        .notice strong {
          color: #00b48c;
          font-weight: 500;
        }

        .footer-note {
          margin-top: 32px;
          font-size: 12px;
          color: #bbb;
          text-align: center;
          font-weight: 300;
        }

        @media (max-width: 768px) {
          .login-root { grid-template-columns: 1fr; }
          .left-panel { display: none; }
          .right-panel { padding: 32px 24px; }
        }
      `}</style>

      <div className="login-root">
        {/* LEFT */}
        <div className="left-panel">
          <div className="grid-overlay" />
          <div className="brand">
            <div className="brand-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="brand-name">ConnectLife</span>
          </div>

          <div className="left-content">
            <h1>Market config<br />made <span>simple.</span></h1>
            <p>Upravljaj feature flags, vsebine in zunanje povezave za vsak trg — brez nove izdaje aplikacije.</p>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-dot" />
              Centralno upravljanje feature gatinga po trgih
            </div>
            <div className="feature-item">
              <div className="feature-dot" />
              FAQ, articles in webshop linki per market
            </div>
            <div className="feature-item">
              <div className="feature-dot" />
              JSON config API za mobilno aplikacijo
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="right-panel">
          <div className="login-card">
            <div className="login-card-header">
              <div className="eyebrow">Admin dostop</div>
              <h2>Dobrodošla nazaj</h2>
              <p>Prijavi se s svojim Hisense Google računom za dostop do portala.</p>
            </div>

            <button
              className="google-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <div className="loading-spinner" />
              ) : (
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span className="btn-text">
                {loading ? "Prijavljanje..." : "Nadaljuj z Gmailom"}
              </span>
            </button>

            {error && (
              <div className="error-box">
                <span className="error-icon">⚠</span>
                {error}
              </div>
            )}

            <div className="notice">
              <strong>Samo za interno ekipo.</strong> Dostop je omejen na pooblaščene ConnectLife admin račune. Če nimaš dostopa, se obrni na projektno vodjo.
            </div>

            <p className="footer-note">ConnectLife Admin Portal · Hisense · 2026</p>
          </div>
        </div>
      </div>
    </>
  );
}