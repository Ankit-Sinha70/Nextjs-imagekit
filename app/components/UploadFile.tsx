"use client";
import {
  upload,
} from "@imagekit/next";
import { useState } from "react";
interface uploadFileProps {
  onSuccess: (res: { url: string; name: string }) => void;
  onProgress?: (progress: number) => void;
  filetype?: "image" | "video";
}

interface FileError {
  message: string;
  // Add other error properties as needed
}

const UploadFile = ({ onSuccess, onProgress, filetype }: uploadFileProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<FileError | null>(null);

  const validateFile = (file: File) => {
    if (filetype === "video") {
      if (!file.type.startsWith("video/")) {
        setError({ message: `Please upload a valid video file ${error} `});
      }
    }
    if (file.size > 100 * 1024 * 1024) {
      setError({ message: "The file size must be less then 100 MB" });
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
        onProgress: (event) => {
          if (event.lengthComputable && onProgress) {
            const percent = (event.loaded / event.total) * 100;
            onProgress(Math.round(percent));
          }
        },
      });
      const uploadResult = await res;
      if (!uploadResult.url || !uploadResult.name) {
        throw new Error("Upload failed: Missing URL or name in response");
      }
      onSuccess({
        url: uploadResult.url,
        name: uploadResult.name
      });
    } catch (error) {
      console.error("Upload failed", error);
      setError({ message: error instanceof Error ? error.message : "Upload failed" });
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
