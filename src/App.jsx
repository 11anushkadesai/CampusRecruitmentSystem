import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

// Import Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import DataScraping from "./pages/DataScraping";
import BulkEditing from "./pages/BulkEditing";
import SingleEditing from "./pages/SingleEditing";
import MarketingData from "./pages/MarketingData";
import HrData from "./pages/HrData";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import MeetingSchedule from "./pages/MeetingSchedule";
import UserManagement from "./pages/UserManagement";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
        <Sidebar isSidebarOpen={isSidebarOpen} />

        {/* Main content */}
        <main
  className={`flex-1 mt-14 pt-14 p-6 h-[calc(100vh-3.5rem)] bg-gray-100 overflow-y-auto transition-all duration-300 ${
    isSidebarOpen ? "ml-64" : "ml-0 lg:ml-64"
  }`}
>

          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/data-scraping" element={<DataScraping />} />
            <Route path="/bulk-editing" element={<BulkEditing />} />
            <Route path="/single-editing" element={<SingleEditing />} />
            <Route path="/marketing-data" element={<MarketingData />} />
            <Route path="/hr-data" element={<HrData />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/meeting-schedule" element={<MeetingSchedule />} />
            <Route path="/user-management" element={<UserManagement />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
