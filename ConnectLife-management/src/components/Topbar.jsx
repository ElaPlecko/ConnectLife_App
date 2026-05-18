export default function Topbar({ onNavigate }) {
  return (
    <header className="topbar">
      <h1>ConnectLife App Management Portal (POC)</h1>
      <div className="user-tools">
        <button className="icon-button" type="button" aria-label="Help">?</button>
        <button className="login-button" type="button" onClick={() => onNavigate("login")}>
          Logout
        </button>
      </div>
    </header>
  );
}
