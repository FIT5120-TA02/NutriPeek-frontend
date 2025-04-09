'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';


export default function PasswordPage() {
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'nutri123') {
      localStorage.setItem('authenticated', 'true');
      toast.success('Password correct!');
      router.push('/Welcome'); 
    } else {
      toast.error('Incorrect password!');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-green-50">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-80">
        <h1 className="text-2xl font-bold mb-6 text-center">Enter Password</h1>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 border rounded-md"
        />
        <button
          type="submit"
          className="bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
