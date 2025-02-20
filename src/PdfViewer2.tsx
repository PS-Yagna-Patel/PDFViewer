import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-contexify/dist/ReactContexify.css';
import './PDFViewer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
 
const MAX_FILE_SIZE = 10 * 1024 * 1024;
 
const PdfViewer: React.FC = () => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [contextMenu, setContextMenu] = useState<{ top: number; left: number; text: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setError(null);
 
    if (!selectedFile) {
      return;
    }
 
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }
 
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }
 
    setFile(selectedFile);
    setPageNumber(1);
    setContextMenu(null);
  };

  const handleDoubleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleSingleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };
 
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };
 
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
 
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
      setPageNumber(1);
      setContextMenu(null);
    } else {
      setError('Please drop a PDF file');
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };
 
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    const selection = window.getSelection();
    
    if (selection && selection.toString().trim()) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setContextMenu({
            top: rect.top + window.scrollY + rect.height,
            left: rect.left + window.scrollX,
            text: selection.toString().trim(),
        });
    }
};

 
  const handlePageChange = (delta: number) => {
    setContextMenu(null);
    if (numPages) {
      const newPage = pageNumber + delta;
      if (newPage >= 1 && newPage <= numPages) {
        setPageNumber(newPage);
      }
    }
  };
 
  const handleZoom = (delta: number) => {
    const newScale = Math.max(0.5, Math.min(2.0, scale + delta));
    setScale(newScale);
  };

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
}, []);

  return (
    <div className="pdf-viewer-container" ref={containerRef} >
      {!file && (
        <div
          className="upload-area"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="file-input"
          />
          <div className="upload-content">
            <svg
              className="upload-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p>Click or drag and drop to upload PDF</p>
            <p className="file-size-info">
              Maximum file size: {MAX_FILE_SIZE / (1024 * 1024)}MB
            </p>
          </div>
        </div>
      )}
 
      {error && <div className="error-message">{error}</div>}
 
      {file && (
        <>
          <div className="pdf-controls">
            <button onClick={() => setFile(null)} className="control-button">
              Change PDF
            </button>
            <button onClick={() => handlePageChange(-1)} disabled={pageNumber <= 1} className="control-button">
              Previous
            </button>
            <span>
              Page {pageNumber} of {numPages || '--'}
            </span>
            <button onClick={() => handlePageChange(1)} disabled={pageNumber >= (numPages || 0)} className="control-button">
              Next
            </button>
            <button onClick={() => handleZoom(-0.1)} className="control-button">
              Zoom Out
            </button>
            <span>{Math.round(scale * 100)}%</span>
            <button onClick={() => handleZoom(0.1)} className="control-button">
              Zoom In
            </button>
          </div>
 
          <div className="pdf-document-container" onContextMenu={handleContextMenu}>
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="loading">Loading PDF...</div>}
              error={<div className="error">Failed to load PDF!</div>}
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          </div>
          {contextMenu && (
    <div
        className="context-menu"
        style={{
            position: 'absolute',
            top: `${contextMenu.top}px`,
            left: `${contextMenu.left}px`,
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '5px',
            boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.2)',
            zIndex: 9999
        }}
        onClick={(e)=>e.stopPropagation()}
    >
        <form>
            <div className="form-group">
                <label htmlFor="key">Key:</label>
                <input 
                    type="text" 
                    name="key" 
                    defaultValue={contextMenu.text}
                    className="form-input"
                />
            </div>
            <div className="form-group">
                <label htmlFor="value">Value:</label>
                <input 
                    type="text" 
                    name="value" 
                    defaultValue={contextMenu.text}
                    className="form-input"
                />
            </div>
        </form>
        <button onClick={() => setContextMenu(null)}>Close</button>
    </div>
)}

        </>
      )}
    </div>
  );
};
 
export default PdfViewer;