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
    <div className='container flex justify-center mx-auto my-8'>
      <div className='w-2xl flex justify-center p-4 border border-gray-200 shadow-sm rounded-lg'>
        <div className='h-full w-full pt-2'>
          <form onSubmit={handleSubmit} className='flex flex-col mx-12 space-y-6 justify-center'>
            <Image className='w-12 h-12 rounded-3xl' src={logo} alt="Logo" />
            <h1 className='text-3xl font-medium'>Sign in to your account</h1>
            <label>Full Name:</label>
            <input
              onChange={(e) => setName(e.target.value)}
              className='border focus:outline-none border-gray-200 p-2 rounded-lg'
              type="text"
              required
            />
            <label>Email Address</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              className='border focus:outline-none border-gray-200 p-2 rounded-lg'
              type="text"
              required
            />
            <label>Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              className='border focus:outline-none border-gray-300 p-2 rounded-lg'
              type="password"
              required
            />
            <div className='flex justify-between'>
              <div className='space-x-3'>
                <input type="checkbox" />
                <span>Remember me</span>
              </div>
              <a href="#" className='text-blue-700 hover:text-blue-500 hover:underline'>Forgot password?</a>
            </div>
            <button type="submit" className='bg-blue-700 p-2 text-center rounded-lg text-white hover:bg-blue-600 font-bold text-lg'>
              Sign in
            </button>
            <a href="/login" className='text-center text-blue-700 hover:text-blue-500 hover:underline'>Already have an account</a>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
