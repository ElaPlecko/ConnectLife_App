import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

//const ADMIN_EMAILS = import.meta.env.VITE_ADMIN_EMAILS?.split(",") || [];
const ADMIN_EMAILS =
  (import.meta.env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map(e => e.trim().toLowerCase());

const email = userEmail.trim().toLowerCase();

export default function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const checkAdminAccess = async (userEmail) => {
    if (ADMIN_EMAILS.includes(userEmail)) {
      navigate("/dashboard");
    } else {
      await auth.signOut();
      setError("Access denied. Your account is not on the admin list.");
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      console.log("RAW EMAIL:", result.user.email);
console.log("EMAIL JSON:", JSON.stringify(result.user.email));
console.log("ADMIN LIST:", ADMIN_EMAILS);


      alert(`
User: ${result.user.email}

Admins:
${JSON.stringify(ADMIN_EMAILS)}
`);

      await checkAdminAccess(result.user.email);
    } catch (err) {
      console.error(err);
      setError("Google sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
  e.preventDefault();

  setLoading(true);
  setError("");

  try {
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    navigate("/dashboard");
  } catch (err) {
    console.error(err);

    switch (err.code) {
      case "auth/user-not-found":
        setError("User does not exist.");
        break;

      case "auth/wrong-password":
        setError("Wrong password.");
        break;

      case "auth/invalid-credential":
        setError("Invalid email or password.");
        break;

      default:
        setError("Login failed. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Serif+Display&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
          background: #0a0a0a;
        }

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
            radial-gradient(ellipse 60% 50% at 20% 80%, rgba(0,180,140,.12) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 80% 20%, rgba(0,140,200,.08) 0%, transparent 70%);
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        .brand {
          position: relative;
          z-index: 1;
        }

        .left-content {
          position: relative;
          z-index: 1;
        }

        .left-content h1 {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(36px, 4vw, 52px);
          color: white;
          line-height: 1.1;
          margin-bottom: 20px;
        }

        .left-content h1 span {
          background: linear-gradient(90deg, #00b48c, #0088c8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .left-content p {
          color: rgba(255,255,255,.45);
          max-width: 340px;
          line-height: 1.7;
        }

        .right-panel {
          background: #f8f7f4;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
        }

        .login-card {
          width: 100%;
          max-width: 380px;
        }

        .eyebrow {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .12em;
          color: #00b48c;
          margin-bottom: 10px;
          font-weight: 500;
        }

        h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 30px;
          margin-bottom: 8px;
        }

        .subtitle {
          color: #888;
          margin-bottom: 32px;
        }

        .form-group {
          margin-bottom: 12px;
        }

        .input {
          width: 100%;
          padding: 14px;
          border: 1px solid #ddd;
          border-radius: 10px;
          font-size: 14px;
          background: white;
        }

        .input:focus {
          outline: none;
          border-color: #00b48c;
        }

        .email-btn,
        .google-btn {
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: .2s;
        }

        .email-btn {
          background: #00b48c;
          color: white;
          margin-top: 8px;
        }

        .email-btn:hover {
          opacity: .95;
        }

        .divider {
          text-align: center;
          margin: 20px 0;
          color: #999;
          font-size: 13px;
        }

        .google-btn {
          background: white;
          border: 1px solid #ddd;
          color: #111;
        }

        .google-btn:hover {
          border-color: #00b48c;
        }

        .error-box {
          margin-top: 16px;
          padding: 12px;
          background: #fff5f5;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          font-size: 13px;
        }

        .notice {
          margin-top: 24px;
          padding: 14px;
          border-radius: 8px;
          background: rgba(0,180,140,.06);
          border: 1px solid rgba(0,180,140,.15);
          font-size: 12px;
          line-height: 1.6;
        }

        @media (max-width:768px) {
          .login-root {
            grid-template-columns: 1fr;
          }

          .left-panel {
            display: none;
          }
        }
      `}</style>

      <div className="login-root">
        <div className="left-panel">
          <div className="grid-overlay" />

          <div className="brand">
            <img
              src="/connectlife_logo.png"
              alt="ConnectLife"
              style={{ height: "3rem" }}
            />
          </div>

          <div className="left-content">
            <h1>
              Market config
              <br />
              made <span>simple.</span>
            </h1>

            <p>
              Manage feature flags, content and external links per market —
              without a new app release.
            </p>
          </div>
        </div>

        <div className="right-panel">
          <div className="login-card">
            <div className="eyebrow">Admin access</div>

            <h2>Welcome back</h2>

            <p className="subtitle">
              Sign in with your account to access the portal.
            </p>

            <form onSubmit={handleEmailLogin}>
              <div className="form-group">
                <input
                  className="input"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  className="input"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="email-btn"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in with Email"}
              </button>
            </form>

            <div className="divider">or</div>

            <button
              className="google-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              Continue with Google
            </button>

            {error && (
              <div className="error-box">
                {error}
              </div>
            )}

            <div className="notice">
              <strong>Internal use only.</strong> Access is restricted to
              authorised admin accounts.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}