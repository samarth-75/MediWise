import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import pickle

# 👨‍⚕ Define symptoms and mock disease dataset
data = [
    {"fever": 1, "cough": 1, "sore_throat": 1, "rash": 0, "nausea": 0, "joint_pain": 0, "disease": "Flu"},
    {"fever": 0, "cough": 0, "sore_throat": 0, "rash": 1, "nausea": 1, "joint_pain": 1, "disease": "Dengue"},
    {"fever": 1, "cough": 0, "sore_throat": 0, "rash": 1, "nausea": 1, "joint_pain": 0, "disease": "Chickenpox"},
    {"fever": 0, "cough": 1, "sore_throat": 1, "rash": 0, "nausea": 0, "joint_pain": 0, "disease": "Cold"},
    {"fever": 1, "cough": 1, "sore_throat": 0, "rash": 1, "nausea": 1, "joint_pain": 1, "disease": "Typhoid"},
]

df = pd.DataFrame(data)

# 🧪 Features and Labels
X = df.drop("disease", axis=1)
y = df["disease"]

# 📊 Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# 🧠 Train Random Forest Classifier
model = RandomForestClassifier()
model.fit(X_train, y_train)

# 💾 Save the model
with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

print("✅ Model trained and saved as model.pkl")