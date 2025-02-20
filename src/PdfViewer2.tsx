import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Item, Menu, useContextMenu } from 'react-contexify';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-contexify/dist/ReactContexify.css';
import './PDFViewer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
 
const MENU_ID = 'pdf-context-menu';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
 
const PdfViewer: React.FC = () => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [selectedText, setSelectedText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);
  const [isEditableKey,setIsEditableKey] = useState<boolean>(false);
  const [isEditableValue,setIsEditableValue] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfContainerRef = useRef<HTMLInputElement>(null);
  const { show } = useContextMenu({
    id: MENU_ID,
  });
 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(name,value);
  };

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
    setSelectedText('');
  };

  const handleDoubleClick = (event: React.MouseEvent) => {
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
      setSelectedText('');
    } else {
      setError('Please drop a PDF file');
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };
 
  // New: Handle Text Selection and Positioning of Popup
  const handleTextSelection = () => {
    const selection = window.getSelection();
    
    if (selection && selection.toString().trim()) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectedText(selection.toString().trim());

      setPopupPosition({
        top: rect.top + window.scrollY + rect.height,
        left: rect.left + window.scrollX,
      });
    }
  };
 
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      show({ event });
    }
  };
 
  const handlePageChange = (delta: number) => {
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
 
  const copySelectedText = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText)
        .then(() => {
          alert('Text copied to clipboard!');
        })
        .catch((err) => {
          console.error('Failed to copy text:', err);
          alert('Failed to copy text. Please try again.');
        });
    }
  };
  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, []);
 
  return (
    <div className="pdf-viewer-container" ref={containerRef} onDoubleClick={handleDoubleClick}>
      {/* File Upload Area */}
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
          {/* Controls */}
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
 
          {/* PDF Document */}
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
 
          {/* Context Box for Selected Text */}
          {selectedText && popupPosition && (
            <div
              className="selected-text-container"
              style={{
                position: 'absolute',
                top: `${popupPosition.top}px`,
                left: `${popupPosition.left}px`,
                backgroundColor: 'white',
                padding: '10px',
                borderRadius: '5px',
                boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.2)',
                zIndex: 9999
              }}
            >
              <form>
            {isEditableKey ? 
            <div className="form-group">
              <label htmlFor="key">Key : </label>
              <input 
                type="text" 
                name="key" 
                defaultValue={selectedText}
                onChange={handleInputChange}
                onClick={()=>setIsEditableKey(!isEditableKey)}
                className="form-input"
              />
            </div>
            :
            <div className="form-group">
              <label htmlFor="key">Key : </label>
              <input 
                type="text" 
                name="key" 
                value={selectedText}
                onChange={handleInputChange}
                onClick={()=>setIsEditableKey(!isEditableKey)}
                className="form-input"
              />
            </div>
            }
            {isEditableValue ? 
              <div className="form-group">
              <label htmlFor="value">Value : </label>
              <input 
                type="text" 
                name="value" 
                value={selectedText}
                onChange={handleInputChange}
                onClick={()=>setIsEditableValue(!isEditableValue)}
                className="form-input"
              />
            </div> :
            <div className="form-group">
            <label htmlFor="value">Value : </label>
            <input 
              type="text" 
              name="value" 
              defaultValue={selectedText}
              onChange={handleInputChange}
              onClick={()=>setIsEditableValue(!isEditableValue)}
              className="form-input"
            />
          </div>}
          </form>
              <div className="menu-item" onClick={copySelectedText}>
                Copy Selected Text
              </div>
              <div className="menu-item" onClick={() => alert(selectedText)}>
                Show Selected Text
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
 
export default PdfViewer;