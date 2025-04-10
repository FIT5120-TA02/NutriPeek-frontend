'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { nutripeekApi } from '../../../api/nutripeekApi';

export default function QRUploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const shortcode = searchParams.get('code');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Check if we have a valid shortcode
  useEffect(() => {
    if (!shortcode) {
      toast.error('Invalid QR code. Please scan again.');
    }
  }, [shortcode]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      setImage(file);
      toast.success('Image selected successfully!');
    }
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleBrowseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (!image || !shortcode) {
      toast.error('Please select an image first!');
      return;
    }

    setUploading(true);
    const toastId = 'upload';
    toast.loading('Uploading image...', { id: toastId });

    try {
      await nutripeekApi.uploadImage(shortcode, image);
      toast.success('Upload successful!', { id: toastId });
      setUploadSuccess(true);
      
      // Show success message for a short time before closing
      setTimeout(() => {
        window.close(); // Try to close the window/tab
      }, 3000);
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload image. Please try again.', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  if (!shortcode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-green-100 p-6">
        <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-red-600 text-center">Invalid QR Code</h1>
          <p className="text-gray-600 mb-6 text-center">
            This QR code is invalid or has expired. Please scan a new QR code.
          </p>
        </div>
      </div>
    );
  }

  if (uploadSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-green-100 p-6">
        <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-green-600">Upload Successful!</h1>
            <p className="text-gray-600 mb-4 text-center">
              Your image has been uploaded successfully and is being processed.
            </p>
            <p className="text-gray-500 text-sm text-center">
              You can close this window and return to your computer to see the results.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-green-100 p-6">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">NutriPeek</h1>
        <h2 className="text-xl font-semibold mb-4 text-center">Upload Food Photo</h2>
        
        <p className="text-gray-600 mb-6 text-center">
          Take a photo of your food or upload an existing image to analyze its nutritional content.
        </p>
        
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
        
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
        
        {image ? (
          <div className="mb-6">
            <div className="relative mb-4">
              <img 
                src={URL.createObjectURL(image)} 
                alt="Preview" 
                className="w-full h-48 object-contain rounded-lg border"
              />
              <button 
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                disabled={uploading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <button
              onClick={handleUpload}
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload & Process'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleCameraCapture}
              className="w-full bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 transition flex items-center justify-center gap-2"
              disabled={uploading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Take Photo
            </button>
            
            <button
              onClick={handleBrowseFiles}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
              disabled={uploading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Browse Gallery
            </button>
          </div>
        )}
      </div>
    </div>
  );
}