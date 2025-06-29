'use client'
import { Download, LayoutDashboard, LogOut, Menu, NotebookPen, SaveAll, UserPen, UsersRound, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomeLayout({ children }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(true);
  const toggleCollapsed = () => setCollapsed(c => !c);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login"); // or wherever your login page is
  };
  return (
    <div className="container mx-auto space-y-6 mt-4 mb-10">
      <div className="flex flex-col">
        <header className="w-full flex items-center space-x-6">
          <h1 className="text-3xl font-medium flex-1">Annotation Tool</h1>
          <nav>
            <ul className="flex space-x-4">
              <Link href="/home/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/home/profile" className="hover:text-blue-600">
                Profile
              </Link>
              <Link href="/home/export" className="hover:text-blue-600">
                Export
              </Link>
            </ul>
          </nav>
          
        </header>
        <section className="container mx-auto space-y-6 mt-4 mb-10 ">
          <aside className="w-full border border-gray-200 rounded-lg dark:border-[#0a0a0a] shadow-md flex">
            {/* Sidebar */}
            <div
              className={`${
                collapsed ? "w-16" : "w-60"
              } space-y-5 p-3 border-r border-r-gray-200 rounded-tr-3xl transition-width duration-300`}
            >
              {/* Toggle Button */}
              <div
                onClick={toggleCollapsed}
                className="cursor-pointer p-2 hover:bg-gray-200 rounded flex justify-center foc"
              >
                {collapsed ? <Menu /> : <X />}
              </div>

              <Link href="/home/dashboard"
                className="flex items-center w-full hover:bg-gray-200 p-2  hover:rounded-md mt-5"
                title="Dashboard"
              >
                <LayoutDashboard />
                {!collapsed && <span className="text-xl ml-3">Dashboard</span>}
              </Link>
              <Link href="/home/users"
                className="flex items-center w-full hover:bg-gray-200 p-2  hover:rounded-md mt-5"
                title="Users"
              >
                <UsersRound />
                {!collapsed && <span className="text-xl ml-3">Users</span>}
              </Link>
              <Link href="/home/annotation"
                className="flex items-center w-full hover:bg-gray-200  p-2  hover:rounded-md"
                title="My Annotations"
              >
                <NotebookPen />
                {!collapsed && <span className="ml-3">My Annotations</span>}
              </Link>
              <Link href="/home/savedPage"
                className="flex items-center w-full hover:bg-gray-200  p-2  hover:rounded-md"
                title="Saved Annotations"
              >
                <SaveAll />
                {!collapsed && <span className="ml-3">Saved Annotations</span>}
              </Link>
              <Link href="/home/export"
                className="flex items-center w-full hover:bg-gray-200  p-2  hover:rounded-md"
                title="Export"
              >
                <Download />
                {!collapsed && <span className="ml-3">Export</span>}
              </Link>
              <Link href= "/home/profile"
                className="flex items-center w-full hover:bg-gray-200  p-2  hover:rounded-md"
                title="Profile"
              >
                <UserPen />
                {!collapsed && <span className="ml-3">Profile</span>}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full hover:bg-gray-200  p-2  hover:rounded-md"
                title="Log Out"
              >
                <LogOut />
                {!collapsed && <span className="ml-3">LogOut</span>}
              </button>
            </div>
            <main className="flex-1 p-4">{children}</main>
          </aside>
          
        </section>
        
      </div>
    </div>
  );
}
