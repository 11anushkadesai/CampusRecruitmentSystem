import React, { useState } from 'react';
import axios from 'axios';

const InsertForm = ({ onClose, onAddRow }) => {
  // Initialize state properly
  const [formData, setFormData] = useState({
    College_Name: '',
    District: '',
    State: '',
    Anual_fees: '',
    Placement_fees: '',
    Ranking: '',
    Course: '',
    Phone: '',
    Address: '',
  });

  const inputClass =
    'w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'block font-medium text-gray-700 mb-1';

  // Correctly update state on input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Insert handler to post data and update parent table
 const handleInsert = async () => {
  try {
    const res = await axios.post('http://localhost:5000/add-college', formData);

    if (res.status === 200) {
      alert('✅ Data inserted successfully');
      if (onAddRow) onAddRow(res.data);  // Use server response instead of formData
      setFormData({
        College_Name: '',
        District: '',
        State: '',
        Anual_fees: '',
        Placement_fees: '',
        Ranking: '',
        Course: '',
        Phone: '',
        Address: '',
      });
      onClose();
    }
  } catch (err) {
    console.error('❌ Error inserting data:', err);
    alert('❌ Failed to insert data');
  }
};
  

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg space-y-10">
      <h2 className="text-3xl font-bold text-center text-gray-800">Add College Details</h2>

      <section>
        <h3 className="text-2xl font-semibold text-gray-700 mb-6">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Name of College</label>
            <input
              type="text"
              name="College_Name"
              placeholder="Enter college name"
              className={inputClass}
              value={formData.College_Name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className={labelClass}>City</label>
            <input
              type="text"
              name="District"
              placeholder="Enter city"
              className={inputClass}
              value={formData.District}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className={labelClass}>State / Country</label>
            <input
              type="text"
              name="State"
              placeholder="Enter state and country"
              className={inputClass}
              value={formData.State}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className={labelClass}>Annual Fees</label>
            <input
              type="text"
              name="Anual_fees"
              placeholder="Enter annual fees"
              className={inputClass}
              value={formData.Anual_fees}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className={labelClass}>Placement Fees</label>
            <input
              type="text"
              name="Placement_fees"
              placeholder="Enter placement fees"
              className={inputClass}
              value={formData.Placement_fees}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className={labelClass}>Ranking</label>
            <input
              type="text"
              name="Ranking"
              placeholder="National ranking (if available)"
              className={inputClass}
              value={formData.Ranking}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Courses</label>
            <textarea
              name="Course"
              placeholder="List major courses separated by commas"
              className={inputClass}
              rows={3}
              value={formData.Course}
              onChange={handleChange}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-semibold text-gray-700 mb-6">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Phone Number</label>
            <input
              type="text"
              name="Phone"
              placeholder="Contact Number"
              className={inputClass}
              value={formData.Phone}
              onChange={handleChange}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Address</label>
            <textarea
              name="Address"
              placeholder="Enter full address"
              className={inputClass}
              rows={3}
              value={formData.Address}
              onChange={handleChange}
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end space-x-4 pt-6">
        <button
          className="bg-blue-600 text-white font-medium px-6 py-2 rounded-xl hover:bg-blue-700 transition duration-200"
          onClick={handleInsert}
        >
          Insert
        </button>
        <button
          className="bg-gray-400 text-white font-medium px-6 py-2 rounded-xl hover:bg-gray-500 transition duration-200"
         onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default InsertForm;
