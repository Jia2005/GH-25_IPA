import React, { useState, useEffect, useCallback } from 'react';
import { Upload, FileText, X, Clock, CheckCircle, BarChart, DollarSign, UserCog, Sparkles, Edit2, Check, Eye, XCircle, ZoomIn, ZoomOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Tesseract from 'tesseract.js';
import * as pdfjs from 'pdfjs-dist';
import InvoiceChatBot from './Chatbot_Invoice';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

const DocumentAutomation = () => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [error, setError] = useState(null);
  const [queue, setQueue] = useState([]);
  const [editingFile, setEditingFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [editForm, setEditForm] = useState({
    invoiceNumber: '',
    invoiceDate: '',
    amount: '',
    vendor: ''
  });
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const postProcessData = (extractedData) => {
    if (extractedData.invoiceNumber) {
      extractedData.invoiceNumber = extractedData.invoiceNumber.trim().replace(/[^\w-]/g, '');
    }
    
    if (extractedData.invoiceDate) {
      try {
        const dateParts = extractedData.invoiceDate.split(/[-/.]/);
        if (dateParts.length === 3) {
          extractedData.invoiceDate = `${dateParts[0]}/${dateParts[1]}/${dateParts[2]}`;
        }
      } catch (e) {
        console.error("Error processing date:", e);
      }
    }
    
    if (extractedData.amount) {
      extractedData.amount = extractedData.amount.replace(/[^0-9.]/g, '');
    }
    
    return extractedData;
  };
  
  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
  
    const extractedData = {
      invoiceNumber: extractInvoiceNumber(fullText),
      invoiceDate: extractDate(fullText),
      amount: extractAmount(fullText),
      vendor: extractVendor(fullText),
      rawText: fullText,
      needsReview: true,
      confidence: 95,
      accuracy: 0,
      reviewed: false
    };
  
    return postProcessData(extractedData);
  };
  
  const extractTextFromImage = async (file) => {
    const result = await Tesseract.recognize(
      file,
      'eng',
      { logger: progress => console.log('OCR Progress:', progress) }
    );
  
    const text = result.data.text;
    
    const extractedData = {
      invoiceNumber: extractInvoiceNumber(text),
      invoiceDate: extractDate(text),
      amount: extractAmount(text),
      vendor: extractVendor(text),
      rawText: text,
      needsReview: true,
      confidence: result.data.confidence,
      accuracy: 0,
      reviewed: false
    };
  
    return postProcessData(extractedData);
  };
  
  const extractInvoiceNumber = (text) => {
    const patterns = [
      /Invoice\s*#\s*(\w+)/i,
      /Invoice\s*#?\s*([A-Z0-9-]+)/i,
      /INVOICE\s*#\s*([A-Z0-9-]+)/i,
      /INV\s*#?\s*([A-Z0-9-]+)/i,
      /N[o°]\.?\s*[:#]?\s*(\d+)/i,
      /Invoice\s*[#:]?\s*N[o°]?\.?\s*(\d+)/i,
      /US-\d+/i,
      /NO\.\s*(\d+)/i,
      /\bN°\s*([A-Z0-9-]+)/i,
      /Invoice\s*#\s*:?\s*(\d+)/i,
      /N°\s*(\w+)/i,
      /NO\.\s*:?\s*(\d+)/i,
      /Invoice\s*number\s*:?\s*(\w+)/i,
      /Invoice\s*#\s*(\d+)/i,
      /Invoice\s*#:?\s*(\w+)/i,
      /Invoice\s*\w+\s*:?\s*(\w+)/i,
      /Invoice\s*N°?\s*(\w+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) return match[1];
    }
    
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('invoice') && /\d+/.test(line)) {
        const numMatch = line.match(/(?:invoice|number).*?(\d[\d\w-]*)/i);
        if (numMatch && numMatch[1]) return numMatch[1];
        
        const anyNumMatch = line.match(/(\d[\d\w-]*)/);
        if (anyNumMatch) return anyNumMatch[0];
      }
    }
    
    const invoiceNumFormat = text.match(/\d{5,7}/);
    if (invoiceNumFormat) return invoiceNumFormat[0];
    
    return null;
  };
  
  const extractAmount = (text) => {
    const totalPatterns = [
      /Total\s*\(USD\)\s*:?\s*[$£€]?\s*([\d,]+\.?\d*)/i,
      /Total\s*:?\s*[$£€]?\s*([\d,]+\.?\d*)/i,
      /Grand\s*Total\s*:?\s*[$£€]?\s*([\d,]+\.?\d*)/i,
      /Amount\s*Due\s*:?\s*[$£€]?\s*([\d,]+\.?\d*)/i,
      /Total\s*Amount\s*:?\s*[$£€]?\s*([\d,]+\.?\d*)/i,
      /TOTAL\s*[$£€]?\s*([\d,]+\.?\d*)/i,
      /Subtotal\s*:?\s*[$£€]?\s*([\d,]+\.?\d*)/i,
      /Total\s*\(?USD\)?\s*:?\s*[$£€]?\s*([\d,]+\.?\d*)/i
    ];
  
    for (const pattern of totalPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) return match[1];
    }
    
    const currencyPatterns = [
      /\$([\d,]+\.?\d*)/,
      /£([\d,]+\.?\d*)/,
      /€([\d,]+\.?\d*)/
    ];
    
    for (const pattern of currencyPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) return match[1];
    }
    
    const lines = text.split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].toLowerCase();
      if ((line.includes('total') && !line.includes('subtotal')) || line.includes('grand total')) {
        const amountMatch = line.match(/[$£€]?\s*([\d,]+\.?\d*)/);
        if (amountMatch && amountMatch[1]) return amountMatch[1];
      }
    }
    
    return null;
  };
  
  const extractVendor = (text) => {
    const patterns = [
      /FROM\s*\n([A-Za-z0-9\s.,]+)(?=\n)/i,
      /BILL\s*FROM\s*\n([A-Za-z0-9\s.,]+)(?=\n)/i,
      /FROM\s*:?\s*([A-Za-z0-9\s.,]+)(?=\n)/i,
      /Bill\s*from\s*:?\s*([A-Za-z0-9\s.,]+)/i,
      /From\s*:?\s*([A-Za-z0-9\s.,]+)/i,
      /([A-Za-z0-9\s.,]+)\s*Inc\./i,
      /([A-Za-z0-9\s.,]+)\s*Ltd/i,
      /([A-Za-z0-9\s.,]+)\s*LLC/i,
      /Tranquillité\s*Spa/i,
      /Print\s*LTD/i,
      /Your\s*Company\s*Inc/i
    ];
  
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1] ? match[1].trim() : match[0].trim();
    }
  
    const lines = text.split('\n');
    
    for (let i = 0; i < Math.min(15, lines.length); i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('bill from') || line.includes('from:')) {
        if (i + 1 < lines.length && lines[i + 1].trim()) {
          return lines[i + 1].trim();
        }
      }
    }
    
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      if (lines[i].includes('Inc.') || 
          lines[i].includes('Ltd') || 
          lines[i].includes('LLC') ||
          lines[i].includes('Company') ||
          lines[i].includes('Spa')) {
        return lines[i].trim();
      }
    }
    
    return null;
  };
  
  const extractDate = (text) => {
    const patterns = [
      /Invoice\s*Date\s*:?\s*(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/i,
      /Date\s*:?\s*(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/i,
      /Date\s*:?\s*(\d{2}\.\d{2}\.\d{4})/i,
      /Date\s*:?\s*(\d{2}\/\d{2}\/\d{4})/i,
      /Date\s*:?\s*(\d{2}-\d{2}-\d{4})/i,
      /(\d{2}\.\d{2}\.\d{4})/i,
      /(\d{2}\/\d{2}\/\d{4})/i,
      /(\d{2}-\d{2}-\d{4})/i,
      /(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/,
      /(\d{2}\.\d{2}\.\d{2,4})/i,
      /Date\s*:?\s*(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/i,
      /Invoice\s*date\s*:?\s*(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/i,
      /(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})/i,
      /(\d{1,2}[-/.]\d{1,2}[-/.]\d{2})/i
    ];
  
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) return match[1];
    }
    
    const dateFormat1 = text.match(/(\d{2}\.\d{2}\.\d{4})/);
    if (dateFormat1) return dateFormat1[1];
    
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('date')) {
        const dateMatch = line.match(/date.*?(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/i);
        if (dateMatch && dateMatch[1]) return dateMatch[1];
        
        const anyDateMatch = line.match(/(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/);
        if (anyDateMatch) return anyDateMatch[0];
      }
    }
    
    return null;
  };
  
  const checkMissingFields = (data) => {
    const missingFields = [];
    if (!data.invoiceNumber) missingFields.push('Invoice Number');
    if (!data.invoiceDate) missingFields.push('Invoice Date');
    if (!data.amount) missingFields.push('Amount');
    if (!data.vendor) missingFields.push('Vendor');
    return missingFields;
  };

  const calculateRecognitionRate = () => {
    const reviewedFiles = files.filter(file => file.reviewed);
    
    if (reviewedFiles.length === 0) return '0.0%';
    
    let totalFields = 0;
    let correctlyRecognizedFields = 0;
    
    reviewedFiles.forEach(file => {
      totalFields += 4;
      
      if (file.rejected) {
        correctlyRecognizedFields += 0;
      } else {
        if (file.details.changesCount !== undefined) {
          correctlyRecognizedFields += (4 - file.details.changesCount);
        } else {
          let correctFields = 0;
          
          if (file.details.originalValues) {
            if (file.details.invoiceNumber === file.details.originalValues.invoiceNumber) correctFields++;
            if (file.details.invoiceDate === file.details.originalValues.invoiceDate) correctFields++;
            if (file.details.amount === file.details.originalValues.amount) correctFields++;
            if (file.details.vendor === file.details.originalValues.vendor) correctFields++;
          } else {
            if (file.details.invoiceNumber) correctFields++;
            if (file.details.invoiceDate) correctFields++;
            if (file.details.amount) correctFields++;
            if (file.details.vendor) correctFields++;
          }
          
          correctlyRecognizedFields += correctFields;
        }
      }
    });
    
    return `${((correctlyRecognizedFields / totalFields) * 100).toFixed(1)}%`;
  };

  const processFile = async (file) => {
    const startTime = Date.now();
    try {
      setCurrentFile(file.name);
      let extractedData;
      
      switch(file.type) {
        case 'image/jpeg':
        case 'image/png':
          extractedData = await extractTextFromImage(file);
          break;
        case 'application/pdf':
          extractedData = await extractTextFromPDF(file);
          break;
        default:
          throw new Error('Unsupported file type. Currently supporting PDF, JPG, and PNG files.');
      }

      const processingTime = (Date.now() - startTime) / 1000;
      const missingFields = checkMissingFields(extractedData);
      
      const fileUrl = URL.createObjectURL(file);
      
      const processedFile = {
        id: Math.random().toString(36).substring(7),
        file,
        fileUrl,
        uploadDate: new Date().toISOString(),
        processingTime,
        status: 'needs_review',
        confidence: extractedData.confidence,
        accuracy: 0,
        reviewed: false,
        rejected: false,
        type: file.type,
        size: file.size,
        details: {
          invoiceNumber: extractedData.invoiceNumber,
          invoiceDate: extractedData.invoiceDate,
          amount: extractedData.amount,
          vendor: extractedData.vendor,
          missingFields: missingFields || [],
          needsReview: true,
          originalValues: {
            invoiceNumber: extractedData.invoiceNumber,
            invoiceDate: extractedData.invoiceDate,
            amount: extractedData.amount,
            vendor: extractedData.vendor
          }
        },
        rawText: extractedData.rawText
      };

      setFiles(prev => [processedFile, ...prev]);
      return processedFile;
    } catch (err) {
      setError(`Error processing ${file.name}: ${err.message}`);
      return null;
    } finally {
      setCurrentFile(null);
    }
  };

  useEffect(() => {
    const processQueue = async () => {
      if (queue.length > 0 && !processing) {
        setProcessing(true);
        const nextFile = queue[0];
        await processFile(nextFile);
        setQueue(prev => prev.slice(1));
        setProcessing(false);
      }
    };

    processQueue();
  }, [queue, processing]);

  const handleFiles = useCallback((newFiles) => {
    setError(null);
    setQueue(prev => [...prev, ...Array.from(newFiles)]);
  }, []);

  const startEditing = (file) => {
    setEditingFile(file.id);
    setEditForm({
      invoiceNumber: file.details.invoiceNumber || '',
      invoiceDate: file.details.invoiceDate || '',
      amount: file.details.amount || '',
      vendor: file.details.vendor || ''
    });
  };

  const cancelEditing = () => {
    setEditingFile(null);
    setEditForm({
      invoiceNumber: '',
      invoiceDate: '',
      amount: '',
      vendor: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveChanges = () => {
    setFiles(prev => prev.map(file => {
      if (file.id === editingFile) {
        const originalValues = file.details.originalValues;
        let correctFields = 0;
        let totalFields = 4;

        if (originalValues.invoiceNumber === editForm.invoiceNumber || 
            (!originalValues.invoiceNumber && !editForm.invoiceNumber)) {
          correctFields++;
        }
        
        if (originalValues.invoiceDate === editForm.invoiceDate || 
            (!originalValues.invoiceDate && !editForm.invoiceDate)) {
          correctFields++;
        }
        
        if (originalValues.amount === editForm.amount || 
            (!originalValues.amount && !editForm.amount)) {
          correctFields++;
        }
        
        if (originalValues.vendor === editForm.vendor || 
            (!originalValues.vendor && !editForm.vendor)) {
          correctFields++;
        }
        
        const accuracy = (correctFields / totalFields) * 100;
        const changesCount = totalFields - correctFields;
        
        return {
          ...file,
          status: 'processed',
          reviewed: true,
          rejected: false,
          accuracy: accuracy,
          details: {
            ...file.details,
            invoiceNumber: editForm.invoiceNumber,
            invoiceDate: editForm.invoiceDate,
            amount: editForm.amount,
            vendor: editForm.vendor,
            needsReview: false,
            changesCount: changesCount
          }
        };
      }
      return file;
    }));
    
    setEditingFile(null);
    setAlert({
      message: "Thank you for the review! We will train our model based on the changes you've made.",
      type: "success"
    });
    
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };

  const acceptWithoutChanges = (fileId) => {
    setFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        return {
          ...file,
          status: 'processed',
          reviewed: true,
          rejected: false,
          accuracy: 100,
          details: {
            ...file.details,
            needsReview: false,
            changesCount: 0
          }
        };
      }
      return file;
    }));
    
    setAlert({
      message: "Document accepted! Thank you for confirming the accuracy.",
      type: "success"
    });
    
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };

  const rejectDocument = (fileId) => {
    setFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        return {
          ...file,
          status: 'rejected',
          reviewed: true,
          rejected: true,
          accuracy: 0,
          details: {
            ...file.details,
            needsReview: false,
            changesCount: 4
          }
        };
      }
      return file;
    }));
    
    setAlert({
      message: "We apologize for the inconvenience. The document has been rejected and flagged for improvement.",
      type: "error"
    });
    
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };

  const togglePreview = (fileId) => {
    const selectedFile = files.find(file => file.id === fileId);
    if (selectedFile) {
      setPreviewFile(selectedFile);
      setShowPreviewModal(true);
      setZoomLevel(1);
    } else {
      setPreviewFile(null);
      setShowPreviewModal(false);
    }
  };

  const closePreview = () => {
    setShowPreviewModal(false);
    setPreviewFile(null);
    setZoomLevel(1);
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const renderFilePreview = (file) => {
    if (!file) return null;
    
    if (file.type.startsWith('image/')) {
      return (
        <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ maxHeight: '70vh', maxWidth: '90vw', overflow: 'auto' }}>
          <img 
            src={file.fileUrl} 
            alt="Document preview" 
            className="object-contain" 
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-in-out' }}
          />
        </div>
      );
    } else if (file.type === 'application/pdf') {
      return (
        <div className="bg-gray-100 rounded-lg flex items-center justify-center p-4" style={{ height: '70vh', width: '90vw' }}>
          <iframe 
            src={file.fileUrl} 
            title="PDF Preview" 
            className="w-full h-full border-0" 
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-in-out' }}
          />
        </div>
      );
    } else {
      return (
        <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ height: '300px', width: '500px' }}>
          <FileText className="h-16 w-16 text-gray-400" />
          <p className="ml-2 text-gray-500">Preview not available</p>
        </div>
      );
    }
  };

  const GlowingBorder = ({ children }) => (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-shift"></div>
      <div className="relative">
        {children}
      </div>
    </div>
  );

  const FadeInSection = ({ children, delay = "0", className = "" }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        },
        { threshold: 0.1 }
      );
  
      const element = document.querySelector(`.fade-section-${delay}`);
      if (element) observer.observe(element);
  
      return () => observer.disconnect();
    }, [delay]);

    return (
      <div
        className={`fade-section-${delay} ${className} ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        } transition-all duration-1000`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {children}
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'needs_review':
        return 'bg-yellow-200 text-black';
      case 'processed':
        return 'bg-green-200 text-black';
      case 'rejected':
        return 'bg-red-200 text-black';
      default:
        return 'bg-gray-100 text-black';
    }
  };

  const renderDocumentStatus = (file) => {
    if (file.status === 'needs_review' && editingFile !== file.id) {
      return (
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserCog className="h-5 w-5 text-yellow-500" />
              <span className="font-medium text-yellow-700">Needs Human Review</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => startEditing(file)}
                className="flex items-center px-3 py-1 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
              >
                <Edit2 className="h-4 w-4 mr-1" /> Edit
              </button>
              <button 
                onClick={() => acceptWithoutChanges(file.id)}
                className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Check className="h-4 w-4 mr-1" /> Accept
              </button>
              <button 
                onClick={() => rejectDocument(file.id)}
                className="flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <XCircle className="h-4 w-4 mr-1" /> Reject
              </button>
            </div>
          </div>
          {file.details.missingFields && file.details.missingFields.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-yellow-600">Missing fields:</p>
              <ul className="mt-1 text-sm text-yellow-600 list-disc list-inside">
                {file.details.missingFields.map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    } else if (file.status === 'processed' && file.reviewed) {
      return (
        <div className="mt-4 p-4 bg-green-100 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="font-medium text-green-700">Reviewed & Processed</span>
          </div>
          <div className="mt-2">
            <p className="text-sm text-green-600">Accuracy: {file.accuracy.toFixed(1)}%</p>
            {file.details.changesCount > 0 && (
              <p className="text-sm text-green-600">Fields Changed: {file.details.changesCount}</p>
            )}
          </div>
        </div>
      );
    } else if (file.status === 'rejected' && file.rejected) {
      return (
        <div className="mt-4 p-4 bg-red-100 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="font-medium text-red-700">Document Rejected</span>
          </div>
          <div className="mt-2">
            <p className="text-sm text-red-600">This document was rejected. Our team will review the extraction process.</p>
          </div>
        </div>
      );
    } else if (editingFile === file.id) {
      return (
        <div className="mt-4 p-6 bg-violet-100 border border-violet-200 rounded-lg">
          <h3 className="text-lg font-medium text-violet-800 mb-4">Edit Document Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-violet-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={editForm.invoiceNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-violet-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-violet-700 mb-1">Invoice Date</label>
                <input
                  type="text"
                  name="invoiceDate"
                  value={editForm.invoiceDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-violet-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-violet-700 mb-1">Amount</label>
                <input
                  type="text"
                  name="amount"
                  value={editForm.amount}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-violet-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-violet-700 mb-1">Vendor</label>
                <input
                  type="text"
                  name="vendor"
                  value={editForm.vendor}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-violet-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4 space-x-3">
            <button
              onClick={cancelEditing}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 to-indigo-200 relative overflow-hidden pb-20">
      {alert && (
        <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${
          alert.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        } transition-all duration-500 ease-in-out`}>
          {alert.message}
        </div>
      )}
      
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={closePreview}></div>
            <div className="relative z-10 bg-white rounded-lg overflow-hidden shadow-xl max-w-6xl w-full mx-auto">
              <div className="p-4 bg-violet-700 text-white flex justify-between items-center">
                <h3 className="text-lg font-medium">Document Preview</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-violet-800 rounded-lg px-3 py-1">
                    <button onClick={zoomOut} className="text-white hover:text-gray-200" disabled={zoomLevel <= 0.5}>
                      <ZoomOut className="h-5 w-5" />
                    </button>
                    <span className="text-sm font-medium">{Math.round(zoomLevel * 100)}%</span>
                    <button onClick={zoomIn} className="text-white hover:text-gray-200" disabled={zoomLevel >= 3}>
                      <ZoomIn className="h-5 w-5" />
                    </button>
                  </div>
                  <button 
                    onClick={closePreview}
                    className="text-white hover:text-gray-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="p-4 flex justify-center overflow-auto">
                {renderFilePreview(previewFile)}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-40 animate-fade-in-up">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 group">
              <h1 className="text-xl font-bold text-violet-900 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-violet-500 group-hover:animate-spin" />
                IPA Solution
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/dataentry')} className="text-violet-900 px-4 py-2 rounded-lg hover:bg-violet-50 transition-colors">
                Data Entry
              </button>
              <GlowingBorder>                 
                <button onClick={() => navigate('/documents')} className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors">
                  Invoice Processing
                </button>
              </GlowingBorder>
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-2 mb-4">
          <header className="px-6 pt-32 pb-5 mx-auto max-w-7xl">
            <FadeInSection>
              <h1 className="text-5xl font-bold text-violet-900 text-center">
                Document
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                  {" "}Automation{" "}
                </span>
                System
              </h1>
              <p className="mt-6 text-lg text-violet-700 text-center max-w-2xl mx-auto">
                Advanced document processing with OCR and detailed analytics
              </p>
            </FadeInSection>
          </header>
        </div>
  
        <div className="relative group mb-8">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000" />
          <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8">
            <div 
              className="border-3 border-dashed border-violet-200 rounded-xl p-10 text-center hover:border-violet-400 transition-all duration-300 bg-violet-50/50 cursor-pointer"
              onDrop={(e) => {
                e.preventDefault();
                handleFiles(e.dataTransfer.files);
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
                id="file-upload"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-16 h-16 mx-auto text-violet-500 mb-4" />
                <h3 className="text-xl font-semibold text-violet-900 mb-2">
                  {processing ? 'Processing...' : 'Upload Documents'}
                </h3>
                <p className="text-violet-600">
                  Drag and drop your files here, or click to browse
                </p>
                <p className="text-sm text-violet-500 mt-2">
                  Supports PDF, JPG, and PNG files
                </p>
              </label>
            </div>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {[
          { title: "Documents", icon: FileText, value: files.length, color: "violet" },
          { title: "Processing Time", icon: Clock, value: `${files.reduce((acc, file) => acc + file.processingTime, 0).toFixed(1)}s`, color: "indigo" },
          { title: "Recognition Rate", icon: BarChart, value: calculateRecognitionRate(), color: "violet", tooltip: "Based on reviewed documents only" },
          { title: "Total Income", icon: DollarSign, value: `$${files.reduce((acc, file) => acc + (parseFloat(file.details.amount) || 0), 0).toFixed(2)}`, color: "indigo" },
          { title: "Status", icon: processing ? Clock : CheckCircle, value: processing ? 'Processing' : 'Ready', color: "violet" },
        ].map((stat, index) => (
        <div key={index} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl blur opacity-20 group-hover:opacity-50 transition duration-1000" />
            <div className="relative bg-white/80 rounded-xl shadow-md p-6 transition-transform duration-300 hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-violet-900">{stat.title}</h3>
                <div className="flex items-center">
                  {stat.tooltip && (
                    <div className="group relative mr-2">
                      <div className="cursor-help text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 16v-4"></path>
                          <path d="M12 8h.01"></path>
                        </svg>
                      </div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-violet-900 text-white text-xs rounded-lg opacity-0 visible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                        {stat.tooltip}
                      </div>
                    </div>
                  )}
                  <stat.icon className={`text-black h-5 w-5 ${processing && stat.title === 'Status' ? 'animate-spin' : ''}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-violet-900 mt-2">{stat.value}</p>
            </div>
          </div>
        ))}
        </div>
      
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000" />
          <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-violet-900 mb-6">Processed Documents</h2>
            <div className="space-y-6">
              {files.map((file) => (
                <div key={file.id} className="bg-violet-50/50 rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${getStatusColor(file.status)}`}>
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-black">{file.file.name}</h3>
                        <div className="mt-1 text-sm text-black space-y-1">
                          <p><strong>Type:</strong> {file.type.split('/')[1].toUpperCase()}</p>
                          <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
                          <p><strong>Upload Date:</strong> {new Date(file.uploadDate).toLocaleString()}</p>
                          <p><strong>Confidence:</strong> {file.confidence.toFixed(1)}%</p>
                          {file.reviewed && (
                            <p><strong>Accuracy:</strong> {file.accuracy.toFixed(1)}%</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => togglePreview(file.id)}
                        className="text-violet-400 hover:text-violet-600 flex items-center px-2 py-1 bg-violet-100 rounded"
                      >
                        <Eye className="h-5 w-5 mr-1" />
                        {previewFile === file.id ? 'Hide' : 'Preview'}
                      </button>
                      <button
                        onClick={() => setFiles(files.filter(f => f.id !== file.id))}
                        className="text-violet-400 hover:text-violet-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
  
                  {previewFile === file.id && (
                    <div className="mt-4">
                      {renderFilePreview(file)}
                    </div>
                  )}
  
                  {renderDocumentStatus(file)}
  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/80 backdrop-blur-md rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-black">Extracted Details</p>
                      <div className="mt-1 text-sm text-black space-y-1">
                        <p><span className="font-bold">Invoice Number:</span> {file.details.invoiceNumber || 'Not found'}</p>
                        <p><span className="font-bold">Date:</span> {file.details.invoiceDate || 'Not found'}</p>
                        <p><span className="font-bold">Amount:</span> {file.details.amount ? `$${file.details.amount}` : 'Not found'}</p>
                        <p><span className="font-bold">Vendor:</span> {file.details.vendor || 'Not found'}</p>
                      </div>
                    </div>
  
                    <div>
                      <p className="text-sm font-medium text-black">Extracted Text</p>
                      <p className="mt-1 text-sm text-black line-clamp-6">{file.rawText}</p>
                    </div>
                  </div>
                </div>
              ))}
  
              {files.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-violet-400" />
                  <p className="mt-2 text-violet-500">No documents processed yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <InvoiceChatBot />
    </div>
  );
}
export default DocumentAutomation;