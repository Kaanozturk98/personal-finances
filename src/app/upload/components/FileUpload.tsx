"use client";
import useToast from "@component/components/Toast";
import { useState } from "react";

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const showToast = useToast();

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
          showToast("PDF uploaded Successfully", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="file-input"
      />
      <button className="btn btn-base" onClick={handleUpload}>
        Upload
      </button>
    </div>
  );
};

export default FileUpload;
