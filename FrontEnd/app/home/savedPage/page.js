"use client";

import { useRouter } from "next/navigation";
import { Trash } from "phosphor-react";
import { useEffect, useState } from "react";
import { useStore } from "../../../context/UserContext";
export default function SavedAnnotations() {
  const [annotations, setAnnotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { setPendingReviews, setCompletedAnnotations } = useStore();
  const fetchAnnotations = async () => {
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

  useEffect(() => {
    fetchAnnotations();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/login");
    }
  }, [router]);

  const handleDeleteAll = async () => {
    const confirmed = confirm(
      "Are you sure you want to delete all annotations?"
    );
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        "https://anotationtoolbackend-production.up.railway.app/api/annotation/deleteAll",
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Delete failed: ${res.status} - ${errorText}`);
        alert("Failed to delete annotations.");
        return;
      }

      fetchAnnotations();
    } catch (error) {
      console.error("Error deleting annotations:", error);
      alert("An unexpected error occurred. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = confirm(
      "Are you sure you want to delete this annotation?"
    );
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `https://anotationtoolbackend-production.up.railway.app/api/annotation/rebortAnnotationDelete/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Delete failed: ${res.status} - ${errorText}`);
        alert("Failed to delete annotation.");
        return;
      }

      fetchAnnotations();
    } catch (error) {
      console.error("Error deleting annotation:", error);
      alert("An unexpected error occurred. Please try again later.");
    }
  };

  const SkeletonCard = () => (
    <div className="border p-4 flex items-center justify-between border-gray-200 dark:border-gray-700 shadow-md rounded-md animate-pulse bg-white dark:bg-[#0a0a0a]">
      <div className="flex items-center gap-4 w-full">
        <div className="bg-gray-300 dark:bg-gray-600 w-10 h-10 rounded-full" />
        <div className="flex-1 h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
      </div>
    </div>
  );

  return (
    <div className="p-4 max-w-7xl mx-auto w-full">
      {/* Delete Button */}
      <div className="flex justify-end mb-4">
        {!loading && annotations.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow transition text-sm sm:text-base"
          >
            Delete All
          </button>
        )}
      </div>

      {/* Annotation List */}
      <div className="space-y-4 h-[calc(100vh-150px)] overflow-auto p-2 bg-white dark:bg-[#0a0a0a] rounded-md shadow-inner">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : annotations.length > 0 ? (
          annotations.map((item) => (
            <div
              key={item._id}
              className="border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-md rounded-md bg-white dark:bg-gray-900"
            >
              <div className="flex items-center gap-4 text-sm sm:text-base text-gray-800 dark:text-gray-100">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 font-semibold text-xs sm:text-base">
                  {typeof item.Annotator_ID === "number"
                    ? item.Annotator_ID + 1
                    : item.Annotator_ID}
                </div>
                <div className="flex flex-col max-w-full sm:max-w-xs max-h-24 overflow-y-auto break-words">
                  <span className="font-medium">{item.Src_Text}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    Score: {item.Score}
                  </span>
                </div>
              </div>
              <Trash
                className="cursor-pointer hover:scale-105 transition self-end sm:self-auto"
                onClick={() => handleDelete(item._id)}
                size={24}
                color="#ff0000"
              />
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center mt-12">
            No saved annotations.
          </p>
        )}
      </div>
    </div>
  );
}
