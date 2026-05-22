import { useState } from "react";
import { AUTH_USERS } from "../config/authUsers.js";
import { Table } from "../utils/helpers.jsx";

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

export function Users({ currentUserRole }){

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

    const email = prompt("Enter user email");

    if (!email) {
      return;
    }

    const newUser = {
      id: Date.now(),

      email,

      provider: "password",

      role: "viewer",

      status: "Active",
    };

    setUsers((prev) => [...prev, newUser]);

    window.location.href = `
        mailto:${email}
        ?subject=ConnectLife Admin Dashboard Access
        &body=Hello,

        You have been invited to access the ConnectLife Admin Dashboard.

        Please contact your administrator to receive your login credentials.

        Best regards,
        ConnectLife Team
        `;
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
        <span className={`badge ${user.status.toLowerCase()}`}>
          {user.status}
        </span>
      </td>

      <td>

        {currentUserRole === "admin" &&
            user.role === "viewer" && (
            <button
                className="text-link"
                type="button"
                onClick={() => handleToggleStatus(user.id)}
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
  <SimplePanel
    title="Users"
    action={
      currentUserRole === "admin" && (
        <button
          className="primary-button"
          type="button"
          onClick={handleInviteUser}
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
);
}