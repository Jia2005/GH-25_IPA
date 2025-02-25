from flask import Flask, request, jsonify, send_file, after_this_request
from flask_cors import CORS
import os
import uuid
import logging
from werkzeug.utils import secure_filename
from processors.data_processor import DataProcessor
from processors.file_handlers import FileHandler

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    return response

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'processors', 'uploads')
TEMP_FOLDER = os.path.join(UPLOAD_FOLDER, 'temp')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TEMP_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

@app.route('/dataentry')
def data_entry():
    return jsonify({
        "status": "success",
        "message": "Data entry endpoint is working"
    })

@app.route('/api/process-documents', methods=['POST'])
def process_documents():
    logger.info("Received document processing request")
    
    if 'files' not in request.files:
        logger.error("No files in request")
        return jsonify({
            "error": "No files provided",
            "debug": {
                "request_files": list(request.files.keys()),
                "request_form": list(request.form.keys())
            }
        }), 400

    files = request.files.getlist('files')
    if not files:
        logger.error("Empty files list")
        return jsonify({"error": "No files selected"}), 400

    logger.info("Number of files received: %d", len(files))

    for existing_file in os.listdir(TEMP_FOLDER):
        file_path = os.path.join(TEMP_FOLDER, existing_file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception as e:
            logger.error("Error deleting file %s: %s", file_path, str(e))

    saved_files = []
    for file in files:
        if file.filename:
            filename = secure_filename(file.filename)
            file_path = os.path.join(TEMP_FOLDER, filename)
            file.save(file_path)
            saved_files.append(filename)

    if not saved_files:
        logger.error("No valid files were saved")
        return jsonify({"error": "No valid files were uploaded"}), 400

    try:
        processor = DataProcessor()
        output_file = os.path.join(TEMP_FOLDER, 'processed_output.xlsx')
        
        result = processor.process_directory(TEMP_FOLDER, output_file)

        if result["success"] and os.path.exists(output_file):
            return send_file(
                output_file,
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                as_attachment=True,
                download_name='processed_documents.xlsx'
            )
        else:
            return jsonify({
                "error": "Processing failed",
                "details": result
            }), 400
    except Exception as e:
        return jsonify({
            "error": str(e),
            "details": {
                "saved_files": saved_files,
                "temp_folder": TEMP_FOLDER
            }
        }), 500

@app.route('/api/combine-documents', methods=['POST'])
def combine_documents():
    if 'files' not in request.files:
        return jsonify({"error": "No files part in the request"}), 400
    
    files = request.files.getlist('files')
    if not files or files[0].filename == '':
        return jsonify({"error": "No files selected"}), 400
    
    output_filename = request.form.get('outputFilename', f"combined_{uuid.uuid4().hex}.xlsx")
    
    saved_files = []
    
    for existing_file in os.listdir(TEMP_FOLDER):
        file_path = os.path.join(TEMP_FOLDER, existing_file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception as e:
            logger.error("Error deleting file %s: %s", file_path, str(e))
    
    for file in files:
        if file.filename:
            filename = secure_filename(file.filename)
            file_path = os.path.join(TEMP_FOLDER, filename)
            file.save(file_path)
            saved_files.append(file_path)
    
    try:
        output_path = FileHandler.combine_excel_files(saved_files, TEMP_FOLDER, output_filename)
        
        @after_this_request
        def cleanup(response):
            for file_path in saved_files:
                try:
                    if os.path.exists(file_path):
                        os.unlink(file_path)
                except Exception as e:
                    logger.error(f"Error removing file {file_path}: {str(e)}")
            return response
        
        return send_file(
            output_path,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=os.path.basename(output_path)
        )
    
    except Exception as e:
        logger.error(f"Error combining documents: {str(e)}")
        return jsonify({"error": f"Failed to combine documents: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)