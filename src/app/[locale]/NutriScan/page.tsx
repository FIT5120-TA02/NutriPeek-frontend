'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; 
import Link from "next/link";
import { motion } from "framer-motion";

export default function NutriScanPage() {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  // Handle file input change (image upload)
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setImage(file);
      toast.success('Image selected successfully!');
    }
  };

  // Handle QR code scanning (pseudo logic for future development)
  const handleQrScan = (scannedCode: string) => {
    setQrCode(scannedCode);
    toast.success('QR Code scanned successfully!');
  };

  // Handle scan process: send image to backend and get predictions
  const handleScan = async () => {
    if (!image && !qrCode) {
      toast.error('Please upload an image or scan a QR code first!');
      return;
    }

    toast.loading('Processing your scan...', { id: 'scan' });

    try {
      const formData = new FormData();
      if (image) {
        formData.append('file', image);
      }

      const response = await fetch('http://127.0.0.1:8000/food/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Server error during prediction');
      }

      const data = await response.json();
      toast.success('Scan completed!', { id: 'scan' });

      // Navigate to result page with predictions passed as query
      router.push(`/NutriResult?predictions=${data.predictions.join(',')}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to process the image!', { id: 'scan' });
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-green-100 p-6">
      <motion.h1 
        className="text-4xl font-bold mb-6 text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Start Your NutriScan
      </motion.h1>

      <p className="text-lg font-semibold text-gray-600 mb-6 text-center">
        Upload a photo of your fridge or scan the QR code to analyze the nutritional contents!
      </p>

      {/* Upload Local Image Section */}
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

      {/* Scan QR Code Section */}
      <div className="bg-white rounded-lg shadow-md p-6 w-full sm:w-80 max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Scan QR Code</h2>
        <div 
          className="bg-gray-200 w-full h-48 flex justify-center items-center rounded-lg border-2 border-gray-300 mb-4"
          onClick={() => handleQrScan('sample_qr_code')}
        >
          <p className="text-gray-500">Click to scan QR Code</p>
        </div>
        {qrCode && <p className="text-gray-500 text-sm">Scanned QR Code: {qrCode}</p>}
        <button
          onClick={handleScan}
          className="w-full bg-blue-500 text-white py-3 rounded-lg mt-4 hover:bg-blue-600 transition"
        >
          Scan & Analyze
        </button>
      </div>

      {/* Link back to Start */}
      <motion.div 
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Link href={`/start`}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 bg-gradient-to-r from-green-400 to-green-600 text-white py-3 px-6 rounded-full shadow-lg hover:shadow-2xl text-lg font-semibold transition-all duration-300 ease-in-out"
          >
            Start Now
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
