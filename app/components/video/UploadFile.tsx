"use client";
import { upload } from "@imagekit/next";
import { useState } from "react";
import { toast } from "sonner";

interface uploadFileProps {
  onSuccess: (res: { url: string; name: string }) => void;
  onProgress?: (progress: number) => void;
  filetype?: "image" | "video";
}

const UploadFile = ({ onSuccess, onProgress, filetype }: uploadFileProps) => {
  const [uploading, setUploading] = useState(false);

  const validateFile = (file: File) => {
    if (filetype === "video") {
      if (!file.type.startsWith("video/")) {
        toast.error(`Please upload a valid video file.`);
        return false;
      }
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error("The file size must be less than 100 MB.");
      return false;
    }
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file || !validateFile(file)) {
      e.target.value = "";
      return;
    }

    setUploading(true);
    const id = toast.loading("Uploading file...");

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
        name: uploadResult.name,
      });
      toast.success("File uploaded successfully!");
    } catch (error: unknown) {
      let errorMessage = "Upload failed";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Upload failed", errorMessage, error);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      toast.dismiss(id);
      e.target.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        accept={filetype === "video" ? "video/*" : "image/*"}
        onChange={handleFileChange}
        disabled={uploading}
      />
    </>
  );
};

export default UploadFile;
