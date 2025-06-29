"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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

    fetch(
      "https://anotationtoolbackend-production.up.railway.app/api/annotation/stats",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setTotalAnnotations(data.totalAnnotations);
        setAnnotationsPerUser(data.annotationsPerUser);

        // Convert date to weekday name (e.g. "Mon", "Tue")
        const formatDate = (dateStr) => {
          const date = new Date(dateStr);
          return date.toLocaleDateString("en-US", { weekday: "short" });
        };

        const formattedAnnotations = data.annotationsByDay.map((item) => ({
          name: formatDate(item._id),
          value: item.count,
        }));

        const formattedErrors = data.errorByDay.map((item) => ({
          name: formatDate(item._id),
          value: item.value,
        }));

        setAnnotationsData(formattedAnnotations);
        setErrorsData(formattedErrors);
      })
      .catch((err) => {
        console.error("Failed to load dashboard data", err);
      });
  }, [token]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 bg-white dark:bg-gray-900 min-h-screen">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <span>{name}</span>
          <div className="bg-gray-500 w-8 h-8 rounded-full" />
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow text-center bg-white dark:bg-gray-800">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {totalAnnotations}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Total Annotations
          </p>
        </div>
        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow text-center bg-white dark:bg-gray-800">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {annotationsPerUser}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Annotations per user
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            Annotations
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={annotationsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: "#fff" }} />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            Errors
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={errorsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: "#fff" }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
