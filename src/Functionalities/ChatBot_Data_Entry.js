import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Maximize2, Minimize2, Send, User } from 'lucide-react';
import BotImage from './../Images/chatbot.jpg';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      fromUser: false,
      text: "Hi there! I'm Pixie, your document buddy! I can help with document processing, data extraction, and more. What can I assist you with today?",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const botAvatarUrl = BotImage; 
  const BotAvatar = () => (
    <div className="rounded-full flex items-center justify-center overflow-hidden" 
         style={{ 
           width: '40px', 
           height: '40px',
           boxShadow: '0 0 10px rgba(79, 70, 229, 0.5)'
         }}>
      <img 
        src={botAvatarUrl} 
        alt="Bot Avatar" 
        className="w-full h-full object-cover"
      />
    </div>
  );

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getGreeting = () => {
    const greetings = [
      "Hi there! I'm Pixie, your document buddy! I can help with document processing, data extraction, and more. What can I assist you with today?",
      "Hello! I'm Pixie, your friendly document assistant. How can I make your document processing easier today?",
      "Welcome! Pixie at your service! Ready to streamline your document workflow? What can I help with?",
      "Greetings! I'm Pixie, your document processing pal. Feel free to ask me anything about our document services!",
      "Hi! I'm Pixie! I'm here to simplify your document management. What would you like to know today?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  const processQuery = (query) => {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('upload') || queryLower.includes('add document') || queryLower.includes('submit') || queryLower.includes('send file')) {
      return "You can upload files by dragging and dropping them in the upload area or by clicking to browse. We support PDF, JPG, PNG, Excel, Word, CSV, TXT, JSON, and XML formats.";
    } 
    else if (queryLower.includes('supported') || queryLower.includes('file type') || queryLower.includes('format') || queryLower.includes('what type')) {
      return "We support a wide range of file formats including: PDF, JPG, PNG, TIFF, BMP, Excel (XLSX, XLS), Word (DOCX, DOC), CSV, TXT, JSON, and XML files. Let me know if you need information about a specific format!";
    }
    else if (queryLower.includes('ocr') || queryLower.includes('text recognition') || queryLower.includes('extract text') || queryLower.includes('recognize text')) {
      return "Our system uses advanced OCR (Optical Character Recognition) to extract text from images and documents. The accuracy varies based on document quality, but we're constantly improving our algorithms!";
    }
    else if (queryLower.includes('edit') || queryLower.includes('correct') || queryLower.includes('change') || queryLower.includes('modify')) {
      return "You can edit extracted information by clicking the 'Edit' button on any document. You can modify fields like dates, amounts, names, and other data that might need correction.";
    }
    else if (queryLower.includes('reject') || queryLower.includes('decline') || queryLower.includes('discard')) {
      return "If a document has too many errors, you can reject it by clicking the 'Reject' button. This helps us improve our extraction algorithms for future processing.";
    }
    else if (queryLower.includes('process') || queryLower.includes('how long') || queryLower.includes('time') || queryLower.includes('duration')) {
      return "Processing time depends on document complexity and system load. Typically, PDFs take 2-5 seconds, while images may take 3-8 seconds. Larger files like Excel sheets might take a bit longer.";
    }
    else if (queryLower.includes('accuracy') || queryLower.includes('recognition rate') || queryLower.includes('error rate') || queryLower.includes('success')) {
      return "Our recognition accuracy is typically above 95% for clear documents. You can help improve it by reviewing and correcting fields when necessary, which helps train our AI!";
    }
    else if (queryLower.includes('vendor') || queryLower.includes('supplier') || queryLower.includes('company') || queryLower.includes('business')) {
      return "Vendor information is extracted automatically based on common document patterns. If it's missing or incorrect, you can edit the document to add the proper details.";
    }
    else if (queryLower.includes('preview') || queryLower.includes('view') || queryLower.includes('see') || queryLower.includes('open')) {
      return "Click the 'Preview' button on any document to view its contents. You can zoom in/out and navigate through multi-page documents using the controls in the preview window.";
    }
    else if (queryLower.includes('missing field') || queryLower.includes('incomplete') || queryLower.includes('not found') || queryLower.includes('blank')) {
      return "Documents with missing fields are highlighted for review. You'll see a yellow notification indicating which fields couldn't be extracted automatically and need your attention.";
    }
    else if (queryLower.includes('export') || queryLower.includes('download') || queryLower.includes('save') || queryLower.includes('backup')) {
      return "You can export processed data in various formats including CSV, Excel, and PDF. Look for the 'Export' button after processing is complete.";
    }
    else if (queryLower.includes('combine') || queryLower.includes('merge') || queryLower.includes('multiple') || queryLower.includes('join')) {
      return "Yes, you can combine multiple files into one document! Simply select all the files you want to merge, arrange them in your preferred order, and check the 'Compile files' option before processing.";
    }
    else if (queryLower.includes('data entry') || queryLower.includes('enter data') || queryLower.includes('input') || queryLower.includes('form')) {
      return "Our platform offers streamlined data entry solutions! You can manually input data through our intuitive forms, use AI-assisted auto-fill, or batch import data from structured sources.";
    }
    else if (queryLower.includes('hello') || queryLower.includes('hi') || queryLower.includes('hey') || queryLower.includes('greetings')) {
      return getGreeting();
    }
    else if (queryLower.includes('thank') || queryLower.includes('thanks') || queryLower.includes('appreciate')) {
      return "You're welcome! I'm always happy to help make document processing easier for you. Is there anything else you'd like to know about our services?";
    }
    else if (queryLower.includes('bye') || queryLower.includes('goodbye') || queryLower.includes('see you')) {
      return "Thanks for chatting with me! Feel free to come back anytime you have questions about document processing. Pixie is always here to help!";
    }
    else if (queryLower.includes('help') || queryLower.includes('tutorial') || queryLower.includes('guide') || queryLower.includes('assistance')) {
      return "I can answer questions about uploading documents, supported formats, data extraction, OCR capabilities, editing information, and more. What specific aspect would you like help with?";
    }
    else if (queryLower.includes('invoice') || queryLower.includes('receipt') || queryLower.includes('bill')) {
      return "Our system can automatically extract key information from invoices including invoice number, date, total amount, and vendor details. All extracted data can be reviewed and edited if needed.";
    }
    else if (queryLower.includes('batch') || queryLower.includes('bulk')) {
      return "Yes, you can upload multiple documents at once for batch processing. Simply select all files or drag them together into the upload area. We can process up to 50 files simultaneously!";
    }
    else if (queryLower.includes('limit') || queryLower.includes('maximum') || queryLower.includes('size')) {
      return "The maximum file size for uploads is 25MB per file. For batch processing, you can upload up to 50 files at once with a total size limit of 100MB.";
    }
    else {
      return "I'm not sure I understand your question. As Pixie, your document assistant, I can help with document uploading, processing, supported formats, data extraction, or understanding system features. Could you rephrase your question?";
    }
  };

  const sendMessage = () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      fromUser: true,
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setTimeout(() => {
      const response = processQuery(userMessage.text);
      
      setMessages(prev => [
        ...prev,
        {
          fromUser: false,
          text: response,
          timestamp: new Date()
        }
      ]);
      
      setIsLoading(false);
    }, 1000);
  };

  const chatContainerStyles = isMaximized 
  ? {
      position: 'fixed',
      top: '20px',
      right: '20px',
      bottom: '20px',
      left: '20px',
      width: 'auto',
      height: 'auto',
      zIndex: 60
    } 
  : {
      position: 'absolute',
      bottom: '80px',
      right: '0',
      width: window.innerWidth < 640 ? '320px' : '420px',
      height: '480px' 
    };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleChat}
        className="relative flex items-center justify-center w-16 h-16 rounded-full shadow-xl transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
          boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.5)'
        }}
      >
        <div className="relative">
          <MessageSquare size={26} className="text-white" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full">
            <span className="absolute top-0 left-0 w-full h-full rounded-full bg-green-400 animate-ping opacity-75"></span>
          </div>
        </div>
      </button>

      {isOpen && (
        <div 
          className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300"
          style={{
            ...chatContainerStyles,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(79, 70, 229, 0.2)'
          }}
        >
          <div 
            className="py-4 px-4 flex items-center"
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="mr-3">
              <BotAvatar />
            </div>
            <h3 className="font-medium text-white text-lg">Pixie - Document Buddy</h3>
            <div className="ml-auto flex items-center">
              <button 
                onClick={toggleMaximize} 
                className="text-white hover:text-indigo-100 mr-3 transition-colors"
                aria-label={isMaximized ? "Minimize chat" : "Maximize chat"}
              >
                {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              <button 
                onClick={toggleChat} 
                className="text-white hover:text-indigo-100 transition-colors"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div 
            className="flex-1 overflow-y-auto p-4"
            style={{ 
              background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
              height: isMaximized ? 'calc(100% - 130px)' : '400px'
            }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 flex ${message.fromUser ? 'justify-end' : 'justify-start'}`}
              >
                {!message.fromUser && 
                  <div className="mr-2 flex-shrink-0 self-end mb-1">
                    <BotAvatar />
                  </div>
                }
                
                <div
                  className={`max-w-xs sm:max-w-md rounded-2xl py-3 px-4 ${
                    message.fromUser
                      ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-800 shadow-md'
                  }`}
                  style={{
                    boxShadow: message.fromUser 
                      ? '0 10px 15px -3px rgba(79, 70, 229, 0.2)' 
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.fromUser ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                
                {message.fromUser && 
                  <div className="ml-2 flex-shrink-0 self-end mb-1 bg-indigo-100 rounded-full flex items-center justify-center"
                       style={{ width: '40px', height: '40px' }}> 
                    <User size={20} className="text-indigo-600" /> 
                  </div>
                }
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="mr-2 flex-shrink-0 self-end mb-1">
                  <BotAvatar />
                </div>
                <div className="bg-white text-gray-700 rounded-2xl py-3 px-4 shadow-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 py-3 border-t border-indigo-100 bg-white">
            <div className="flex rounded-full border border-indigo-200 bg-indigo-50 overflow-hidden shadow-inner">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Ask Pixie about document processing..."
                className="flex-1 p-3 bg-transparent focus:outline-none text-gray-700 placeholder-indigo-300"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className={`px-4 flex items-center justify-center ${
                  !input.trim() || isLoading
                    ? 'text-indigo-200'
                    : 'text-indigo-600 hover:text-indigo-800'
                } transition-colors`}
                style={{ transform: input.trim() && !isLoading ? 'scale(1.05)' : 'scale(1)' }}
              >
                <div className={`${input.trim() && !isLoading ? 'bg-indigo-100' : 'bg-indigo-50'} p-2 rounded-full transition-colors`}>
                  <Send size={18} className="transform rotate-45" />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;