'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  ExternalLink, 
  Maximize2, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { downloadDocumentImage, openImageInNewTab } from '@/lib/utils/documentHelper';

export interface DocumentItem {
  id: string;
  title: string;
  src: string;
  subtitle?: string;
}

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  initialDocId?: string;
  userName?: string;
}

export default function DocumentPreviewModal({
  isOpen,
  onClose,
  documents,
  initialDocId,
  userName = 'User',
}: DocumentPreviewModalProps) {
  const [activeId, setActiveId] = useState<string>(initialDocId || documents[0]?.id || '');
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [imageError, setImageError] = useState<boolean>(false);

  // Sync active document when modal opens or initialDocId changes
  useEffect(() => {
    if (isOpen) {
      if (initialDocId && documents.some(d => d.id === initialDocId)) {
        setActiveId(initialDocId);
      } else if (documents.length > 0) {
        setActiveId(documents[0].id);
      }
      setZoom(1);
      setRotation(0);
      setImageError(false);
    }
  }, [isOpen, initialDocId, documents]);

  // Reset zoom & rotation when switching documents
  const handleSelectDoc = (id: string) => {
    setActiveId(id);
    setZoom(1);
    setRotation(0);
    setImageError(false);
  };

  const activeIndex = documents.findIndex(d => d.id === activeId);
  const activeDoc = documents[activeIndex] || documents[0];

  const handleNext = useCallback(() => {
    if (documents.length <= 1) return;
    const nextIdx = (activeIndex + 1) % documents.length;
    handleSelectDoc(documents[nextIdx].id);
  }, [activeIndex, documents]);

  const handlePrev = useCallback(() => {
    if (documents.length <= 1) return;
    const prevIdx = (activeIndex - 1 + documents.length) % documents.length;
    handleSelectDoc(documents[prevIdx].id);
  }, [activeIndex, documents]);

  // Handle escape and arrow keys
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === '+' || e.key === '=') {
        setZoom(z => Math.min(z + 0.25, 3));
      } else if (e.key === '-') {
        setZoom(z => Math.max(z - 0.25, 0.5));
      } else if (e.key === '0') {
        setZoom(1);
        setRotation(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent background scroll while modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || !activeDoc) return null;

  const handleDownload = () => {
    const cleanUserName = userName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const cleanDocTitle = activeDoc.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = `${cleanUserName}_${cleanDocTitle}.jpg`;
    downloadDocumentImage(activeDoc.src, filename);
  };

  const handleOpenInNewTab = () => {
    openImageInNewTab(activeDoc.src);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full h-full max-w-6xl max-h-[96vh] flex flex-col bg-gray-950 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden m-2 sm:m-4">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gray-900/90 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary-light flex items-center justify-center font-bold">
              <FileText size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  {activeDoc.title}
                </h3>
                <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full font-medium">
                  {activeIndex + 1} of {documents.length}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {activeDoc.subtitle || `${userName}'s KYC Verification Document`}
              </p>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Zoom Out */}
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              title="Zoom Out (-)"
            >
              <ZoomOut size={17} />
            </button>

            {/* Current Zoom Level Badge */}
            <span className="text-xs text-gray-400 font-mono w-12 text-center select-none hidden sm:inline-block">
              {Math.round(zoom * 100)}%
            </span>

            {/* Zoom In */}
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              title="Zoom In (+)"
            >
              <ZoomIn size={17} />
            </button>

            {/* Rotate */}
            <button
              type="button"
              onClick={() => setRotation(r => (r + 90) % 360)}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              title="Rotate 90° (R)"
            >
              <RotateCw size={17} />
            </button>

            {/* Reset */}
            {(zoom !== 1 || rotation !== 0) && (
              <button
                type="button"
                onClick={() => { setZoom(1); setRotation(0); }}
                className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                title="Reset View (0)"
              >
                <RefreshCw size={17} />
              </button>
            )}

            <div className="h-5 w-px bg-gray-800 mx-1 hidden sm:block" />

            {/* Open in New Tab */}
            <button
              type="button"
              onClick={handleOpenInNewTab}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors hidden sm:inline-flex"
              title="Open full image in new tab"
            >
              <ExternalLink size={17} />
            </button>

            {/* Download */}
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-sm transition-all hover:shadow"
              title="Download Document"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 ml-1 rounded-lg text-gray-400 hover:text-white hover:bg-red-500/20 hover:text-red-400 transition-colors"
              title="Close (Esc)"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Multi-Document Tabs (if > 1 document) */}
        {documents.length > 1 && (
          <div className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-gray-900 border-b border-gray-800/80 overflow-x-auto shrink-0 scrollbar-thin">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mr-1">
              Documents:
            </span>
            {documents.map((doc) => {
              const isSelected = doc.id === activeId;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => handleSelectDoc(doc.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary text-white shadow-sm font-semibold'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span>{doc.title}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Image Viewer Area */}
        <div className="relative flex-1 overflow-auto flex items-center justify-center p-4 bg-gray-950 select-none">
          {/* Previous Button */}
          {documents.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-gray-900/80 hover:bg-gray-800 text-white border border-gray-700/60 shadow-lg transition-transform hover:scale-105"
              title="Previous document (Left Arrow)"
              aria-label="Previous document"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Next Button */}
          {documents.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-gray-900/80 hover:bg-gray-800 text-white border border-gray-700/60 shadow-lg transition-transform hover:scale-105"
              title="Next document (Right Arrow)"
              aria-label="Next document"
            >
              <ChevronRight size={22} />
            </button>
          )}

          {/* Image Display */}
          <div className="flex items-center justify-center w-full h-full min-h-[300px]">
            {imageError ? (
              <div className="text-center p-8 bg-gray-900 rounded-xl border border-gray-800 max-w-md">
                <FileText size={48} className="mx-auto text-gray-500 mb-3" />
                <h4 className="text-white font-semibold mb-1">Image Preview Unavailable</h4>
                <p className="text-xs text-gray-400 mb-4">
                  The document data could not be rendered as an image directly.
                </p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Download size={14} /> Download Document Instead
                </button>
              </div>
            ) : (
              <div 
                className="transition-transform duration-150 ease-out flex items-center justify-center max-w-full max-h-full"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeDoc.src}
                  alt={activeDoc.title}
                  onError={() => setImageError(true)}
                  className="max-h-[78vh] max-w-full object-contain rounded-lg shadow-2xl border border-gray-800 pointer-events-auto"
                  draggable={false}
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-2.5 bg-gray-900 border-t border-gray-800 text-xs text-gray-400 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-300">{activeDoc.title}</span>
            <span className="text-gray-600">•</span>
            <span>{userName}</span>
            {rotation !== 0 && (
              <>
                <span className="text-gray-600">•</span>
                <span className="text-primary-light">Rotated {rotation}°</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 text-[11px] text-gray-500">
            <span className="hidden sm:inline">Use <kbd className="px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded border border-gray-700">ESC</kbd> to close</span>
            <span className="hidden sm:inline">Use <kbd className="px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded border border-gray-700">&larr;</kbd> <kbd className="px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded border border-gray-700">&rarr;</kbd> to switch</span>
            <span className="text-gray-400">Zoom: {Math.round(zoom * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
