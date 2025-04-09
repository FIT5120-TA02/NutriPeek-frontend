'use client';

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function UploadPage() {
  const router = useRouter();
  const { shortcode } = useParams<{ shortcode: string }>();
  const [image, setImage] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      setImage(file);
      toast.success('Image selected!');
    }
  };

  const handleUpload = async () => {
    if (!image) {
      toast.error('Please select an image!');
      return;
    }

    toast.loading('Uploading image...', { id: 'upload' });

    try {
      const formData = new FormData();
      formData.append('file', image);

      const response = await fetch(`https://nutripeek.pro/api/v1/upload/${shortcode}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload error: ${errorText}`);
      }

      const resultResponse = await fetch(`https://nutripeek.pro/api/v1/result/${shortcode}`);
      const resultData = await resultResponse.json();

      if (!resultResponse.ok) {
        throw new Error('Result not ready');
      }

      toast.success('Upload and detection completed!', { id: 'upload' });

      console.log('Detection result:', resultData);

      router.push(`/NutriResult?items=${encodeURIComponent(JSON.stringify(resultData))}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload or detect.', { id: 'upload' });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-green-100 p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Upload Your Food Image</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full p-2 border rounded-md mb-4"
      />

      <button
        onClick={handleUpload}
        className="w-full bg-green-500 text-white py-3 rounded-lg mt-4 hover:bg-green-600 transition"
      >
        Upload & Analyze
      </button>
    </div>
  );
}
