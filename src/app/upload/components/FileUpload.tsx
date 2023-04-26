"use client";
import { useState } from "react";

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        if (e.target && e.target.result) {
          const base64String = e.target.result.toString().split(",")[1];
          await fetch("/api/upload", {
            method: "POST",
            body: base64String,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button className="btn" onClick={handleUpload}>
        Upload
      </button>
    </div>
  );
};

export default FileUpload;
