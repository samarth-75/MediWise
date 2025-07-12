import { useState } from "react";
import axios from "axios";
import "../styles/Predict.css";

const symptomList = [
  "fever", "headache", "cough", "sore_throat", "fatigue", "nausea", "vomiting",
  "diarrhea", "joint_pain", "rash", "loss_of_appetite", "chest_pain"
];

export default function Predict() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [prediction, setPrediction] = useState("");

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async () => {
  try {
    // 🔑 Get the logged-in user from localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      setPrediction("Please log in first.");
      return;
    }

    // 📦 Send user_id + symptoms to backend
    const res = await axios.post("https://mediwise-7zso.onrender.com/predict", {
      symptoms: selectedSymptoms,
      user_id: user.id,
    });

    setPrediction(res.data.prediction);
  } catch (err) {
    setPrediction("Something went wrong!");
  }
};

  return (
    <div className="predict-container">
      <h2>Disease Predictor</h2>
      <p>Select the symptoms you are experiencing:</p>

      <div className="symptom-grid">
        {symptomList.map((symptom) => (
          <label key={symptom}>
            <input
              type="checkbox"
              value={symptom}
              checked={selectedSymptoms.includes(symptom)}
              onChange={() => toggleSymptom(symptom)}
            />
            {symptom.replaceAll("_", " ")}
          </label>
        ))}
      </div>

      <button onClick={handleSubmit}>Predict</button>

      {prediction && (
        <div className="prediction-result">
          <strong>Predicted Disease:</strong> {prediction}
        </div>
      )}
    </div>
  );
}