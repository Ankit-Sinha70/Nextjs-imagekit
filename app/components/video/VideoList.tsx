'use client';

import { useState, useEffect } from 'react';
import ConfirmationModal from '../models/ConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button"
import { toast } from 'sonner';

interface Video {
  _id: string;
  url: string;
  title: string;
  createdAt: string;
}

export default function VideoList() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/video');
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      }
    } catch (error) {
      toast.error('Failed to fetch videos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (video: Video) => {
    setVideoToDelete(video);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!videoToDelete) return;

    try {
      const response = await fetch(`/api/videos/${videoToDelete._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Video deleted successfully');
        setVideos(videos.filter(v => v._id !== videoToDelete._id));
      } else {
        throw new Error('Failed to delete video');
      }
    } catch (error) {
      toast.error('Failed to delete video');
    } finally {
      setDeleteModalOpen(false);
      setVideoToDelete(null);
    }
  };

  if (isLoading) {
    return <div>Loading videos...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {videos.map((video) => (
            <motion.div
              key={video._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <video
                controls
                className="w-full h-48 object-cover"
                src={video.url}
              />
              <div className="p-4">
                <h3 className="font-semibold">{video.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(video.createdAt).toLocaleDateString()}
                </p>
                <Button
                  onClick={() => handleDeleteClick(video)}
                  className="mt-2 rounded-lg text-white hover:text-gray-100 text-sm font-medium"
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setVideoToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Video"
        message="Are you sure you want to delete this video? This action cannot be undone."
      />
    </>
  );
} 