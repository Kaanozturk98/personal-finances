// pages/upload.tsx
import React from "react";
import FileUpload from "./components/FileUpload";

const UploadPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-y-4">
      <h1 className="text-xl font-semibold">Upload your Files</h1>
      <FileUpload />
    </div>
  );
};

export default UploadPage;
