import { NavLink } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Database,
  Edit,
  Pencil,
  BarChart2,
  Users,
  FileText,
  Settings,
  Calendar,
  UserCog,
} from "lucide-react";

const linkClasses = ({ isActive }) =>
  `flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm md:text-base ${
    isActive
      ? "bg-purple-300 text-black"
      : "text-gray-500 hover:bg-purple-300 hover:text-black"
  }`;

export default function Sidebar({ isSidebarOpen }) {
  return (
    <aside
      className={`fixed top-14 left-0 w-64 h-[calc(100vh-4rem)] bg-gray-50 p-4 overflow-y-auto shadow-md transition-transform duration-300 z-30
      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
    >
      <nav className="space-y-4">
        <div className="mt-6">
          <p className="text-gray-600 font-bold mb-1">Main</p>
          <ul className="space-y-1">
            <li>
              <NavLink to="/home" className={linkClasses}>
                <Home size={18} /> Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/" className={linkClasses}>
                <LayoutDashboard size={18} /> Dashboard
              </NavLink>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-gray-600 font-bold mt-4">Data Analyst Tools</p>
          <ul className="space-y-1">
            <li>
              <NavLink to="/data-scraping" className={linkClasses}>
                <Database size={18} /> Data Scraping
              </NavLink>
            </li>
            <li>
              <NavLink to="/bulk-editing" className={linkClasses}>
                <Edit size={18} /> Bulk Editing
              </NavLink>
            </li>
            <li>
              <NavLink to="/single-editing" className={linkClasses}>
                <Pencil size={18} /> Single Editing
              </NavLink>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-gray-600 font-bold mt-4">Marketing Team Tools</p>
          <ul className="space-y-1">
            <li>
              <NavLink to="/marketing-data" className={linkClasses}>
                <BarChart2 size={18} /> Marketing Data
              </NavLink>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-gray-600 font-bold mt-4">HR Team Tools</p>
          <ul className="space-y-1">
            <li>
              <NavLink to="/hr-data" className={linkClasses}>
                <Users size={18} /> HR Data
              </NavLink>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-gray-600 font-bold mt-4">Reports</p>
          <ul className="space-y-1">
            <li>
              <NavLink to="/reports" className={linkClasses}>
                <FileText size={18} /> Report
              </NavLink>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-gray-600 font-bold mt-4">Administration</p>
          <ul className="space-y-1">
            <li>
              <NavLink to="/settings" className={linkClasses}>
                <Settings size={18} /> Settings
              </NavLink>
            </li>
            <li>
              <NavLink to="/meeting-schedule" className={linkClasses}>
                <Calendar size={18} /> Meeting Schedule
              </NavLink>
            </li>
            <li>
              <NavLink to="/user-management" className={linkClasses}>
                <UserCog size={18} /> User Management
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}
