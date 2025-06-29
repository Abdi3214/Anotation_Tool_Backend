'use client'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
function AddUser() {
  const [name, setName] = useState([])
  const [email, setEmail] = useState([])
  const [password, setPassword] = useState([])
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) {
      router.push("/login");
    }
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name,
      email,
      password,
    }
    const res = await fetch(`http://localhost:5000/api/users/addUsers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
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
    const result = await res.json();
    console.log("Saved user:", result);
    router.push('/home/users')
  }
  return (
    <div className="max-w-2xl mx-auto  mt-12">
      <form className="flex flex-col space-y-3 border border-gray-200 shadow rounded p-4" onSubmit={handleSubmit}>
        <label>Name:</label>
        <input onChange={(e) => setName(e.target.value)}
              className='border focus:outline-none border-gray-200 p-2 rounded-lg'
              type="text"
              required/>
        <label>Email:</label>
        <input onChange={(e) => setEmail(e.target.value)}
              className='border focus:outline-none border-gray-200 p-2 rounded-lg'
              type="text"
              required />
        <label>password:</label>
        <input onChange={(e) => setPassword(e.target.value)}
              className='border focus:outline-none border-gray-200 p-2 rounded-lg'
              type="text"
              required/>
        <button type="submit" className="btn btn-primary w-24">Submit</button>
      </form>
    </div>
  )
}

export default AddUser