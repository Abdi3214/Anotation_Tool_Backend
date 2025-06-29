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
      <div className="dark:bg-[#0a0a0a] p-6 animate-pulse">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gray-300"></div>
          <div className="space-y-2">
            <div className="w-40 h-5 bg-gray-300 rounded"></div>
            <div className="w-48 h-4 bg-gray-300 rounded"></div>
            <div className="w-32 h-3 bg-gray-300 rounded"></div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between">
            <div className="w-40 h-4 bg-gray-300 rounded"></div>
            <div className="w-10 h-4 bg-gray-300 rounded"></div>
          </div>
          <div className="flex justify-between">
            <div className="w-40 h-4 bg-gray-300 rounded"></div>
            <div className="w-6 h-4 bg-gray-300 rounded"></div>
          </div>

          <div>
            <div className="w-24 h-4 bg-gray-300 rounded mb-2"></div>
            <div className="w-full h-2 bg-gray-300 rounded-full">
              <div className="w-2/3 h-2 bg-gray-400 rounded-full"></div>
            </div>
            <div className="w-10 h-3 bg-gray-300 rounded mt-2 ml-auto"></div>
          </div>

          <div>
            <div className="w-32 h-4 bg-gray-300 rounded mb-2"></div>
            <ul className="space-y-2">
              <li className="w-3/4 h-3 bg-gray-300 rounded"></li>
              <li className="w-2/3 h-3 bg-gray-300 rounded"></li>
              <li className="w-1/2 h-3 bg-gray-300 rounded"></li>
            </ul>
          </div>

          <div className="flex space-x-4 mt-6">
            <div className="w-32 h-10 bg-gray-300 rounded"></div>
            <div className="w-40 h-10 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="dark:bg-[#0a0a0a;] p-6 ">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gray-200"></div>
        <div>
          <h2 className="text-xl font-bold">{user?.name || "Anonymous"}</h2>
          <p className="text-gray-600">{user?.email || "Not Available"}</p>
          <p className="text-sm text-gray-400">Joined: {formattedDate}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between">
          <p>Completed Annotations</p>
          <span className="font-medium">{completedAnnotations}</span>
        </div>
        <div className="flex justify-between">
          <p>Pending Reviews</p>
          <span className="font-medium">{pendingReviews}</span>
        </div>
        <div>
          <p className="mb-1">Progress</p>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-right text-gray-500 mt-1">
            {progressPercentage}%
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Recent Activity</h3>
          <ul className="text-sm space-y-1">
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
        <div className="flex space-x-4 mt-6">
          <button className="btn btn-primary px-4 py-2 border rounded hover:bg-gray-100 border-gray-200 shadow-sm">
            Edit Profile
          </button>
          <button className="btn btn-primary px-4 py-2 border rounded border-gray-200 hover:bg-gray-100 shadow-sm">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}
