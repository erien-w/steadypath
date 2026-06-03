# SteadyPath - AI Career & Wellbeing Assistant

SteadyPath is a modern web application designed to help users navigate their career paths while maintaining personal wellbeing. It features an integrated AI assistant powered by Rasa, resume analysis, and wellbeing tracking.

## 🚀 Quick Start

To run SteadyPath locally, you need to have three separate services running. Follow these steps in order:

### 1. Setup Environment
Ensure you are using **Python 3.10** for the best compatibility with Rasa.

```bash
# Create a virtual environment (if not already done)
python3.10 -m venv .venv

# Activate the environment
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

If you just want to activate the existing environment later, use:

```bash
cd /Users/macbook/my-rasa-assistant
source .venv/bin/activate
```

### 2. Start Services
You will need three terminal windows/tabs:

#### Terminal 1: Web Server (Frontend)
Hosts the user interface.
```bash
cd /Users/macbook/my-rasa-assistant
source .venv/bin/activate
python3 -m http.server 8000
```
Access the app at: [http://localhost:8000](http://localhost:8000)

#### Terminal 2: Rasa Server (AI Backend)
Handles the AI logic and chat processing.
```bash
cd /Users/macbook/my-rasa-assistant
source .venv/bin/activate
rasa run --enable-api --cors "*"
```
*Note: The `--cors "*"` flag is required for the web app to communicate with the AI.*

#### Terminal 3: Action Server (Custom Logic)
Handles specialized tasks like resume analysis.
```bash
cd /Users/macbook/my-rasa-assistant
source .venv/bin/activate
rasa run actions
```

---

## 🛠 Features

- **AI Chatbot**: Real-time career and personal development guidance.
- **Resume Analysis**: Upload your resume for personalized skill recommendations.
- **Wellbeing Tracking**: Daily mood check-ins and support.
- **Community**: Connect with peers and professional opportunities.
- **Profile Management**: Customize your username, email, and profile photo.

## 📁 Project Structure

- `assets/`: CSS styles, JavaScript logic, and icons.
- `pages/`: HTML templates for different app views (Dashboard, Chat, Profile, etc.).
- `data/`: Rasa NLU, stories, and rules for the AI model.
- `models/`: Trained Rasa models.
- `index.html`: Main entry point for the application.

## 🔧 Troubleshooting

- **Connection Refused (Port 5005)**: Ensure the Rasa Server (Terminal 2) is running.
- **Connection Refused (Port 8000)**: Ensure the Web Server (Terminal 1) is running.
- **TypeError: Failed to Fetch**: Make sure you included the `--cors "*"` flag when starting the Rasa server.
- **Command not found: rasa**: Ensure you have activated your virtual environment: `source .venv/bin/activate`.

---
*Built with ❤️ for SteadyPath Users.*
