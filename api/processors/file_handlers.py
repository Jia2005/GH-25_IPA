from typing import Dict, Any, List
import pandas as pd
import pytesseract
from PIL import Image
import PyPDF2
import json
import xml.etree.ElementTree as ET
import os
import uuid
from werkzeug.utils import secure_filename
import tempfile

class FileHandler:
    @staticmethod
    def handle_excel(file_path: str) -> pd.DataFrame:
        return pd.read_excel(file_path)

    @staticmethod
    def handle_csv(file_path: str) -> pd.DataFrame:
        return pd.read_csv(file_path)

    @staticmethod
    def handle_image(file_path: str) -> pd.DataFrame:
        image = Image.open(file_path)
        text = pytesseract.image_to_string(image)
        rows = [row.split() for row in text.split('\n') if row.strip()]
        return pd.DataFrame(rows)

    @staticmethod
    def handle_pdf(file_path: str) -> pd.DataFrame:
        text_data = []
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text = page.extract_text()
                rows = [row.split() for row in text.split('\n') if row.strip()]
                text_data.extend(rows)
        return pd.DataFrame(text_data)
    
    @staticmethod
    def combine_excel_files(files, temp_folder, output_filename=None):
        if not output_filename:
            output_filename = f"combined_{uuid.uuid4().hex}.xlsx"
        
        if not output_filename.endswith('.xlsx'):
            output_filename += '.xlsx'
        
        output_path = os.path.join(temp_folder, secure_filename(output_filename))
        
        all_data = []
        
        for file_path in files:
            try:
                df = pd.read_excel(file_path)
                all_data.append(df)
            except Exception as e:
                print(f"Error processing file {file_path}: {str(e)}")
        
        if all_data:
            combined_df = pd.concat(all_data, ignore_index=True)
            combined_df.to_excel(output_path, sheet_name='Combined Data', index=False)
        
        return output_path