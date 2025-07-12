import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "../styles/Dashboard.css";
import "../styles/Profile.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalPredictions: 0,
    mostPredicted: "N/A",
    lastPrediction: "N/A",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Fetch stats
      fetch(`http://localhost:5000/history/${parsedUser.id}`)
        .then((res) => res.json())
        .then((data) => {
          const history = data.history || [];
          const total = history.length;

          let frequency = {};
          let last = "N/A";

          history.forEach((item) => {
            frequency[item.prediction] = (frequency[item.prediction] || 0) + 1;
          });

          let mostPredicted = Object.entries(frequency).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
          if (total > 0) last = history[0].prediction;

          setStats({
            totalPredictions: total,
            mostPredicted,
            lastPrediction: last,
          });
        });
    }
  }, []);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <header className="navbar">
        <h1>MediWise</h1>
        <div className="nav-buttons">
          <NavLink to="/profile" className="nav-link">Profile</NavLink>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <main className="main-content">
        <h2>Welcome, {user?.username} 👋</h2>
        <p>
  Joined on:{" "}
  {user?.created_on
    ? new Date(user.created_on).toLocaleDateString('en-GB')
    : "Unknown"}
</p>
        <div className="stats-card">
          <h3>Quick Stats</h3>
          <p>Total Predictions: {stats.totalPredictions}</p>
          <p>Most Common Prediction: {stats.mostPredicted}</p>
          <p>Last Prediction: {stats.lastPrediction}</p>
        </div>

        <div className="action-buttons">
          <button onClick={() => navigate("/predict")}>🔍 Predict Disease</button>
          <button onClick={() => navigate("/history")}>📜 View History</button>
        </div>

        <div className="health-tip">
          <h3>💡 Health Tip of the Day</h3>
          <p>Drink plenty of water and get 7–8 hours of sleep to stay healthy!</p>
        </div>
      </main>
    </div>
  );
}