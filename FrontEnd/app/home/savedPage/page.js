"use client";

import { useRouter } from "next/navigation";
import { Trash } from "phosphor-react";
import { useEffect, useState } from "react";
import { useStore } from "../../../context/UserContext";
export default function SavedAnnotations() {
  const [annotations, setAnnotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const {setPendingReviews, setCompletedAnnotations} = useStore();
  const fetchAnnotations = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("https://anotationtoolbackend-production.up.railway.app/api/annotation/Allannotation", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Fetch failed: ${res.status} - ${errorText}`);
        setAnnotations([]);
        setCompletedAnnotations(0)
        return;
      }

      const data = await res.json();
      setAnnotations(data);
      setCompletedAnnotations(data.length)
    } catch (error) {
      console.error("Error fetching annotations:", error);
      setAnnotations([]);
      setCompletedAnnotations(0)
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
    const confirmed = confirm("Are you sure you want to delete all annotations?");
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("https://anotationtoolbackend-production.up.railway.app/api/annotation/deleteAll", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

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
    const confirmed = confirm("Are you sure you want to delete this annotation?");
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://anotationtoolbackend-production.up.railway.app/api/annotation/rebortAnnotationDelete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

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
    <div className="border p-4 flex items-center justify-between border-gray-200 shadow-md rounded-sm animate-pulse">
      <div className="flex items-center gap-3 w-full">
        <div className="bg-gray-300 w-8 h-8 rounded-full"></div>
        <div className="flex-1 h-4 bg-gray-300 rounded w-3/4"></div>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4">
        {!loading && annotations.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
          >
            Delete All
          </button>
        )}
      </div>

      <div className="space-y-4 h-screen p-2 overflow-auto">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : annotations.length > 0
            ? annotations.map((item) => (
                <div
                  key={item._id}
                  className="border p-4 flex items-center justify-between border-gray-200 shadow-md rounded-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-200 w-12 flex items-center justify-center h-12 text-sm  rounded-full">
                      {typeof item.Annotator_ID === "number"
                        ? item.Annotator_ID + 1
                        : item.Annotator_ID}
                    </div>
                    {item.Src_Text} - Score: {item.Score}
                  </div>
                  <Trash
                    className="cursor-pointer"
                    onClick={() => handleDelete(item._id)}
                    size={24}
                    color="#ff0000"
                  />
                </div>
              ))
            : <p className="text-gray-500">No saved annotations.</p>
        }
      </div>
    </div>
  );
}
