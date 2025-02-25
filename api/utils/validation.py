from typing import List, Optional
from werkzeug.datastructures import FileStorage
import os

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'txt', 'csv', 'xlsx', 'xls', 'xml', 'json'}

def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_files(files: List[FileStorage]) -> Optional[str]:
    if not files:
        return "No files uploaded"
    
    for file in files:
        if not file.filename:
            return "Invalid file name"
        if not allowed_file(file.filename):
            return f"Unsupported file type: {file.filename}"
    
    return None