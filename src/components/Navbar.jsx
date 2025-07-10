import { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/Logo.jpg";
import { Menu, Bell } from "lucide-react";

export default function Navbar({ onToggleSidebar }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleToggleSidebar = () => {
    onToggleSidebar((prev) => !prev);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-40 flex items-center justify-between px-4 py-2">
      {/* Left Section: Sidebar toggle, Logo and Company Name */}
      <div className="flex items-center gap-3 min-w-0">
        <button className="lg:hidden text-gray-500" onClick={handleToggleSidebar}>
          <Menu size={24} />
        </button>

        {/* Responsive Logo */}
         <img
          src={logo}
          alt="Logo"
          className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
        /> 

        {/* Responsive Company Name */}
        <span className="font-bold text-sm sm:text-base md:text-lg lg:text-xl text-gray-800 truncate">
          Talent Corner HR Services Pvt. Ltd.
        </span> 
      </div>

      {/* Center Section: Navigation Links */}
      <nav className="hidden lg:flex flex-1 justify-center space-x-6">
        <NavLink
          to="/"
          className="text-gray-500 hover:text-black font-bold text-sm md:text-base"
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/data-scraping"
          className="text-gray-500 hover:text-black font-bold text-sm md:text-base"
        >
          Data Scraping
        </NavLink>
        <NavLink
          to="/marketing-data"
          className="text-gray-500 hover:text-black font-bold text-sm md:text-base"
        >
          Marketing Data
        </NavLink>
        <NavLink
          to="/hr-data"
          className="text-gray-500 hover:text-black font-bold text-sm md:text-base"
        >
          HR Data
        </NavLink>
        <NavLink
          to="/reports"
          className="text-gray-500 hover:text-black font-bold text-sm md:text-base"
        >
          Reports
        </NavLink>
      </nav>

      {/* Right Section: Notifications & Profile */}
      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-black">
          <Bell size={24} />
        </button>
        <div className="flex items-center gap-2">
          <img
            src="https://via.placeholder.com/40"
            alt="Profile"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
          />
          <span className="hidden sm:block font-medium text-gray-700 truncate">
            John Doe
          </span>
        </div>
      </div>
    </header>
  );
}
