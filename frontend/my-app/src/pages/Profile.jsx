import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Profile.css";
import { NavLink } from "react-router-dom";

export default function Profile() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    axios.get(`http://localhost:5000/profile/${user.id}`)
      .then(res => setUserData(res.data.user))
      .catch(err => console.error("Error fetching profile:", err));
  }, []);

  if (!userData) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <p><strong>Username:</strong> {userData.username}</p>
      <p><strong>Email:</strong> {userData.email}</p>
      <p><strong>Total Predictions Made:</strong> {userData.prediction_count}</p>
      <p><strong>Most Common Prediction:</strong> {userData.most_common_disease}</p>
      <NavLink to="/change-password">Change Password</NavLink>
    </div>
  );
}