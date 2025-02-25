# Intelligent Process Automation

The following is the structure of code made for this project.

## File Structure

```
GH-25_IPA/
├── api/                      # Backend Python API
│   ├── api/                  # API endpoint definitions
│   ├── processors/           # Document processing modules
│   │   ├── _pycache_/        # Python bytecode cache
│   │   ├── uploads/          # Upload directory for documents
│   │   ├── data_processor.py # Core data extraction logic
│   │   └── file_handlers.py  # Handles different file types
│   ├── utils/                # Utility functions
│   │   ├── file_utils.py     # File operation utilities
│   │   └── validation.py     # Data validation functions
│   ├── venv/                 # Python virtual environment
│   ├── api.py                # Main API application entry point
│   ├── pyenv.cfg             # Python environment configuration
│   ├── .flaskenv             # Flask environment variables
│   ├── =2.0.1                # Version specifier file
│   └── requirements.txt      # Python dependencies
├── node_modules/             # Node.js dependencies
├── public/                   # Static public assets
└── src/
    ├── Functionalities/      # Core business logic components
    │   ├── ChatBot_Data_Entry.js   # Handles chatbot interactions for data entry operations
    │   ├── Chatbot_Invoice.js      # Manages chatbot functionality for invoice processing
    │   ├── Data_Entry.js           # Core component for automated data extraction and entry
    │   └── Document_Automation.js       # Handles document automation workflows and processing
    ├── Images/               # Image assets
    ├── Pages/                # React page components
    │   ├── Document.js       # UI for document upload, processing and verification
    │   ├── LandingPage.js    # Homepage with feature overview and navigation
    │   ├── Login.js          # Authentication page with Google OAuth
    │   └── NotFound.js       # 404 error page
    ├── App.css               # Main application styles
    ├── App.js                # Main application component and routing
    ├── App.test.js           # Tests for App component
    ├── index.css             # Global styles
    ├── index.js              # Application entry point
    ├── logo.svg              # Application logo
    ├── reportWebVitals.js    # Performance measurement
    └── setupTests.js         # Test configuration
├── .env                      # Environment variables
├── .gitignore                # Git ignore file
├── package-lock.json         # Dependency lock file
├── package.json              # Project dependencies and scripts
├── postcss.config.js         # PostCSS configuration
├── README.md                 # Project documentation
└── tailwind.config.js        # Tailwind CSS configuration
```

## Key Files Explained

### API Components

- **api.py**: Main entry point for the Flask backend API that handles requests from the frontend.

- **data_processor.py**: Implements the core logic for extracting and processing data from various document types.

- **file_handlers.py**: Contains specialized handlers for different file formats (PDF, Excel, images, etc.).

- **file_utils.py**: Provides utility functions for file operations such as reading, writing, and format conversion.

- **validation.py**: Implements data validation rules to ensure extracted information is accurate and complete.

### Functionality Components

- **ChatBot_Data_Entry.js**: Implements the conversational interface for data entry operations, guiding users through the process of uploading and extracting data from documents.

- **Chatbot_Invoice.js**: Manages the chatbot experience specifically for invoice processing, helping users extract and validate invoice information through conversation.

- **Data_Entry.js**: Core component that handles the extraction of data from various file formats (JPG, PNG, JPEG, PDF, XLSX, CSV) and converts it into structured formats.

- **Document_Automation.js**: Orchestrates the document automation workflow, managing the processing pipeline from document upload to information extraction and verification.

### Page Components

- **Document.js**: Provides the user interface for document processing, including upload controls, processing status, and the human-in-the-loop verification system.

- **LandingPage.js**: The main entry point for users, showcasing features, benefits, and providing navigation to different system capabilities.

- **Login.js**: Handles user authentication with secure login/signup functionality and Google OAuth integration.

- **NotFound.js**: Custom 404 error page for handling navigation to undefined routes.
