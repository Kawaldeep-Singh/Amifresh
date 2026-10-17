'use client';

import React, { useState } from 'react';
import { 
  CreditCard, 
  FileText, 
  UserCheck, 
  Eye, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import { isImageData, getSafeImageSrc, downloadDocumentImage } from '@/lib/utils/documentHelper';
import DocumentPreviewModal, { DocumentItem } from '@/components/documents/DocumentPreviewModal';

interface UserDocumentsViewerProps {
  user: {
    name: string;
    referralCode?: string;
    role?: string;
    panCard?: string | null;
    aadhaarCard?: string | null;
    aadhaarCardFront?: string | null;
    aadhaarCardBack?: string | null;
    photo?: string | null;
  };
}

export default function UserDocumentsViewer({ user }: UserDocumentsViewerProps) {
  const [activeModalDocId, setActiveModalDocId] = useState<string | null>(null);

  // Build the list of available document items in order: Profile Photo, PAN Card, Aadhaar Front, Aadhaar Back
  const documents: DocumentItem[] = [];

  // 1. Profile Photo
  if (user.photo && isImageData(user.photo)) {
    documents.push({
      id: 'profile_photo',
      title: 'Profile Photo',
      src: getSafeImageSrc(user.photo),
      subtitle: `${user.name}'s Profile Photograph / Selfie`,
    });
  }

  // 2. PAN Card
  if (user.panCard && isImageData(user.panCard)) {
    documents.push({
      id: 'pan_card',
      title: 'PAN Card',
      src: getSafeImageSrc(user.panCard),
      subtitle: `${user.name}'s Permanent Account Number (PAN) Card`,
    });
  }

  // 3. Aadhaar Card Front (or general aadhaarCard if it's an image)
  const aadhaarFrontSrc = user.aadhaarCardFront && isImageData(user.aadhaarCardFront)
    ? user.aadhaarCardFront
    : (user.aadhaarCard && isImageData(user.aadhaarCard) ? user.aadhaarCard : null);

  if (aadhaarFrontSrc) {
    documents.push({
      id: 'aadhaar_front',
      title: 'Aadhaar Card (Front)',
      src: getSafeImageSrc(aadhaarFrontSrc),
      subtitle: `${user.name}'s Aadhaar Card Front Side`,
    });
  }

  // 4. Aadhaar Card Back
  if (user.aadhaarCardBack && isImageData(user.aadhaarCardBack)) {
    documents.push({
      id: 'aadhaar_back',
      title: 'Aadhaar Card (Back)',
      src: getSafeImageSrc(user.aadhaarCardBack),
      subtitle: `${user.name}'s Aadhaar Card Back Side (Address Proof)`,
    });
  }

  const handleOpenDoc = (id: string) => {
    setActiveModalDocId(id);
  };

  const handleCloseModal = () => {
    setActiveModalDocId(null);
  };

  const docConfigs = [
    {
      id: 'profile_photo',
      label: 'Profile Photo',
      icon: UserCheck,
      description: 'Official photograph submitted during signup',
      isUploaded: Boolean(user.photo && isImageData(user.photo)),
      src: user.photo && isImageData(user.photo) ? getSafeImageSrc(user.photo) : null,
      textValue: null,
    },
    {
      id: 'pan_card',
      label: 'PAN Card',
      icon: CreditCard,
      description: 'Tax & identity verification document',
      isUploaded: Boolean(user.panCard && isImageData(user.panCard)),
      src: user.panCard && isImageData(user.panCard) ? getSafeImageSrc(user.panCard) : null,
      textValue: user.panCard && !isImageData(user.panCard) ? user.panCard : null,
    },
    {
      id: 'aadhaar_front',
      label: 'Aadhaar Card (Front)',
      icon: FileText,
      description: 'UIDAI government identity proof (front)',
      isUploaded: Boolean(aadhaarFrontSrc),
      src: aadhaarFrontSrc ? getSafeImageSrc(aadhaarFrontSrc) : null,
      textValue: user.aadhaarCard && !isImageData(user.aadhaarCard) ? user.aadhaarCard : null,
    },
    {
      id: 'aadhaar_back',
      label: 'Aadhaar Card (Back)',
      icon: FileText,
      description: 'UIDAI government address proof (back)',
      isUploaded: Boolean(user.aadhaarCardBack && isImageData(user.aadhaarCardBack)),
      src: user.aadhaarCardBack && isImageData(user.aadhaarCardBack) ? getSafeImageSrc(user.aadhaarCardBack) : null,
      textValue: null,
    },
  ];

  const totalUploaded = docConfigs.filter(d => d.isUploaded || d.textValue).length;

  return (
    <div id="kyc-documents" className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              KYC Documents & Verification
            </h3>
            <p className="text-xs text-gray-500">
              Official identity and address proofs submitted by Sakhi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            totalUploaded >= 3 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {totalUploaded >= 3 ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
            <span>{totalUploaded} of 4 Documents Uploaded</span>
          </span>
        </div>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {docConfigs.map((doc) => {
          const IconComponent = doc.icon;
          return (
            <div 
              key={doc.id}
              className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                doc.isUploaded 
                  ? 'bg-white border-gray-200 hover:border-primary/50 hover:shadow-md' 
                  : 'bg-gray-50/70 border-dashed border-gray-300'
              }`}
            >
              <div>
                {/* Card Title & Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      doc.isUploaded ? 'bg-primary-light/40 text-primary' : 'bg-gray-200 text-gray-500'
                    }`}>
                      <IconComponent size={16} />
                    </div>
                    <span className="text-xs font-bold text-gray-800 tracking-tight">
                      {doc.label}
                    </span>
                  </div>

                  {doc.isUploaded ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Uploaded
                    </span>
                  ) : doc.textValue ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                      Number
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                      Missing
                    </span>
                  )}
                </div>

                {/* Thumbnail Preview Area */}
                <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mb-3 group flex items-center justify-center">
                  {doc.src ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={doc.src} 
                        alt={doc.label}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Hover Overlay */}
                      <div 
                        onClick={() => handleOpenDoc(doc.id)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white p-2 text-center"
                      >
                        <Maximize2 size={24} className="mb-1 text-primary-light" />
                        <span className="text-xs font-semibold">Click to View Full Size</span>
                      </div>
                    </>
                  ) : doc.textValue ? (
                    <div className="flex flex-col items-center justify-center p-3 text-center">
                      <FileText size={28} className="text-gray-400 mb-1" />
                      <span className="text-[11px] text-gray-500 uppercase font-semibold">Document Number</span>
                      <span className="text-sm font-bold font-mono text-gray-800 mt-1 uppercase">
                        {doc.textValue}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-3 text-gray-400">
                      <IconComponent size={28} className="mb-1 stroke-1" />
                      <span className="text-xs font-medium">Not Uploaded</span>
                    </div>
                  )}
                </div>

                {/* Subtitle / Description */}
                <p className="text-[11px] text-gray-500 line-clamp-1 mb-3">
                  {doc.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                {doc.src ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenDoc(doc.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-sm hover:shadow"
                    >
                      <Eye size={14} />
                      <span>View {doc.label.split(' ')[0]}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const filename = `${user.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${doc.id}.jpg`;
                        downloadDocumentImage(doc.src!, filename);
                      }}
                      className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                      title="Download image"
                    >
                      <Download size={14} />
                    </button>
                  </>
                ) : (
                  <div className="w-full text-center py-1.5 text-xs text-gray-400 italic">
                    {doc.textValue ? 'No Image Uploaded' : 'Document Not Provided'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox / Modal for Full Document Preview */}
      <DocumentPreviewModal
        isOpen={Boolean(activeModalDocId)}
        onClose={handleCloseModal}
        documents={documents}
        initialDocId={activeModalDocId || undefined}
        userName={user.name}
      />
    </div>
  );
}
