# Technologies Used

### Backend

#### Core Technologies
- **Python**: Powers the backend logic, providing robust data processing, analysis, and automation capabilities.
- **Flask**: Lightweight web framework used for API development and server-side logic, facilitating communication between frontend and backend services.
- **Flask-CORS**: Handles Cross-Origin Resource Sharing, enabling secure frontend-backend communication.

#### Data Processing Libraries
- **Pandas**: Essential for data manipulation and analysis, handling tabular data from various sources.
- **PyTesseract**: OCR (Optical Character Recognition) tool for extracting text from images, crucial for processing image-based invoices and documents.
- **Pillow (PIL)**: Python Imaging Library used for opening, manipulating, and saving image files.
- **OpenCV (cv2)**: Computer vision library that enhances image processing capabilities, particularly for pre-processing images before OCR.
- **pdfplumber**: Advanced PDF data extraction tool that identifies and extracts tabular data from PDF documents.
- **PyPDF2**: Handles PDF file reading and text extraction, complementing pdfplumber for comprehensive PDF processing.
- **openpyxl/xlrd**: Excel file processing libraries that enable reading and writing Excel files.
- **ElementTree (xml.etree)**: XML parsing library for handling XML structured data.

#### Utility Libraries
- **logging**: Provides comprehensive logging capabilities for debugging and monitoring.
- **typing**: Enhances code readability and maintainability through type annotations.
- **uuid**: Generates unique identifiers for files and processing sessions.
- **tempfile**: Manages temporary file operations during processing workflows.
- **Werkzeug**: Utility library for file handling and security functions, particularly for secure filename handling.

### Frontend

#### Core Technologies
- **React.js**: JavaScript library for building the user interface, enabling responsive and interactive components.
- **Tailwind CSS**: Utility-first CSS framework for creating responsive and customizable designs without leaving HTML.

#### Document Processing Libraries
- **Tesseract.js**: Client-side OCR capability for processing images directly in the browser.
- **PDF.js**: Client-side PDF rendering and text extraction library.

## Key Features

### API Endpoints
- `/api/process-documents`: Processes multiple documents and returns a combined Excel file
- `/api/combine-documents`: Specifically designed for combining multiple Excel files
- `/dataentry`: Status check endpoint

### Error Handling
- Comprehensive logging throughout the application
- Graceful error handling with informative error messages
- Automatic cleanup of temporary files

## Why These Technologies?

### Backend Choices
- **Flask** was chosen for its lightweight nature and flexibility, making it ideal for API development without unnecessary overhead.
- **Pandas** provides unmatched data manipulation capabilities, essential for handling diverse tabular data formats.
- **Python** ecosystem offers rich libraries for document processing, making it the perfect choice for the application's core functionality.
- **PyTesseract & OpenCV** combination delivers powerful OCR capabilities for extracting data from images.
- **pdfplumber & PyPDF2** provide complementary approaches to extracting data from PDFs, ensuring robust performance across different PDF structures.

### Frontend Choices
- **React.js** enables building a responsive and interactive UI with component reusability.
- **Tailwind CSS** facilitates rapid UI development with responsive design out of the box.
- **Tesseract.js & PDF.js** add client-side processing capabilities, reducing server load for certain operations.
