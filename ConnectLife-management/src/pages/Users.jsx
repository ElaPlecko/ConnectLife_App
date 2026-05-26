import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import emailjs from "@emailjs/browser";
import { Table } from "../utils/helpers.jsx";
import toast from "react-hot-toast";
import { auth } from "../firebase";
import { logAction } from "../utils/auditLog";

const EMAILJS_SERVICE_ID = "service_185kg2d";
const EMAILJS_TEMPLATE_ID = "template_hqwvatk";
const EMAILJS_PUBLIC_KEY = "LQKk6-F2C6OmP49YF";

function SimplePanel({ title, action, children }) {
  return (
    <section className="panel page-panel">
      <div className="panel-header">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Users({ currentUserRole }) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUserEmail = auth.currentUser?.email ?? "unknown";

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "users"));
      const loaded = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));
      setUsers(loaded);
    } catch (err) {
      console.error(err);
      toast.error("Could not load users.");
    } finally {
      setLoading(false);
    }
  }

  const handleToggleStatus = async (id) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    const newStatus = user.status === "Active" ? "Draft" : "Active";

    try {
      await updateDoc(doc(db, "users", id), { status: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
      );
      await logAction({
        userEmail: currentUserEmail,
        action: newStatus === "Active" ? "Enabled user" : "Disabled user",
        details: user.email,
      });
    } catch (err) {
      console.error(err);
      toast.error("Could not update user status.");
    }
  };

  const handleDeleteUser = async (id) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    try {
      await deleteDoc(doc(db, "users", id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted.");
      await logAction({
        userEmail: currentUserEmail,
        action: "Deleted user",
        details: user.email,
      });
    } catch (err) {
      console.error(err);
      toast.error("Could not delete user.");
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail) return;

    try {
      const newDoc = await addDoc(collection(db, "users"), {
        email: inviteEmail,
        provider: "password",
        status: "Active",
      });

      setUsers((prev) => [
        ...prev,
        { id: newDoc.id, email: inviteEmail, provider: "password", status: "Active" },
      ]);

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { to_email: inviteEmail },
        EMAILJS_PUBLIC_KEY
      );

      await logAction({
        userEmail: currentUserEmail,
        action: "Invited user",
        details: inviteEmail,
      });

      toast.success("User invited and email sent!");
      setInviteEmail("");
      setShowInviteModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    }
  };

  const rows = users.map((user) => (
    <tr key={user.id}>
      <td>{user.email}</td>
      <td>
        <span className="badge">
          {user.provider === "google" ? "admin" : "viewer"}
        </span>
      </td>
      <td>
        <span className={`badge ${user.status?.toLowerCase()}`}>
          {user.status}
        </span>
      </td>
      <td>
        {currentUserRole === "admin" && user.provider !== "google" && (
          <button
            className="text-link"
            type="button"
            onClick={() => handleToggleStatus(user.id)}
          >
            {user.status === "Active" ? "Disable" : "Enable"}
          </button>
        )}
        {currentUserRole === "admin" && (
          <button
            className="text-link"
            type="button"
            onClick={() => handleDeleteUser(user.id)}
            style={{ marginLeft: "8px", color: "red" }}
          >
            Delete
          </button>
        )}
      </td>
    </tr>
  ));

  return (
    <>
      <SimplePanel
        title="Users"
        action={
          currentUserRole === "admin" && (
            <button
              className="primary-button"
              type="button"
              onClick={() => setShowInviteModal(true)}
            >
              Invite User
            </button>
          )
        }
      >
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <Table
            headers={["User", "Role", "Status", "Actions"]}
            rows={rows}
            minWidth={680}
          />
        )}
      </SimplePanel>

      {showInviteModal && (
        <div className="invite-modal-overlay">
          <div className="invite-modal">
            <h2>Invite User</h2>
            <p>Send dashboard access invitation</p>
            <input
              type="email"
              placeholder="Enter user email..."
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <div className="invite-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setShowInviteModal(false)}
              >
                Cancel
              </button>
              <button className="primary-button" onClick={handleInviteUser}>
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}