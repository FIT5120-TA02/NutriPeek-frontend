'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function UploadPage() {
  const router = useRouter();
  const { shortcode } = useParams<{ shortcode: string }>();
  const [image, setImage] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      toast.loading('Uploading...', { id: 'upload' });

      const response = await fetch(`http://52.64.79.147:8000/api/v1/upload/${shortcode}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      toast.success('Upload successful!', { id: 'upload' });

      router.push(`/locale/NutriResult/${shortcode}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload', { id: 'upload' });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-green-50 p-4">
      <h1 className="text-2xl font-bold mb-6">Upload Your Food Image</h1>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="p-2 border rounded-md"
      />
    </div>
  );
}
