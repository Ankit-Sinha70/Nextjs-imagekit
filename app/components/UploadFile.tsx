"use client";
import {
  upload,
} from "@imagekit/next";
import { useState } from "react";
interface uploadFileProps {
  onSuccess: (res: any) => void;
  onProgress?: (progress: number) => void;
  filetype?: "image" | "video";
}

const UploadFile = ({ onSuccess, onProgress, filetype }: uploadFileProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File) => {
    if (filetype === "video") {
      if (!file.type.startsWith("video/")) {
        setError("Please upload a valid video file");
      }
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("The file size must be less then 100 MB");
    }
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file || !validateFile(file)) return;
    setUploading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/imagekit-auth");
      const authRes = await response.json();

      const res = upload({
        file,
        fileName: file.name,
        publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
        signature: authRes.signature,
        expire: authRes.expire,
        token: authRes.token,
        onProgress: (event: any) => {
          if (event.lengthComputable && onProgress) {
            const percent = (event.loaded / event.total) * 100;
            onProgress(Math.round(percent));
          }
        },
      });
      onSuccess(res);
    } catch (error) {
      console.error("Uplaod failed", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        type="file"
        accept={filetype === "video" ? "video/*" : "image/*"}
        onChange={handleFileChange}
      />
      {uploading && <span>Loading...</span>}
    </>
  );
};

export default UploadFile;
