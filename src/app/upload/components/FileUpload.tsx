"use client";
import useToast from "@component/components/Toast";
import { useState } from "react";

interface FileUploadProps {
  fileType: string; // e.g., "application/pdf" or ".xls, .xlsx"
  endpoint: string; // e.g., "upload-enpara" or "upload-yapi-kredi"
  label: string; // e.g., "Upload Enpara" or "Upload Yapı Kredi"
}

const FileUpload: React.FC<FileUploadProps> = ({
  fileType,
  endpoint,
  label,
}) => {
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
          try {
            const response = await fetch(`/api/${endpoint}`, {
              method: "POST",
              body: base64String,
            });

            if (response.ok) {
              showToast("File uploaded successfully", "success");
            } else {
              showToast(`Error uploading file: ${response.status}`, "error");
            }
          } catch (error) {
            showToast("Error uploading file", "error");
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-row gap-x-4">
      <input
        type="file"
        accept={fileType}
        onChange={handleFileChange}
        className="file-input"
      />
      <button className="btn btn-base" onClick={handleUpload}>
        {label}
      </button>
    </div>
  );
};

export default FileUpload;
