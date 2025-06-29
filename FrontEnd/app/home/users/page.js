"use client";
import { Pencil, UserRoundPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from "next/navigation"; // ✅ Make sure this is imported
import { Trash } from 'phosphor-react';
import { useEffect, useState } from "react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
  
    if (!token || !userStr) {
      router.push("/login");
      return;
    }
  
    const user = JSON.parse(userStr);
    if (user.userType !== "Admin") {
      router.push("/"); // Redirect if not Admin
      return;
    }
  
    fetchUsers();
  }, []);
  
  

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://anotationtoolbackend-production.up.railway.app/api/users/usersAll", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }
      const data = await res.json();
      const mapped = data.map((user) => ({
        id: user.Annotator_ID,
        _id: user._id,
        name: user.name,
        email: user.email,
        password: user.password,
        type: user.userType,
      }));
      setUsers(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('totalUsers', users.length);
    }
  }, [users]);
  const handleDelete = async (id) => {
    try{
      const res = await fetch(`https://anotationtoolbackend-production.up.railway.app/api/users/deleteUser/${id}`, {
        method: "DELETE"
      })
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Delete failed: ${res.status} - ${errorText}`);
        alert("Failed to delete annotations.");
        return;
      }
      fetchUsers();
    }catch(err){
      console.error("Unexpected error:", err);
      alert("Something went wrong.");
    }
  }

  const TableSkeleton = ({ rows = 6 }) => {
    return (
      <table className="table w-full">
        <thead>
          <tr>
            <th>
              <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
            </th>
            <th>
              <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
            </th>
            <th>
              <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
            </th>
            <th>
              <div className="h-4 bg-gray-300 rounded w-1/3 animate-pulse"></div>
            </th>
            <th>
              <div className="h-4 bg-gray-300 rounded w-1/3 animate-pulse"></div>
            </th>
            <th>
              <div className="h-4 bg-gray-300 rounded w-1/3 animate-pulse"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIdx) => (
            <tr key={rowIdx} className="animate-pulse">
              <td>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </td>
              <td>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </td>
              <td>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </td>
              <td>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </td>
              <td>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </td>
              <td>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Users</h1>
      <div className="overflow-x-auto border-base-content/5 bg-base-10 ">
      {loading ? (
        <TableSkeleton rows={10} />
      ) : (
      <table className="table w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Type</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover">
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.type}</td>
              <td><Link href={{ pathname: './users/updateUser', query: {id: user._id, name: user.name, email: user.email, password: user.password, type: user.type}}}><Pencil className='cursor-pointer' /></Link></td>
              <td><Trash className='cursor-pointer' onClick={() => {
                handleDelete(user._id)
              }} size={24} color="#ff0000" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
    </div>
    <Link href="./users/addUser" className='btn bg-rose-700 hover:bg-rose-500  text-white mt-4 rounded'><UserRoundPlus /> Add User</Link>
    </div>
  );
}
