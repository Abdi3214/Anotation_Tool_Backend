'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import logo from '../../public/logo.webp';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submit
    const data = {
      name,
      email,
      password
    };
    try {
      const res = await fetch("https://anotationtoolbackend-production.up.railway.app/api/users/addUsers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const text = await res.text();
        if (res.status === 409) {
          alert("This user already exists. Please try a different one.");
        } else {
          console.error(`Save failed: ${res.status} ${res.statusText} - ${text}`);
          alert("Failed to save user.");
        }
        return;
      }
      // 2️⃣ Login right after registering
      const loginRes = await fetch(
        'https://anotationtoolbackend-production.up.railway.app/api/users/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        }
      );

      if (!loginRes.ok) {
        const err = await loginRes.json();
        throw new Error(err.error || 'Login after register failed');
      }

      const { token } = await loginRes.json();

      
      localStorage.setItem('token', token);
      const result = await res.json();
      router.push(`/home/dashboard?name=${encodeURIComponent(name)}`);
      console.log("Saved user:", result);

    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-[#0a0a0a] px-4">
  <div className="w-full max-w-md p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md">
    <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
      <Image className="w-12 h-12 rounded-3xl mx-auto" src={logo} alt="Logo" />

      <h1 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
        Sign in to your account
      </h1>

      <div>
        <label className="text-sm text-gray-600 dark:text-gray-300">Full Name</label>
        <input
          type="text"
          required
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600 dark:text-gray-300">Email Address</label>
        <input
          type="email"
          required
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600 dark:text-gray-300">Password</label>
        <input
          type="password"
          required
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
        <label className="inline-flex items-center space-x-2">
          <input type="checkbox" className="form-checkbox" />
          <span>Remember me</span>
        </label>
        <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition"
      >
        Sign in
      </button>

      <a
        href="/login"
        className="text-center text-sm text-blue-700 dark:text-blue-400 hover:underline"
      >
        Already have an account?
      </a>
    </form>
  </div>
</div>

  );
};

export default SignUp;
