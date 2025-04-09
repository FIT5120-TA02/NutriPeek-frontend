'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PasswordGatePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password === "nutri123") { 
      router.push("/ChildInfo"); 
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-100 to-blue-100 p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Enter Password</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
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
