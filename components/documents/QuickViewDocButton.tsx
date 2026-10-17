'use client';

import React, { useState } from 'react';
import { Eye, FileCheck } from 'lucide-react';
import { isImageData, getSafeImageSrc } from '@/lib/utils/documentHelper';
import DocumentPreviewModal, { DocumentItem } from './DocumentPreviewModal';

interface QuickViewDocButtonProps {
  docValue?: string | null;
  docTitle: string;
  userName?: string;
  className?: string;
  variant?: 'button' | 'compact' | 'badge';
  buttonText?: string;
  documents?: DocumentItem[];
  initialDocId?: string;
}

export default function QuickViewDocButton({
  docValue,
  docTitle,
  userName = 'User',
  className = '',
  variant = 'button',
  buttonText,
  documents,
  initialDocId,
}: QuickViewDocButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if ((!docValue || !isImageData(docValue)) && (!documents || documents.length === 0)) {
    return null;
  }

  const docItem: DocumentItem = {
    id: docTitle.toLowerCase().replace(/\s+/g, '_'),
    title: docTitle,
    src: getSafeImageSrc(docValue),
    subtitle: `${userName}'s ${docTitle}`,
  };

  const text = buttonText || `View ${docTitle}`;

  return (
    <>
      {variant === 'badge' ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-sm ${className}`}
          title={`Click to view ${docTitle} image`}
        >
          <Eye size={13} className="text-emerald-600" />
          <span>{text}</span>
        </button>
      ) : variant === 'compact' ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark hover:underline transition-colors ${className}`}
          title={`Click to view ${docTitle} image`}
        >
          <Eye size={13} />
          <span>{text}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-dark transition-all shadow-sm hover:shadow ${className}`}
          title={`Click to view ${docTitle} image`}
        >
          <Eye size={14} />
          <span>{text}</span>
        </button>
      )}

      <DocumentPreviewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        documents={documents && documents.length > 0 ? documents : (docItem ? [docItem] : [])}
        initialDocId={initialDocId || docItem?.id}
        userName={userName}
      />
    </>
  );
}
