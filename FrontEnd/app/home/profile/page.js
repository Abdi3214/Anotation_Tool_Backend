"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "../../../context/UserContext";

export default function Profile() {
  const router = useRouter();
  const [annotations, setAnnotations] = useState([]);
  const [completedAnnotations, setCompletedAnnotations] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useStore();
  const [pendingReviews, setPendingReviews] = useState(0);

  useEffect(() => {
    const fetchPendingReviews = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(
          "https://anotationtoolbackend-production.up.railway.app/api/annotation/pending",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        setPendingReviews(data.count);
      } catch (err) {
        console.error("Error fetching pending reviews:", err);
        setPendingReviews(0);
      }
    };

    fetchPendingReviews();
  }, []);

  useEffect(() => {
    const CountAnnotations = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(
          "https://anotationtoolbackend-production.up.railway.app/api/annotation/Allannotation",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Fetch failed: ${res.status} - ${errorText}`);
          setAnnotations([]);
          setCompletedAnnotations(0);
          return;
        }

        const data = await res.json();
        setAnnotations(data);
        setCompletedAnnotations(data.length);
      } catch (error) {
        console.error("Error fetching annotations:", error);
        setAnnotations([]);
        setCompletedAnnotations(0);
      } finally {
        setLoading(false);
      }
    };

    CountAnnotations();
  }, []);
  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";
  const progressPercentage =
    completedAnnotations > 0
      ? Math.round(
          (completedAnnotations / (completedAnnotations + pendingReviews)) * 100
        )
      : 0;
  if (!user)
    return (
      <div className="animate-pulse p-6 bg-white dark:bg-[#0a0a0a] max-w-full mx-auto">
  {/* Header */}
  <div className="flex flex-col sm:flex-row items-center sm:space-x-4 mb-6">
    <div className="w-24 h-24 sm:w-16 sm:h-16 rounded-full bg-gray-200 dark:bg-gray-700" />
    <div className="mt-4 sm:mt-0 space-y-2 flex-1">
      <div className="w-3/4 sm:w-40 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="w-4/5 sm:w-48 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="w-1/2 sm:w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  </div>

  {/* Two‑column stats */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
    <div className="flex justify-between">
      <div className="w-3/5 md:w-2/5 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="w-1/6 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
    <div className="flex justify-between">
      <div className="w-2/3 md:w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="w-1/5 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  </div>

  {/* Progress bar */}
  <div className="mb-6">
    <div className="w-1/3 sm:w-1/4 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div className="w-2/3 h-2 bg-gray-300 dark:bg-gray-600 rounded-full" />
    </div>
    <div className="w-1/6 h-3 bg-gray-200 dark:bg-gray-700 rounded mt-2 ml-auto" />
  </div>

  {/* List section */}
  <div className="mb-6">
    <div className="w-1/4 sm:w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
    <ul className="space-y-2">
      <li className="w-3/4 sm:w-2/3 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
      <li className="w-2/3 sm:w-1/2 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
      <li className="w-1/2 sm:w-1/3 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
    </ul>
  </div>

  {/* Buttons */}
  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
    <div className="w-full sm:w-1/3 h-10 bg-gray-200 dark:bg-gray-700 rounded" />
    <div className="w-full sm:w-1/2 h-10 bg-gray-200 dark:bg-gray-700 rounded" />
  </div>
</div>

    );

  return (
    <div className="p-6 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 rounded-xl shadow-md max-w-6xl mx-auto">
  {/* Header Section */}
  <div className="flex flex-col sm:flex-row items-center sm:space-x-4 mb-6">
    <div className="w-24 h-24 sm:w-16 sm:h-16 rounded-full bg-gray-200 dark:bg-gray-700" />
    <div className="mt-4 sm:mt-0 text-center sm:text-left">
      <h2 className="text-xl font-bold">{user?.name || "Anonymous"}</h2>
      <p className="text-gray-600 dark:text-gray-400">{user?.email || "Not Available"}</p>
      <p className="text-sm text-gray-500 dark:text-gray-500">Joined: {formattedDate}</p>
    </div>
  </div>

  {/* Stats Section */}
  <div className="space-y-6 text-sm sm:text-base">
    <div className="flex justify-between">
      <p>Completed Annotations</p>
      <span className="font-medium">{completedAnnotations}</span>
    </div>
    <div className="flex justify-between">
      <p>Pending Reviews</p>
      <span className="font-medium">{pendingReviews}</span>
    </div>

    {/* Progress Bar */}
    <div>
      <p className="mb-1 font-medium">Progress</p>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-2 bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <p className="text-sm text-right text-gray-500 dark:text-gray-400 mt-1">
        {progressPercentage}%
      </p>
    </div>

    {/* Recent Activity */}
    <div>
      <h3 className="font-semibold mb-2">Recent Activity</h3>
      <ul className="space-y-1 text-sm">
        <li>
          <strong>April 16:</strong> Annotated Text ID 2374
        </li>
        <li>
          <strong>April 15:</strong> Commented on ID 2369
        </li>
        <li>
          <strong>April 13:</strong> Reviewed 5 texts
        </li>
      </ul>
    </div>

    {/* Action Buttons */}
    <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 mt-6">
      <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">
        Edit Profile
      </button>
      <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">
        Change Password
      </button>
    </div>
  </div>
</div>

  );
}
