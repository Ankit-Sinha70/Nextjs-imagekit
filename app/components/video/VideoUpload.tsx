"use client";

import { useState } from "react";
import { toast } from "sonner";
import Loader from "../ui/Loader";

export default function VideoUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is a video
    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a video file");
      return;
    }

    // Check file size (e.g., 100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size should be less than 100MB");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Video uploaded successfully");
        // Refresh video list
        window.location.reload();
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload video"
      );
    } finally {
      setIsUploading(false);
      // Clear the file input
      e.target.value = "";
    }
  };

  return (
    <div className="mb-8">
      <label className="block">
        <span className="sr-only">Choose video</span>
        <input
          type="file"
          accept="video/*"
          onChange={handleUpload}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </label>
      {isUploading && (
        <div className="mt-2 text-sm text-gray-500">
          {" "}
          <Loader message="Uploading Video..." />
        </div>
      )}
    </div>
  );
}
