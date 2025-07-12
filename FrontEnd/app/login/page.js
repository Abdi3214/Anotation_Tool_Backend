"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "../../context/UserContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { setUser } = useStore(); 
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'https://anotationtoolbackend-production.up.railway.app/api/users/login',
        
        form
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user)
      if (res.data.user.userType === "Admin") {
        router.push("/home/dashboard");
      } else {
        router.push("/home/annotation");
      }

    
    } catch (err) {
      setMessage(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-[#0a0a0a] px-4">
  <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-sm">
    <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">Login</h2>
    
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="email"
        type="email"
        placeholder="Email"
        onChange={handleChange}
        required
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
        required
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
      >
        Login
      </button>
    </form>

    {message && (
      <p className="text-center text-red-500 dark:text-red-400 mt-4">{message}</p>
    )}
  </div>
</div>

  );
}
