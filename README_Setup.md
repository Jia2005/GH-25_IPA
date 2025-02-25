# Steps to Clone and View the Project

## 🔧 Installation and Setup
### Prerequisites
• Node.js (v14+)

• Python (v3.8+) with pip

• MongoDB
### Quick Start
1. Clone the repo and install dependencies
   ```bash
   git clone https://github.com/Jia2005/GH-25_IPA.git
   cd GH-25_IPA
   npm install
   ```

2. Set up Python environment
   ```bash
   cd api
   pip install -r requirements.txt
   cd ..
   ```

3. Create .env file with:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   REACT_APP_API_URL=http://localhost:3000
   ```
   **Note**: The .env file isn't included in this repo. You'll need to create your own and get a Google Client ID.

4. Start the servers
   ```bash
   npm start
   
   # In another terminal
   cd api
   . venv/Scripts/activate
   flask run
   ```
