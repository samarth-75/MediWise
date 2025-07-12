import { useState } from "react";
import axios from "axios";
import "../styles/ChangePassword.css";

export default function ChangePassword() {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [message, setMessage] = useState("");

  const handleChangePassword = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    if (newPass !== confirmPass) {
      setMessage("New passwords do not match.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/change-password", {
        user_id: user.id,
        old_password: oldPass,
        new_password: newPass
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="change-password-container">
      <h2>Change Password</h2>
      <input
        type="password"
        placeholder="Old Password"
        value={oldPass}
        onChange={(e) => setOldPass(e.target.value)}
      />
      <input
        type="password"
        placeholder="New Password"
        value={newPass}
        onChange={(e) => setNewPass(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm New Password"
        value={confirmPass}
        onChange={(e) => setConfirmPass(e.target.value)}
      />
      <button onClick={handleChangePassword}>Update Password</button>
      {message && <p className="message">{message}</p>}
    </div>
  );
}