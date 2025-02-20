import React, { useState } from 'react';
//import { PDFViewer } from '@react-pdf/renderer';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { Document as ReactPDFDocument, Page as ReactPDFPage } from 'react-pdf';
import PDFViewer from './PdfViewer1';
import PDFViewer1 from './PdfViewer';
import PdfViewer2 from './PdfViewer2';
function App() {
  // const [pdfUrl, setPdfUrl] = useState<string | null>(null); // For uploaded PDF
  // const [count, setCount] = useState(0); // For dynamically generated PDF content

  // // Handle file upload for the existing PDF
  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     const fileUrl = URL.createObjectURL(file);
  //     setPdfUrl(fileUrl);
  //   }
  // };

  // // Increment count (for generating dynamic content in PDF)
  // const incrementCount = () => setCount(count + 1);

  // // Component for dynamically generated PDF
  // const MyDocument = ({ count }: { count: number }) => (
  //   <Document>
  //     <Page size="A4">
  //       <View>
  //         <Text>This is a dynamically generated PDF document.</Text>
  //         <Text>Current count: {count}</Text>
  //       </View>
  //     </Page>
  //   </Document>
  //);

  return (
    <div>
      {/* <input type="file" accept="application/pdf" onChange={handleFileChange} />

      <button onClick={incrementCount}>Increment Count</button>

      <div style={{ marginTop: 20 }}>
        {pdfUrl && (
          <div>
            <h3>Uploaded PDF:</h3>
            <ReactPDFDocument file={pdfUrl}>
              <ReactPDFPage pageNumber={1} />
            </ReactPDFDocument>
          </div>
        )}

        <h3>Generated PDF (based on count):</h3>
        <PDFViewer style={{ width: '100%', height: '500px' }}>
          <MyDocument count={count} />
        </PDFViewer>
      </div> */}
      {/* <PDFViewer maxFileSize={10 * 1024 * 1024}/> */}
      {/* <PDFViewer1 maxFileSize={10 * 1024 * 1024}/> */}
      <PdfViewer2 />
    </div>
  );
}

export default App;
