from flask import Flask, request, jsonify
from flask_cors import CORS
from db_config import get_connection
import pickle
import numpy as np

# 🔁 Load the trained ML model
model = pickle.load(open("model.pkl", "rb"))

# 👨‍⚕ Symptoms must match model training order
all_symptoms = ["fever", "cough", "sore_throat", "rash", "nausea", "joint_pain"]

app = Flask(__name__)

# ✅ Enable CORS for your frontend URL
CORS(app, resources={r"/*": {"origins": "https://deluxe-toffee-8821ec.netlify.app"}})

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data["username"]
    email = data["email"]
    password = data["password"]

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
                       (username, email, password))
        conn.commit()
        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data["email"]
    password = data["password"]

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
    "SELECT id, username, email, created_on FROM users WHERE email = %s AND password = %s",
    (email, password)
)
        user = cursor.fetchone()

        if user:
            return jsonify({"message": "Login successful", "user": user}), 200
        else:
            return jsonify({"message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# ✅ ADD THIS PREDICT ENDPOINT
@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        return '', 200

    data = request.json
    symptoms = data.get("symptoms", [])
    user_id = data.get("user_id")  # Frontend must send this

    input_vector = [1 if symptom in symptoms else 0 for symptom in all_symptoms]
    prediction = model.predict([input_vector])[0]

    # Save prediction to history table
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO prediction_history (user_id, symptoms, prediction) VALUES (%s, %s, %s)",
            (user_id, ','.join(symptoms), prediction)
        )
        conn.commit()
    except Exception as e:
        print("Error saving prediction:", e)
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

    return jsonify({"prediction": prediction})

@app.route("/history/<int:user_id>", methods=["GET"])
def get_history(user_id):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT symptoms, prediction, predicted_on FROM prediction_history WHERE user_id = %s ORDER BY predicted_on DESC",
            (user_id,)
        )
        history = cursor.fetchall()
        return jsonify({"history": history})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route("/profile/<int:user_id>", methods=["GET"])
def get_profile(user_id):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Get user info
        cursor.execute("SELECT id, username, email FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 404

        # Total predictions count
        cursor.execute("SELECT COUNT(*) AS count FROM prediction_history WHERE user_id = %s", (user_id,))
        user["prediction_count"] = cursor.fetchone()["count"]

        # Most common prediction
        cursor.execute("""
            SELECT prediction, COUNT(*) AS freq
            FROM prediction_history
            WHERE user_id = %s
            GROUP BY prediction
            ORDER BY freq DESC
            LIMIT 1
        """, (user_id,))
        result = cursor.fetchone()
        user["most_common_disease"] = result["prediction"] if result else "N/A"

        return jsonify({"user": user})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@app.route("/change-password", methods=["POST"])
def change_password():
    data = request.json
    user_id = data.get("user_id")
    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not (user_id and old_password and new_password):
        return jsonify({"error": "Missing data"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Get existing password
        cursor.execute("SELECT password FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 404

        if user["password"] != old_password:
            return jsonify({"error": "Old password is incorrect"}), 401

        # Update password
        cursor.execute("UPDATE users SET password = %s WHERE id = %s", (new_password, user_id))
        conn.commit()

        return jsonify({"message": "Password changed successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)