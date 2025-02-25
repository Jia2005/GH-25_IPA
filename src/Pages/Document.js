import React from 'react';
import DocumentProcessor from '../components/DocumentProcessor/DocumentProcessor';
import { FileText, Sparkles } from 'lucide-react';

const Documents = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 to-indigo-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-violet-900 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-violet-500" />
                Documents
              </h1>
              <p className="mt-1 text-sm text-violet-600">
                Upload and process your documents using AI analysis
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select 
                className="block w-full rounded-lg border-violet-200 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm bg-white/80 backdrop-blur-md text-violet-900"
                defaultValue="all"
              >
                <option value="all">All Documents</option>
                <option value="processed">Processed</option>
                <option value="needs_review">Needs Review</option>
              </select>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000" />
          <div className="relative bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 transition-transform duration-300 hover:scale-[1.01]">
            <DocumentProcessor />
          </div>
        </div>

        <div className="mt-8 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg blur opacity-20 group-hover:opacity-50 transition duration-1000" />
          <div className="relative bg-violet-50/80 backdrop-blur-md rounded-lg p-6 transition-transform duration-300 hover:scale-[1.01]">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-violet-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-violet-900">
                  Document Processing Instructions
                </h3>
                <div className="mt-2 text-sm text-violet-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Upload JPG or PNG files up to 5MB in size</li>
                    <li>Wait for AI analysis to complete</li>
                    <li>Review extracted information for accuracy</li>
                    <li>Download or export processed documents as needed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;