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

    const uploadResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/upload/${shortcode}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error('Upload failed');
    }

    toast.success('Upload successful!', { id: 'upload' });

    // Retry to fetch detection result
    let retries = 10;
    let resultData = null;
    while (retries > 0) {
      const resultResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/result/${shortcode}`
      );
      if (resultResponse.ok) {
        resultData = await resultResponse.json();
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      retries--;
    }

    if (!resultData) {
      throw new Error('Failed to fetch result after retries');
    }

    const items = encodeURIComponent(
      JSON.stringify(resultData.detected_items || resultData.label)
    );
    router.push(`/locale/NutriResult?items=${items}`);
      
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload or fetch result', { id: 'upload' });
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
