/**
 * PDF Preview Modal Component
 * 
 * Shows a preview of the PDF before allowing download.
 * Provides a better UX by letting users see what they're about to download.
 * 
 * @author NutriPeek Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Loader2, Eye, Settings } from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';
import { NutritionalNote } from '@/types/notes';
import { PDFGenerationOptions } from '@/types/pdf';
import { NotesPDFTemplate } from './NotesPDFTemplate';
import PDFGenerator from '@/utils/PDFGenerator';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: NutritionalNote;
  onDownload?: () => void;
}

/**
 * PDF Preview Modal Component
 * Shows a preview of the PDF with download options
 */
export default function PDFPreviewModal({ 
  isOpen, 
  onClose, 
  note, 
  onDownload 
}: PDFPreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [pdfOptions, setPdfOptions] = useState<PDFGenerationOptions>(
    PDFGenerator.getDefaultOptions()
  );
  const [pdfData, setPdfData] = useState<any>(null);

  // Process PDF data when modal opens
  useEffect(() => {
    if (isOpen && note) {
      try {
        // Use the same data processing logic from PDFGenerator
        const processedData = (PDFGenerator as any).processNoteData(note);
        setPdfData(processedData);
      } catch (error) {
        console.error('Failed to process PDF data:', error);
      }
    }
  }, [isOpen, note]);

  // Handle download
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const success = await PDFGenerator.downloadNotePDF(note, pdfOptions);
      if (success && onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error('Failed to download PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle option changes
  const handleOptionChange = (key: keyof PDFGenerationOptions, value: boolean) => {
    setPdfOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  PDF Preview
                </h2>
                <p className="text-sm text-gray-500">
                  {note.childName}'s Nutrition Report
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Options Toggle */}
              {/* <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="PDF Options"
              >
                <Settings className="w-5 h-5" />
              </button> */}
              
              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isDownloading ? 'Downloading...' : 'Download PDF'}
              </button>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Options Panel */}
          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-gray-200 bg-gray-50 overflow-hidden"
              >
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    PDF Content Options
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={pdfOptions.includeNutrientDetails}
                        onChange={(e) => handleOptionChange('includeNutrientDetails', e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Nutrient Details</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={pdfOptions.includeFoodItems}
                        onChange={(e) => handleOptionChange('includeFoodItems', e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Food Items</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={pdfOptions.includeActivityInfo}
                        onChange={(e) => handleOptionChange('includeActivityInfo', e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Activity Info</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={pdfOptions.includeRecommendations}
                        onChange={(e) => handleOptionChange('includeRecommendations', e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Recommendations</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={pdfOptions.includeBranding}
                        onChange={(e) => handleOptionChange('includeBranding', e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">NutriPeek Branding</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* PDF Preview */}
          <div className="flex-1 bg-gray-100 overflow-hidden">
            {pdfData ? (
              <PDFViewer
                width="100%"
                height="100%"
                showToolbar={true}
                className="border-none"
              >
                <NotesPDFTemplate data={pdfData} options={pdfOptions} />
              </PDFViewer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
                  <p className="text-gray-500">Loading PDF preview...</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 