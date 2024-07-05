import React from "react";
import FileUpload from "./components/FileUpload";

const UploadPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-y-4">
      <h1 className="text-xl font-semibold">Upload your Files</h1>
      <FileUpload
        fileType="application/pdf"
        endpoint="upload-enpara"
        label="Upload Enpara"
      />
      <FileUpload
        fileType=".xls, .xlsx"
        endpoint="upload-yapi-kredi-debit"
        label="Upload Yapı Kredi Debit"
      />
      <FileUpload
        fileType=".xls, .xlsx"
        endpoint="upload-yapi-kredi-credit"
        label="Upload Yapı Kredi Credit"
      />
      <FileUpload
        fileType=".xls, .xlsx"
        endpoint="upload-yapi-kredi-holdings"
        label="Upload Yapı Kredi Holdings"
      />
      <FileUpload
        fileType=".xls, .xlsx"
        endpoint="upload-midas"
        label="Upload Midas"
      />
    </div>
  );
};

export default UploadPage;
