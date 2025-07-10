import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function MeetingSection() {
  const [meetings, setMeetings] = useState([
    { date: new Date(2025, 4, 15), title: "Team Sync" },
    { date: new Date(2025, 4, 20), title: "Campus Drive" },
    { date: new Date(2025, 4, 16), title: "Campus Drive" },
  ]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  const tileClassName = ({ date, view }) => {
    if (
      view === "month" &&
      meetings.find((m) => date.toDateString() === m.date.toDateString())
    ) {
      return "bg-purple-800 text-blue-600 font-bold rounded-full";
    }
    return null;
  };

  const handleScheduleMeeting = () => {
    if (!title.trim()) return;

    const newMeeting = { date: selectedDate, title };

    if (editIndex !== null) {
      // Editing existing meeting
      const updated = [...meetings];
      updated[editIndex] = newMeeting;
      setMeetings(updated);
      setEditIndex(null);
    } else {
      // Adding new meeting
      setMeetings([...meetings, newMeeting]);
    }

    setTitle("");
  };

  const handleDelete = (index) => {
    const updated = meetings.filter((_, i) => i !== index);
    setMeetings(updated);
    if (editIndex === index) {
      setEditIndex(null);
      setTitle("");
    }
  };

  const handleEdit = (index) => {
    const meeting = meetings[index];
    setSelectedDate(meeting.date);
    setTitle(meeting.title);
    setEditIndex(index);
  };
  

  return (
   <div className="flex flex-col lg:flex-row gap-6 mt-10 w-full">
  {/* Notifications */}
  <div className="w-full lg:w-1/2 bg-white p-4 rounded-xl shadow-md">
    <p className="text-xl font-bold text-gray-600 mb-5">Notifications</p>
    <ul className="space-y-3">
      {meetings.map((meeting, index) => (
        <li
          key={index}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-100 p-3 rounded-lg"
        >
          <div className="mb-2 sm:mb-0">
            <p className="font-semibold">{meeting.title}</p>
            <p className="text-sm text-gray-600">
              {meeting.date.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleEdit(index)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => handleDelete(index)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              🗑️ Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  </div>

  {/* Calendar + Scheduling */}
  <div className="w-full lg:w-1/2 bg-white p-4 rounded-xl shadow-md">
    <p className="text-xl font-bold text-gray-600 mb-5">Meeting Calendar</p>
    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
      <Calendar
        value={selectedDate}
        onChange={setSelectedDate}
        tileClassName={tileClassName}
        className="w-full max-w-sm"
      />
      <div className="flex flex-col gap-3 mt-4 lg:mt-0 w-full max-w-xs">
        <input
          type="text"
          placeholder="Meeting Title"
          className="border w-full p-2 rounded-lg"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          className={`${
            editIndex !== null
              ? "bg-yellow-600 hover:bg-yellow-700"
              : "bg-gray-900 hover:bg-gray-950"
          } text-white px-4 py-2 rounded-lg`}
          onClick={handleScheduleMeeting}
        >
          {editIndex !== null ? "Update Meeting" : "Schedule Meeting"}
        </button>
      </div>
    </div>
  </div>
</div>

  );
}
