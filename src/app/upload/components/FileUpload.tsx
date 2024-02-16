"use client";
import useToast from "@component/components/Toast";
import { useState } from "react";

const FileUpload: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [xlsFile, setXlsFile] = useState<File | null>(null);
  const showToast = useToast();

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleXlsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setXlsFile(e.target.files[0]);
    }
  };

  const handleUpload = async (path: string, file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        if (e.target && e.target.result) {
          const base64String = e.target.result.toString().split(",")[1];
          try {
            const response = await fetch(`/api/${path}`, {
              method: "POST",
              body: base64String,
            });

            if (response.ok) {
              showToast("File uploaded Successfully", "success");
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
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-row gap-x-4">
        <input
          type="file"
          accept="application/pdf"
          onChange={handlePdfFileChange}
          className="file-input"
        />
        <button
          className="btn btn-base"
          onClick={() => handleUpload("upload-enpara", pdfFile)}
        >
          Upload Enpara
        </button>
      </div>

      <div className="flex flex-row gap-x-4">
        <input
          type="file"
          accept=".xls, .xlsx"
          onChange={handleXlsFileChange}
          className="file-input"
        />
        <button
          className="btn btn-base"
          onClick={() => handleUpload("upload-yapi-kredi", xlsFile)}
        >
          Upload Yapı Kredi
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
