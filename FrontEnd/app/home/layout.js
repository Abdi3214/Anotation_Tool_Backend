"use client";
import {
  Download,
  LayoutDashboard,
  LogOut,
  NotebookPen,
  SaveAll,
  UserPen,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "../../context/UserContext";
export default function HomeLayout({ children }) {
  const router = useRouter();
  const { user } = useStore();
  const pathname = usePathname();

  // const [collapsed, setCollapsed] = useState(true);
  // const toggleCollapsed = () => setCollapsed((c) => !c);
  const [role, setRole] = useState(null);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login"); // or wherever your login page is
  };
  useEffect(() => {
    if (user === null) return;

    if (user?.userType) {
      setRole(user.userType);

      // Block access to admin-only routes
      const adminOnlyRoutes = [
        "/home/dashboard",
        "/home/export",
        "/home/users",
      ];
      if (user.userType !== "Admin" && adminOnlyRoutes.includes(pathname)) {
        router.push("/home/annotation"); // redirect to a safe route
      }
    } else {
      router.push("/login");
    }
  }, [user, pathname]);
  // useEffect(() => {
  //   const handleResize = () => {
  //     if (window.innerWidth < 768) {
  //       setCollapsed(true); // auto collapse on small screens
  //     } else {
  //       setCollapsed(false); // expanded by default on larger screens
  //     }
  //   };

  //   handleResize(); // set initial state
  //   window.addEventListener("resize", handleResize);

  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6 mt-4 mb-10">
      <div className="flex flex-col">
        <header className="w-full px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Annotation Tool
          </h1>

          {/* Navigation */}
          <nav>
            <ul className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6">
              <li>
                <Link
                  href="/home/dashboard"
                  className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/home/profile"
                  className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/home/export"
                  className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                >
                  Export
                </Link>
              </li>
            </ul>
          </nav>
        </header>

        <section className="container mx-auto space-y-6 mt-4 mb-10">
          <aside className="w-full border border-gray-200 rounded-lg dark:border-[#0a0a0a] shadow-md flex">
            {/* Sidebar */}
            <div className="w-16 md:w-60 space-y-5 p-3 border-r border-r-gray-200 dark:border-r-[#0a0a0a] rounded-tr-3xl transition-all duration-300">
              {role === "Admin" && (
                <>
                  <Link
                    href="/home/dashboard"
                    className="flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 hover:rounded-md mt-5"
                    title="Dashboard"
                  >
                    <LayoutDashboard />
                    <span className="ml-3 hidden md:inline text-xl">
                      Dashboard
                    </span>
                  </Link>
                  <Link
                    href="/home/users"
                    className="flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 hover:rounded-md mt-5"
                    title="Users"
                  >
                    <UsersRound />
                    <span className="ml-3 hidden md:inline text-xl">Users</span>
                  </Link>
                </>
              )}

              <Link
                href="/home/annotation"
                className="flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 hover:rounded-md"
                title="My Annotations"
              >
                <NotebookPen />
                <span className="ml-3 hidden md:inline">My Annotations</span>
              </Link>

              <Link
                href="/home/savedPage"
                className="flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 hover:rounded-md"
                title="Saved Annotations"
              >
                <SaveAll />
                <span className="ml-3 hidden md:inline">Saved Annotations</span>
              </Link>

              {role === "Admin" && (
                <Link
                  href="/home/export"
                  className="flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 hover:rounded-md"
                  title="Export"
                >
                  <Download />
                  <span className="ml-3 hidden md:inline">Export</span>
                </Link>
              )}

              <Link
                href="/home/profile"
                className="flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 hover:rounded-md"
                title="Profile"
              >
                <UserPen />
                <span className="ml-3 hidden md:inline">Profile</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 hover:rounded-md"
                title="Log Out"
              >
                <LogOut />
                <span className="ml-3 hidden md:inline">Log Out</span>
              </button>
            </div>

            <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 overflow-x-auto">
              {children}
            </main>
          </aside>
        </section>
      </div>
    </div>
  );
}
