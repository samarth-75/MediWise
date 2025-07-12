import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/ViewHistory.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ Make sure this is named autoTable

export default function ViewHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    axios
      .get(`https://mediwise-7zso.onrender.com/history/${user.id}`)
      .then((res) => setHistory(res.data.history))
      .catch((err) => console.error("Error fetching history:", err));
  }, []);

  const exportToPDF = () => {
    const doc = new jsPDF();
doc.text("Prediction History", 14, 10);

const tableColumn = ["Date", "Symptoms", "Prediction"];
const tableRows = [];

history.forEach((entry) => {
  const row = [
    new Date(entry.predicted_on).toLocaleString(),
    entry.symptoms,
    entry.prediction,
  ];
  tableRows.push(row);
});

autoTable(doc, {
  head: [tableColumn],
  body: tableRows,
  startY: 20,
});

doc.save("prediction_history.pdf");
  };

  return (
    <div className="history-container">
      <h2>Prediction History</h2>

      {history.length === 0 ? (
        <p>No predictions found.</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Symptoms</th>
                <th>Predicted Disease</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={index}>
                  <td>{item.symptoms}</td>
                  <td>{item.prediction}</td>
                  <td>{new Date(item.predicted_on).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ✅ Button placed outside the table */}
          <button
            className="export-btn"
            onClick={exportToPDF}
            style={{
              marginTop: "30px",
              marginLeft: "auto",
              marginRight: "auto",
              display: "block",
            }}
          >
            Export to PDF
          </button>
        </>
      )}
    </div>
  );
}