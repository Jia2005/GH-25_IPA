import os
from werkzeug.utils import secure_filename
import shutil
from typing import List
from werkzeug.datastructures import FileStorage

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'txt', 'csv', 'xlsx', 'xls', 'xml', 'json'}

def create_temp_dir() -> str:
    temp_dir = os.path.join(UPLOAD_FOLDER, 'temp')
    os.makedirs(temp_dir, exist_ok=True)
    return temp_dir

def save_uploaded_files(files: List[FileStorage]) -> str:
    temp_dir = create_temp_dir()
    for file in files:
        if file.filename:
            filename = secure_filename(file.filename)
            file_path = os.path.join(temp_dir, filename)
            file.save(file_path)
    return temp_dir

def cleanup_temp_files(temp_dir: str):
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)