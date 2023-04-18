// pages/upload.tsx
import React from 'react';
import FileUpload from './components/FileUpload';

const UploadPage: React.FC = () => {
  return (
    <div>
      <h1>Upload your PDF</h1>
      <FileUpload />
    </div>
  );
};

export default UploadPage;
