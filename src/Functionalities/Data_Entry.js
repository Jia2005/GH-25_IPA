import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Sparkles, Check, X, Eye, Loader, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ChatBot from './ChatBot_Data_Entry';

const DocumentUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [currentFileIndex, setCurrentFileIndex] = useState(null);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [shouldCompile, setShouldCompile] = useState(false);
  const [customFilename, setCustomFilename] = useState('');
  const [combinedFilename, setCombinedFilename] = useState('');
  const [processingQueue, setProcessingQueue] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [showCombinePrompt, setShowCombinePrompt] = useState(false);
  const navigate = useNavigate();

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const onFileSelect = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  }, []);

  const deleteFile = useCallback((indexToRemove) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    
    if (currentFileIndex !== null) {
      if (indexToRemove === currentFileIndex) {
        if (indexToRemove < files.length - 1) {
          setCurrentFileIndex(prev => prev);
        } else {
          setCurrentFileIndex(null);
          setCustomFilename('');
        }
      } else if (indexToRemove < currentFileIndex) {
        setCurrentFileIndex(prev => prev - 1);
      }
    }
    
    setProcessingQueue(prev => prev.filter(item => item.id !== indexToRemove));
  }, [currentFileIndex, files.length]);

  const showSuccessAlert = () => {
    setTimeout(() => {
      Swal.fire({
        icon: 'success',
        title: 'Woohoo! 🎉',
        text: shouldCompile ? 'All files were compiled successfully!' : 'All files were processed successfully!',
        showConfirmButton: true,
        confirmButtonText: 'Great!',
        confirmButtonColor: '#4F46E5',
        timer: 3000,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        },
        didOpen: () => {
          Swal.showLoading();
          const icon = Swal.getIcon();
          if (icon) {
            icon.classList.add('animate-spin');
            setTimeout(() => {
              icon.classList.remove('animate-spin');
            }, 1000);
          }
        }
      });
    },1000);
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

  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const previewFileContent = (file) => {
    setPreviewFile(file);
  };

  const closePreview = () => {
    setPreviewFile(null);
  };

  const readAndPreviewCSV = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const rows = content.split('\n').map(row => row.split(','));
        resolve(rows);
      };
      reader.readAsText(file);
    });
  };

  const processCurrentFile = async () => {
    if (!customFilename && !shouldCompile) return;

    setProcessing(true);
    setError('');

    const currentFile = files[currentFileIndex];
    
    setProcessingQueue(prev => [
      ...prev, 
      { name: currentFile.name, status: 'processing', id: currentFileIndex }
    ]);

    const formData = new FormData();
    formData.append('files', currentFile);

    try {
      const response = await fetch('http://localhost:5000/api/process-documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      let filename = '';
      
      if (shouldCompile) {
        filename = `processed_${currentFile.name}`;
      } else {
        filename = customFilename.endsWith('.xlsx') 
          ? customFilename 
          : `${customFilename}.xlsx`;
      }

      if (shouldCompile) {
        setProcessedFiles(prev => [...prev, { blob, filename, originalName: currentFile.name }]);
      } else {
        downloadFile(blob, filename);
      }

      setProcessingQueue(prev => 
        prev.map(item => 
          item.id === currentFileIndex 
            ? { ...item, status: 'completed' } 
            : item
        )
      );

      if (currentFileIndex < files.length - 1) {
        setCurrentFileIndex(prev => prev + 1);
        if (!shouldCompile) {
          setCustomFilename('');
        }
      } else {
        if (shouldCompile && files.length > 1) {
          setShowCombinePrompt(true);
        } else {
          finishProcessing();
        }
      }
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message || 'Failed to process file. Please try again.');
      
      setProcessingQueue(prev => 
        prev.map(item => 
          item.id === currentFileIndex 
            ? { ...item, status: 'failed' } 
            : item
        )
      );
    } finally {
      setProcessing(false);
    }
  };

  const combineAndDownload = () => {
    if (!combinedFilename) return;
    
    setProcessingQueue(prev => [
      ...prev, 
      { name: "Combining all files", status: 'processing', id: 'combined' }
    ]);
    
    setTimeout(async () => {
      try {
        const finalFilename = combinedFilename.endsWith('.xlsx') 
          ? combinedFilename 
          : `${combinedFilename}.xlsx`;
        const formData = new FormData();
        processedFiles.forEach((file, index) => {
          const fileObj = new File([file.blob], file.filename, { type: file.blob.type });
          formData.append('files', fileObj);
        });
        
        formData.append('outputFilename', finalFilename);
        const response = await fetch('http://localhost:5000/api/combine-documents', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const combinedBlob = await response.blob();
        downloadFile(combinedBlob, finalFilename);
        
        setProcessingQueue(prev => 
          prev.map(item => 
            item.id === 'combined'
              ? { ...item, status: 'completed' } 
              : item
          )
        );
        
        finishProcessing();
      } catch (error) {
        console.error('Error combining files:', error);
        setError(error.message || 'Failed to combine files. Please try again.');
        
        setProcessingQueue(prev => 
          prev.map(item => 
            item.id === 'combined'
              ? { ...item, status: 'failed' } 
              : item
          )
        );
      }
    }, 1500);
  };

  const finishProcessing = () => {
    setCurrentFileIndex(null);
    setCustomFilename('');
    setCombinedFilename('');
    setFiles([]);
    setProcessedFiles([]);
    setShowCombinePrompt(false);
    showSuccessAlert();
    
    setTimeout(() => {
      setProcessingQueue([]);
    }, 4000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (showCombinePrompt && combinedFilename && !processing) {
        combineAndDownload();
      } else if ((customFilename && !processing && !shouldCompile) || (shouldCompile && !processing)) {
        processCurrentFile();
      }
    }
  };

  const startProcessing = () => {
    if (files.length > 0) {
      setCurrentFileIndex(0);
      setProcessedFiles([]);
      setProcessingQueue([]);
      
      if (files.length === 1) {
        setShouldCompile(false);
      }
      
      if (shouldCompile && files.length > 1) {
        setCombinedFilename(`combined_${new Date().toISOString().slice(0, 10)}`);
      }
    }
  };

  const FilePreviewModal = ({ file, onClose }) => {
    const [previewUrl, setPreviewUrl] = useState('');
    const [csvData, setCsvData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
      if (!file) return;
      
      const loadPreview = async () => {
        setIsLoading(true);
        
        if (file.type.includes('csv') || file.name.endsWith('.csv')) {
          try {
            const data = await readAndPreviewCSV(file);
            setCsvData(data);
          } catch (error) {
            console.error('Error parsing CSV:', error);
          }
        } else {
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
        }
        
        setIsLoading(false);
      };
      
      loadPreview();
      
      return () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
      };
    }, [file]);
    
    if (!file) return null;
    
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    
    const renderContent = () => {
      if (isLoading) {
        return (
          <div className="flex justify-center items-center h-64">
            <Loader size={32} className="text-indigo-600 animate-spin" />
          </div>
        );
      }
      
      if (fileType.includes('image')) {
        return <img src={previewUrl} alt={file.name} className="max-w-full h-auto" />;
      }
      
      if (fileType.includes('pdf')) {
        return (
          <iframe 
            src={previewUrl} 
            title={file.name} 
            className="w-full h-[70vh]"
          />
        );
      }
      
      if (csvData.length > 0 || fileName.endsWith('.csv')) {
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-indigo-100">
                  {csvData[0] && csvData[0].map((header, i) => (
                    <th key={i} className="p-2 border border-indigo-200 text-left">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.slice(1).map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell, j) => (
                      <td key={j} className="p-2 border border-gray-200">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        return (
          <div className="text-center p-8">
            <div className="mb-4">
              <div className="inline-block p-4 bg-green-100 rounded-full">
                <div className="w-16 h-16 flex items-center justify-center">
                  <span className="text-green-800 text-2xl font-bold">XLS</span>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">{file.name}</h3>
            <p className="text-sm text-gray-600 mb-4">Excel file preview is available for download only</p>
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => {
                const url = URL.createObjectURL(file);
                window.open(url, '_blank');
              }}
            >
              Download to View
            </button>
          </div>
        );
      }
      
      if (fileType.includes('text') || fileType.includes('json') || fileType.includes('xml')) {
        return (
          <div className="bg-gray-100 p-4 rounded overflow-auto whitespace-pre max-h-[70vh]">
            <iframe 
              src={previewUrl} 
              title={file.name} 
              className="w-full h-[70vh]" 
            />
          </div>
        );
      }
      
      return (
        <div className="text-center p-8">
          <p>Preview not available for this file type</p>
          <p className="text-sm text-gray-500 mt-2">{file.type}</p>
        </div>
      );
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-medium text-lg">{file.name}</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {renderContent()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 to-indigo-200 relative overflow-hidden pb-20 mb-70">
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
            <GlowingBorder>  
              <button onClick={() => navigate('/dataentry')} className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors">
                Data Entry
              </button>
            </GlowingBorder>        
            <button onClick={() => navigate('/documents')} className="text-violet-900 px-4 py-2 rounded-lg hover:bg-violet-50 transition-colors">
              Invoice Processing
            </button>               
            </div>
          </div>
        </div>
      </nav>

      {previewFile && (
        <FilePreviewModal 
          file={previewFile} 
          onClose={closePreview} 
        />
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-2 mb-4">
          <header className="px-6 pt-32 pb-5 mx-auto max-w-7xl">
            <div className="opacity-100 translate-y-0 transition-all duration-1000">
              <FadeInSection>
              <h1 className="text-5xl font-bold text-violet-900 text-center">
                Document
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                  {" "}Automation{" "}
                </span>
                System
              </h1>
              <p className="mt-6 text-lg text-violet-700 text-center max-w-2xl mx-auto">
                Process multiple document formats with OCR and data extraction
              </p>
              </FadeInSection>
            </div>
          </header>
        </div>

        <div
          className={`relative rounded-2xl bg-white p-8 flex flex-col items-center justify-center min-h-[400px] transition-all duration-200 ${isDragging ? 'border-2 border-indigo-600' : 'border-2 border-dashed border-gray-200'}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <Upload size={48} className="text-indigo-600 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Upload Documents</h3>
          <p className="text-gray-500 text-center mb-4">Drag and drop your files here, or click to browse</p>
          <p className="text-sm text-gray-400">Supports PDF, Images, Excel, CSV, TXT, JSON, and XML files</p>
          <input
            type="file"
            multiple
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={onFileSelect}
            accept=".pdf,.jpg,.jpeg,.png,.txt,.csv,.xlsx,.xls,.xml,.json"
          />
        </div>

        {files.length > 0 && (
          <div className="mt-6 space-y-6">
            <div className="bg-white rounded-xl p-6">
              <h4 className="font-medium mb-4">Selected Files ({files.length})</h4>
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li key={index} className={`flex items-center justify-between p-2 ${currentFileIndex === index ? 'bg-indigo-50' : 'bg-gray-50'} rounded`}>
                    <span className="text-sm text-gray-600">{file.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                      <button 
                        onClick={() => previewFileContent(file)}
                        className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => deleteFile(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        disabled={currentFileIndex !== null}
                      >
                        <Trash2 size={16} className={currentFileIndex !== null ? "opacity-50" : ""} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {files.length > 1 && currentFileIndex === null && (
                <div className="mt-4 flex items-center space-x-2">
                  <button onClick={() => setShouldCompile(!shouldCompile)} className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className={`w-5 h-5 rounded border ${shouldCompile ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'} flex items-center justify-center`}>
                      {shouldCompile && <Check size={16} className="text-white" />}
                    </div>
                    <span>Compile all files into one</span>
                  </button>
                </div>
              )}

              {processingQueue.length > 0 && (
                <div className="mt-4 bg-indigo-50 rounded-lg p-4">
                  <h5 className="text-lg font-medium mb-3">Processing Queue</h5>
                  <ul className="space-y-3">
                    {processingQueue.map((item, index) => (
                      <li key={index} className="flex items-center justify-between p-3 bg-white rounded shadow-sm">
                        <span className="text-base text-gray-700">{item.name}</span>
                        <div>
                          {item.status === 'processing' && (
                            <Loader size={20} className="text-indigo-600 animate-spin" />
                          )}
                          {item.status === 'completed' && (
                            <Check size={20} className="text-green-500" />
                          )}
                          {item.status === 'failed' && (
                            <X size={20} className="text-red-500" />
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentFileIndex === null && !showCombinePrompt ? (
                <button 
                  onClick={startProcessing} 
                  className="mt-4 px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors w-full md:w-auto"
                  disabled={files.length === 0}
                >
                  Start Processing
                </button>
              ) : showCombinePrompt ? (
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                  <h5 className="text-lg font-medium mb-3">All files have been processed!</h5>
                  <h6 className="text-base mb-2">What do you want to save the combined file as?</h6>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={combinedFilename}
                      onChange={(e) => setCombinedFilename(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter filename for combined file"
                      className="w-full px-3 py-2 border rounded-lg text-base"
                      autoFocus
                    />
                    <button
                      onClick={combineAndDownload}
                      disabled={!combinedFilename}
                      className="w-full px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-base"
                    >
                      Combine & Download
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                  <h5 className="text-lg font-medium mb-3">Processing: {files[currentFileIndex].name}</h5>
                  <div className="space-y-4">
                    {(!shouldCompile || files.length === 1) ? (
                      <input
                        type="text"
                        value={customFilename}
                        onChange={(e) => setCustomFilename(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter filename for processed file"
                        className="w-full px-3 py-2 border rounded-lg text-base"
                        autoFocus
                      />
                    ) : null}
                    <button
                      onClick={processCurrentFile}
                      disabled={processing || (!customFilename && !shouldCompile) || (!customFilename && files.length === 1)}
                      className="w-full px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-base"
                    >
                      {processing ? 'Processing...' : 'Process File'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
        )}
      </div>
      <ChatBot />
    </div>
  );
};

export default DocumentUpload;