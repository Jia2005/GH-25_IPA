import pandas as pd
import json
import xml.etree.ElementTree as ET
import os
from typing import Dict, Any, List
import logging
import pytesseract
from PIL import Image
import cv2
import numpy as np
import tempfile
import io
import pdfplumber

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

pytesseract.pytesseract.tesseract_cmd = r'C:/Program Files/Tesseract-OCR/tesseract.exe'

class DataProcessor:
    def __init__(self):
        self.supported_formats = {
            '.xlsx': self.process_excel,
            '.xls': self.process_excel,
            '.csv': self.process_csv,
            '.txt': self.process_text,
            '.json': self.process_json,
            '.xml': self.process_xml,
            '.png': self.process_image,
            '.jpg': self.process_image,
            '.jpeg': self.process_image,
            '.pdf': self.process_pdf
        }
        logger.info("DataProcessor initialized with supported formats: %s", list(self.supported_formats.keys()))
    
    def process_image(self, file_path: str) -> pd.DataFrame:
        logger.info("Processing image file: %s", file_path)
        try:
            image = cv2.imread(file_path)
            if image is None:
                raise ValueError("Could not read image file")

            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            _, threshold = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            logger.debug("Extracting tabular data from image")
            df = pytesseract.image_to_data(threshold, output_type=pytesseract.Output.DATAFRAME)
            
            df = df[df['conf'] > 0]
            df = df[df['text'].notna()]
            df = df[df['text'].str.strip() != '']
            
            df = df.sort_values(by=['top', 'left']).reset_index(drop=True)
            
            row_threshold = df['height'].mean() * 0.5
            df['row_number'] = (df['top'].diff() > row_threshold).cumsum()
            
            table_data = []
            
            for row_num, row_group in df.groupby('row_number'):
                row_cells = row_group.sort_values('left')
                row_text = row_cells['text'].tolist()
                table_data.append(row_text)
                
            if not table_data:
                raise ValueError("No tabular data could be extracted from the image")
                
            max_cols = max(len(row) for row in table_data)
            padded_data = [row + [''] * (max_cols - len(row)) for row in table_data]
            
            if padded_data:
                headers = padded_data[0]
                if any(not str(h).replace('.', '').isdigit() for h in headers):
                    data = padded_data[1:]
                else:
                    headers = [f'Column_{i+1}' for i in range(max_cols)]
                    data = padded_data
                    
                result_df = pd.DataFrame(data, columns=headers)
                result_df = result_df.loc[:, result_df.notna().any()]
                result_df = result_df.loc[result_df.notna().any(axis=1)]
                result_df = result_df.reset_index(drop=True)
                
                if result_df.empty:
                    raise ValueError("No valid data found in processed table")
                    
                logger.info("Successfully extracted tabular data from image")
                return result_df
            else:
                raise ValueError("No data rows were extracted from the image")

        except Exception as e:
            logger.error("Error processing image file: %s", str(e))
            raise ValueError(f"Could not process image file: {str(e)}")

    def process_pdf(self, file_path: str) -> pd.DataFrame:
        logger.info("Processing PDF file: %s", file_path)
        try:
            all_tables = []
            
            with pdfplumber.open(file_path) as pdf:
                logger.debug("PDF opened successfully, processing %d pages", len(pdf.pages))
                
                for page_num, page in enumerate(pdf.pages, 1):
                    logger.debug("Processing page %d", page_num)
                    tables = page.extract_tables()
                    
                    if tables:
                        for table_num, table in enumerate(tables, 1):
                            logger.debug("Processing table %d on page %d", table_num, page_num)
                            cleaned_table = []
                            for row in table:
                                cleaned_row = [str(cell).strip() if cell is not None else '' for cell in row]
                                cleaned_table.append(cleaned_row)
                            
                            if cleaned_table:
                                headers = cleaned_table[0]
                                data = cleaned_table[1:]
                                
                                if any(header.strip() for header in headers):
                                    df = pd.DataFrame(data, columns=headers)
                                else:
                                    default_headers = [f'Column_{i+1}' for i in range(len(cleaned_table[0]))]
                                    df = pd.DataFrame(cleaned_table, columns=default_headers)
                                
                                df = df.replace('', pd.NA)
                                df = df.dropna(how='all')
                                df = df.dropna(how='all', axis=1)
                                
                                if not df.empty:
                                    all_tables.append(df)
                    
                    if not tables:
                        logger.debug("No tables found on page %d, attempting to parse text", page_num)
                        text = page.extract_text()
                        if text:
                            text_io = io.StringIO(text)
                            for delimiter in [',', '\t', '|', ';']:
                                text_io.seek(0)
                                try:
                                    df = pd.read_csv(text_io, sep=delimiter)
                                    if not df.empty:
                                        all_tables.append(df)
                                        break
                                except:
                                    continue
            
            if all_tables:
                logger.info("Successfully extracted %d tables from PDF", len(all_tables))
                result_df = pd.concat(all_tables, ignore_index=True)
                return result_df
            else:
                raise ValueError("No tabular data could be extracted from the PDF")
                
        except Exception as e:
            logger.error("Error processing PDF file: %s", str(e))
            raise ValueError(f"Could not process PDF file: {str(e)}")

    def process_excel(self, file_path: str) -> pd.DataFrame:
        logger.info("Processing Excel file: %s", file_path)
        try:
            engines = ['openpyxl', 'xlrd']
            for engine in engines:
                try:
                    logger.debug("Trying Excel engine: %s", engine)
                    df = pd.read_excel(file_path, engine=engine)
                    if not df.empty:
                        return df
                except Exception as e:
                    logger.debug("Engine %s failed: %s", engine, str(e))
                    continue
            raise ValueError("Could not process Excel file with any available engine")
        except Exception as e:
            logger.error("Error processing Excel file: %s", str(e))
            raise

    def process_csv(self, file_path: str) -> pd.DataFrame:
        logger.info("Processing CSV file: %s", file_path)
        try:
            encodings = ['utf-8', 'latin1', 'iso-8859-1']
            for encoding in encodings:
                try:
                    logger.debug("Trying encoding: %s", encoding)
                    df = pd.read_csv(file_path, encoding=encoding)
                    if not df.empty:
                        return df
                except UnicodeDecodeError:
                    continue
                except Exception as e:
                    logger.error("Error with encoding %s: %s", encoding, str(e))
                    raise
            raise ValueError("Could not process CSV file with any available encoding")
        except Exception as e:
            logger.error("Error processing CSV file: %s", str(e))
            raise

    def process_text(self, file_path: str) -> pd.DataFrame:
        logger.info("Processing text file: %s", file_path)
        try:
            delimiters = [',', '\t', '|', ';']
            for delimiter in delimiters:
                try:
                    logger.debug("Trying delimiter: %s", delimiter)
                    df = pd.read_csv(file_path, sep=delimiter)
                    if not df.empty:
                        return df
                except Exception as e:
                    logger.debug("Delimiter %s failed: %s", delimiter, str(e))
                    continue
                    
            logger.debug("Trying fixed-width format")
            df = pd.read_fwf(file_path)
            if not df.empty:
                return df
                
            raise ValueError("Could not process text file with any available format")
        except Exception as e:
            logger.error("Error processing text file: %s", str(e))
            raise

    def process_json(self, file_path: str) -> pd.DataFrame:
        logger.info("Processing JSON file: %s", file_path)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            if isinstance(data, list):
                df = pd.DataFrame(data)
            elif isinstance(data, dict):
                if any(isinstance(v, (dict, list)) for v in data.values()):
                    df = pd.DataFrame.from_dict(data, orient='index')
                else:
                    df = pd.DataFrame([data])
            else:
                raise ValueError("Unsupported JSON structure")
                
            return df
        except Exception as e:
            logger.error("Error processing JSON file: %s", str(e))
            raise

    def process_xml(self, file_path: str) -> pd.DataFrame:
        logger.info("Processing XML file: %s", file_path)
        try:
            tree = ET.parse(file_path)
            root = tree.getroot()
            
            data = []
            for child in root:
                record = {}
                for subchild in child:
                    record[subchild.tag] = subchild.text
                data.append(record)
                
            if not data:
                data = [{child.tag: child.text} for child in root]
                
            df = pd.DataFrame(data)
            if df.empty:
                raise ValueError("No data found in XML file")
                
            return df
        except Exception as e:
            logger.error("Error processing XML file: %s", str(e))
            raise

    def process_file(self, file_path: str) -> pd.DataFrame:
        logger.info("Processing file: %s", file_path)
        _, ext = os.path.splitext(file_path)
        ext = ext.lower()
        
        if not os.path.exists(file_path):
            logger.error("File does not exist: %s", file_path)
            raise FileNotFoundError(f"File not found: {file_path}")

        processor = self.supported_formats.get(ext)
        if processor:
            try:
                logger.debug("Using processor for extension: %s", ext)
                return processor(file_path)
            except Exception as e:
                logger.error("Error in processor for %s: %s", ext, str(e))
                raise
        
        logger.error("Unsupported format: %s", ext)
        raise ValueError(f"Unsupported file format: {ext}")

    def process_as_excel(self, file_path: str) -> pd.DataFrame:
        logger.info("Attempting to process as Excel: %s", file_path)
        try:
            engines = ['openpyxl', 'xlrd']
            for engine in engines:
                try:
                    logger.debug("Trying Excel engine: %s", engine)
                    df = pd.read_excel(file_path, engine=engine)
                    if not df.empty:
                        return df
                except Exception as e:
                    logger.debug("Engine %s failed: %s", engine, str(e))
                    continue
            
            logger.debug("Trying CSV fallback")
            return pd.read_csv(file_path)
        except Exception as e:
            logger.error("All processing attempts failed: %s", str(e))
            raise ValueError(f"Could not process file as tabular data: {str(e)}")

    def process_directory(self, input_dir: str, output_file: str) -> Dict[str, Any]:
        logger.info("Processing directory: %s", input_dir)
        logger.info("Output file: %s", output_file)
        
        all_data = []
        errors = []
        processed_files = []

        if not os.path.exists(input_dir):
            logger.error("Input directory does not exist: %s", input_dir)
            return {
                "success": False,
                "message": f"Input directory not found: {input_dir}",
                "processed_files": [],
                "errors": ["Directory not found"]
            }

        files = [f for f in os.listdir(input_dir) if f != 'processed_output.xlsx']
        logger.info("Found files to process: %s", files)

        for filename in files:
            file_path = os.path.join(input_dir, filename)
            logger.info("Processing file: %s", file_path)
            
            try:
                df = self.process_file(file_path)
                if not df.empty:
                    logger.info("Successfully processed file: %s", filename)
                    all_data.append(df)
                    processed_files.append(filename)
                else:
                    logger.warning("No data found in file: %s", filename)
                    errors.append(f"No data found in {filename}")
            except Exception as e:
                logger.error("Error processing file %s: %s", filename, str(e))
                errors.append(f"Error processing {filename}: {str(e)}")

        result = {
            "success": False,
            "message": "",
            "processed_files": processed_files,
            "errors": errors
        }

        if all_data:
            try:
                logger.info("Combining processed data")
                final_df = pd.concat(all_data, ignore_index=True)
                
                output_dir = os.path.dirname(output_file)
                os.makedirs(output_dir, exist_ok=True)
                
                logger.info("Saving to Excel: %s", output_file)
                final_df.to_excel(output_file, index=False)
                
                result["success"] = True
                result["message"] = "Data processed successfully"
            except Exception as e:
                logger.error("Error saving output file: %s", str(e))
                result["errors"].append(f"Error saving output file: {str(e)}")
        else:
            logger.warning("No data was processed")
            result["message"] = "No data was processed"

        logger.info("Processing result: %s", result)
        return result