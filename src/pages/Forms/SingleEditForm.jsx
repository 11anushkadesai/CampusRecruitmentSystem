import React from 'react';

const SingleEditForm = ({ college, updatedData, setUpdatedData, onClose, onSave }) => {
const inputClass =
'w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';

const labelClass = 'block font-medium text-gray-700 mb-1';

return (
<div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg space-y-10">
<h2 className="text-3xl font-bold text-center text-gray-800">Edit College Details</h2>
  {/* Section: Basic Information */}
  <section>
    <h3 className="text-2xl font-semibold text-gray-700 mb-6">Basic Information</h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className={labelClass}>Name of College</label>
        <input
          type="text"
          placeholder="Enter college name"
          className={inputClass}
          value={updatedData.College_Name}
          onChange={(e) => setUpdatedData({ ...updatedData, College_Name: e.target.value })}
        />
      </div>

      <div>
        <label className={labelClass}>City</label>
        <input
          type="text"
          placeholder="Enter city"
          className={inputClass}
          value={updatedData.District}
          onChange={(e) => setUpdatedData({ ...updatedData, District: e.target.value })}
        />
      </div>

      <div>
        <label className={labelClass}>State / Country</label>
        <input
          type="text"
          placeholder="Enter state and country"
          className={inputClass}
          value={updatedData.State}
          onChange={(e) => setUpdatedData({ ...updatedData, State: e.target.value })}
        />
      </div>

      <div>
        <label className={labelClass}>Annual Fees</label>
        <input
          type="text"
          placeholder="Enter annual fees"
          className={inputClass}
          value={updatedData.Anual_fees}
          onChange={(e) => setUpdatedData({ ...updatedData, Anual_fees: e.target.value })}
        />
      </div>

      <div>
        <label className={labelClass}>Placement Fees</label>
        <input
          type="text"
          placeholder="Enter placement fees"
          className={inputClass}
          value={updatedData.Placement_fees}
          onChange={(e) => setUpdatedData({ ...updatedData, Placement_fees: e.target.value })}
        />
      </div>

      <div>
        <label className={labelClass}>Ranking</label>
        <input
          type="text"
          placeholder="National ranking (if available)"
          className={inputClass}
          value={updatedData.Ranking}
          onChange={(e) => setUpdatedData({ ...updatedData, Ranking: e.target.value })}
        />
      </div>

      <div className="md:col-span-2">
        <label className={labelClass}>Courses</label>
        <textarea
          placeholder="List major courses separated by commas"
          className={inputClass}
          rows={3}
          value={updatedData.Course}
          onChange={(e) => setUpdatedData({ ...updatedData, Course: e.target.value })}
        />
      </div>
    </div>
  </section>

  {/* Section: Contact Information */}
  <section>
    <h3 className="text-2xl font-semibold text-gray-700 mb-6">Contact Information</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className={labelClass}>Phone Number</label>
        <input
          type="text"
          placeholder="Contact Number"
          className={inputClass}
          value={updatedData.Phone}
          onChange={(e) => setUpdatedData({ ...updatedData, Phone: e.target.value })}
        />
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Address</label>
        <textarea
          placeholder="Enter full address"
          className={inputClass}
          rows={3}
          value={updatedData.Address}
          onChange={(e) => setUpdatedData({ ...updatedData, Address: e.target.value })}
        />
      </div>
    </div>
  </section>

  {/* Section: Director Details */}
  <section>
    <h3 className="text-2xl font-semibold text-gray-700 mb-6">Director Details</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className={labelClass}>Name</label>
        <input
          type="text"
          placeholder="Director's full name"
          className={inputClass}
          value={updatedData.Director_name}
          onChange={(e) => setUpdatedData({ ...updatedData, Director_name: e.target.value })}
        />
      </div>
      <div>
        <label className={labelClass}>Phone Number</label>
        <input
          type="text"
          placeholder="Contact number"
          className={inputClass}
          value={updatedData.Director_number}
          onChange={(e) => setUpdatedData({ ...updatedData, Director_number: e.target.value })}
        />
      </div>
      <div>
        <label className={labelClass}>Email Address</label>
        <input
          type="email"
          placeholder="Email"
          className={inputClass}
          value={updatedData.Director_email}
          onChange={(e) => setUpdatedData({ ...updatedData, Director_email: e.target.value })}
        />
      </div>
    </div>
  </section>

  {/* Section: Placement Coordinator */}
  <section>
    <h3 className="text-2xl font-semibold text-gray-700 mb-6">Placement Coordinator</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className={labelClass}>Name</label>
        <input
          type="text"
          placeholder="Coordinator name"
          className={inputClass}
          value={updatedData.Placement_coor_name}
          onChange={(e) => setUpdatedData({ ...updatedData, Placement_coor_name: e.target.value })}
        />
      </div>
      <div>
        <label className={labelClass}>Phone Number</label>
        <input
          type="text"
          placeholder="Contact number"
          className={inputClass}
          value={updatedData.Placement_coor_contact}
          onChange={(e) => setUpdatedData({ ...updatedData, Placement_coor_contact: e.target.value })}
        />
      </div>
      <div>
        <label className={labelClass}>Email Address</label>
        <input
          type="email"
          placeholder="Email"
          className={inputClass}
          value={updatedData.Placement_coor_email}
          onChange={(e) => setUpdatedData({ ...updatedData, Placement_coor_email: e.target.value })}
        />
      </div>
    </div>
  </section>

  {/* Section: Database Info */}
  <section>
    <h3 className="text-2xl font-semibold text-gray-700 mb-6">Database Information</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className={labelClass}>Name of Updater</label>
        <input
          type="text"
          placeholder="Updater name"
          className={inputClass}
          value={updatedData.Data_updated_by_name}
          onChange={(e) => setUpdatedData({ ...updatedData, Data_updated_by_name: e.target.value })}
        />
      </div>
      <div>
        <label className={labelClass}>Date of Last Update</label>
        <input
          type="text"
          placeholder="DD/MM/YYYY"
          className={inputClass}
          value={updatedData.Update_timestamp}
          onChange={(e) => setUpdatedData({ ...updatedData, Update_timestamp: e.target.value })}
        />
      </div>
    </div>
  </section>

  {/* Buttons */}
  <div className="flex justify-end space-x-4 pt-6">
    <button
      className="bg-blue-600 text-white font-medium px-6 py-2 rounded-xl hover:bg-blue-700 transition duration-200"
      onClick={onSave}
      type="submit"
    >
      Save Changes
    </button>
    <button
      className="bg-gray-400 text-white font-medium px-6 py-2 rounded-xl hover:bg-gray-500 transition duration-200"
      onClick={onClose}
      type="button"
    >
      Cancel
    </button>
  </div>
</div>
);
};

export default SingleEditForm;