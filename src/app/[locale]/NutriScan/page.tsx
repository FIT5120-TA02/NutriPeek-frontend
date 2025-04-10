'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NutriScanPage() {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      setImage(file);
      toast.success('Image selected successfully!');
    }
  };

  const generateQrCode = async (showToast = false) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/generate_upload_qr`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error during QR code generation: ${errorText}`);
      }

      const data = await response.json();
      setQrCodeUrl(`data:image/png;base64,${data.qrcode_base64}`);
      setUploadUrl(data.upload_url);

      if (showToast) {
        toast.success('QR Code generated successfully!');
      }
    } catch (error) {
      toast.error('Failed to generate QR Code.');
    }
  };

  const handleScan = async () => {
    if (!image && !uploadUrl) {
      toast.error('Please upload an image or wait for QR code generation!');
      return;
    }

    toast.loading('Processing your scan...', { id: 'scan' });

    try {
      if (image) {
        const formData = new FormData();
        formData.append('image', image);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/food-detection/detect`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error during upload: ${errorText}`);
        }

        const data = await response.json();
        toast.success('Scan completed!', { id: 'scan' });

        if (data.detected_items || data.label) {
          const items = encodeURIComponent(JSON.stringify(data.detected_items || data.label));
          router.push(`/NutriResult?items=${items}`);
        }
      } else if (uploadUrl) {
        const shortcode = uploadUrl.split('/').pop();
        const resultResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/result/${shortcode}`);

        if (!resultResponse.ok) {
          throw new Error('Failed to fetch result');
        }

        const resultData = await resultResponse.json();
        toast.success('Scan completed!', { id: 'scan' });

        const items = encodeURIComponent(JSON.stringify(resultData.detected_items || resultData.label));
        router.push(`/NutriResult?items=${items}`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to process the image!', { id: 'scan' });
    }
  };

  useEffect(() => {
    generateQrCode(false); // do not show toast on page load
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">
        Start Your NutriScan
      </h1>

      <p className="text-lg font-semibold text-gray-600 mb-6 text-center">
        Upload a photo of your fridge or scan the QR code to analyze the nutritional contents!
      </p>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full sm:w-80 max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Upload Local Image</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-2 border rounded-md mb-4"
        />
        {image && <p className="text-gray-500 text-sm">File selected: {image.name}</p>}
        <button
          onClick={handleScan}
          className="w-full bg-green-500 text-white py-3 rounded-lg mt-4 hover:bg-green-600 transition"
        >
          Upload & Analyze
        </button>
      </div>

      <div className="hidden md:block bg-white rounded-lg shadow-md p-6 w-full sm:w-80 max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Scan QR Code</h2>
        <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4 mb-4">
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="Generated QR Code" className="w-48 h-48 object-contain" />
          ) : (
            <p className="text-gray-500 text-center">Generating QR Code...</p>
          )}
        </div>
        {uploadUrl && (
          <p className="text-xs text-center text-gray-400 break-words">{uploadUrl}</p>
        )}
      </div>
    </div>
  );
}

