'use client';

import Link from 'next/link';
import { Baby, CameraRotate, UsersThree } from 'phosphor-react';

export default function GuidePage() {
  return (
    <div className="min-h-screen pt-24 flex flex-col items-center p-8">
      <div className="flex flex-col items-center space-y-8 mb-12">
        <div className="p-6 bg-white rounded-lg shadow-md text-center w-80">
          <Baby size={48} className="mx-auto mb-4 text-green-500" />
          <h2 className="text-xl font-semibold mb-2">Create Child Profiles</h2>
          <p className="text-gray-600 mb-4">Enter your child's age, allergies, and preferences.</p>
          <Link href="/ChildInfo" className="text-green-600 hover:underline text-sm">
            Go to Child Info →
          </Link>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md text-center w-80">
          <CameraRotate size={48} className="mx-auto mb-4 text-green-500" />
          <h2 className="text-xl font-semibold mb-2">Scan Your Fridge</h2>
          <p className="text-gray-600 mb-4">Upload or scan images to analyze nutritional content.</p>
          <Link href="/NutriScan" className="text-green-600 hover:underline text-sm">
            Go to NutriScan →
          </Link>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md text-center w-80">
          <UsersThree size={48} className="mx-auto mb-4 text-green-500" />
          <h2 className="text-xl font-semibold mb-2">Manage Profiles</h2>
          <p className="text-gray-600 mb-4">View and manage all nutritional data easily.</p>
          <Link href="/profile" className="text-green-600 hover:underline text-sm">
            Go to Profile →
          </Link>
        </div>
      </div>

      <Link href="/NutriScan">
        <button className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition">
          Start Using NutriPeek
        </button>
      </Link>
    </div>
  );
}

