import { useState } from "react";
import { AUTH_USERS } from "../config/authUsers.js";
import { Table } from "../utils/helpers.jsx";
import toast from "react-hot-toast";

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

  const [showInviteModal, setShowInviteModal] =
    useState(false);

  const [inviteEmail, setInviteEmail] =
    useState("");

  const [users, setUsers] = useState(
    AUTH_USERS.map((user, index) => ({
      id: index,

      email: user.email,

      provider: user.provider,

      role:
        user.provider === "google"
          ? "admin"
          : "viewer",

      status: user.status || "Active",
    }))
  );

  const handleToggleStatus = (id) => {

    setUsers((prev) =>
      prev.map((user) => {

        if (user.id !== id) {
          return user;
        }

        return {
          ...user,

          status:
            user.status === "Active"
              ? "Draft"
              : "Active",
        };
      })
    );
  };

  const handleInviteUser = () => {

    if (!inviteEmail) {
      return;
    }

    const newUser = {
      id: Date.now(),

      email: inviteEmail,

      provider: "password",

      role: "viewer",

      status: "Active",
    };

    setUsers((prev) => [...prev, newUser]);

    toast.success("Invite sent", {
      duration: 3000,
    });

    window.location.href = `
      mailto:${inviteEmail}
      ?subject=ConnectLife Admin Dashboard Access
    `;

    setInviteEmail("");

    setShowInviteModal(false);
  };

  const rows = users.map((user) => (
    <tr key={user.id}>

      <td>{user.email}</td>

      <td>
        <span className="badge">
          {user.role}
        </span>
      </td>

      <td>
        <span
          className={`badge ${user.status.toLowerCase()}`}
        >
          {user.status}
        </span>
      </td>

      <td>

        {currentUserRole === "admin" &&
          user.role === "viewer" && (
            <button
              className="text-link"
              type="button"
              onClick={() =>
                handleToggleStatus(user.id)
              }
            >
              {user.status === "Active"
                ? "Disable"
                : "Enable"}
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
              onClick={() =>
                setShowInviteModal(true)
              }
            >
              Invite User
            </button>
          )
        }
      >
        <Table
          headers={[
            "User",
            "Role",
            "Status",
            "Actions",
          ]}
          rows={rows}
          minWidth={680}
        />
      </SimplePanel>

      {showInviteModal && (
        <div className="invite-modal-overlay">

          <div className="invite-modal">

            <h2>Invite User</h2>

            <p>
              Send dashboard access invitation
            </p>

            <input
              type="email"
              placeholder="Enter user email..."
              value={inviteEmail}
              onChange={(e) =>
                setInviteEmail(e.target.value)
              }
            />

            <div className="invite-modal-actions">

              <button
                className="secondary-button"
                onClick={() =>
                  setShowInviteModal(false)
                }
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={handleInviteUser}
              >
                Send Invite
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}