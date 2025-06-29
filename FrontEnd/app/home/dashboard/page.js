'use client';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export default function Dashboard({ name }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [totalAnnotations, setTotalAnnotations] = useState(0);
  const [annotationsPerUser, setAnnotationsPerUser] = useState(0);
  const [annotationsData, setAnnotationsData] = useState([]);
  const [errorsData, setErrorsData] = useState([]);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      router.push("/login");
    } else {
      setToken(t);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    fetch("https://anotationtoolbackend-production.up.railway.app/api/annotation/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setTotalAnnotations(data.totalAnnotations);
        setAnnotationsPerUser(data.annotationsPerUser);

        // Convert date to weekday name (e.g. "Mon", "Tue")
        const formatDate = (dateStr) => {
          const date = new Date(dateStr);
          return date.toLocaleDateString("en-US", { weekday: "short" });
        };

        const formattedAnnotations = data.annotationsByDay.map(item => ({
          name: formatDate(item._id),
          value: item.count,
        }));

        const formattedErrors = data.errorByDay.map(item => ({
          name: formatDate(item._id),
          value: item.value,
        }));

        setAnnotationsData(formattedAnnotations);
        setErrorsData(formattedErrors);
      })
      .catch(err => {
        console.error("Failed to load dashboard data", err);
      });
  }, [token]);

  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span>{name}</span>
          <div className="bg-gray-500 w-8 h-8 rounded-full" />
        </div>
      </header>

      <section className="flex space-x-16">
        <div className="flex-1 p-6 rounded-lg border border-gray-200 shadow text-center">
          <p className="text-3xl font-bold">{totalAnnotations}</p>
          <p className="text-sm">Total Annotations</p>
        </div>
        <div className="flex-1 p-6 rounded-lg border border-gray-200 shadow text-center">
          <p className="text-3xl font-bold">{annotationsPerUser}</p>
          <p className="text-sm">Annotations per user</p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg mb-2">Annotations</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={annotationsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#274967" />
              <XAxis dataKey="name" stroke="#000" />
              <YAxis stroke="#000" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h2 className="text-lg mb-2">Errors</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={errorsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#274967" />
              <XAxis dataKey="name" stroke="#000" />
              <YAxis stroke="#000" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* <div className="flex justify-end">
        <button className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded text-white">
          Submit
        </button>
      </div> */}
    </div>
  );
}
