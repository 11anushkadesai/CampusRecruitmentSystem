import React, { useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import Card from "../components/Card";
import HrForm from './Forms/HrForm';


const locationOptions = [
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Pune', label: 'Pune' },
  { value: 'Chennai', label: 'Chennai' },
  { value: 'Bangalore', label: 'Bangalore' },
];

const courseOptions = [
  { value: 'BE/B.Tech', label: 'BE/B.Tech' },
  { value: 'MTech', label: 'MTech' },
  { value: 'MBA', label: 'MBA' },
  { value: 'BCA', label: 'BCA' },
  { value: 'MCA', label: 'MCA' },
  { value: 'BSc IT', label: 'BSc IT' },
  { value: 'Pharmacy', label: 'Pharmacy' },
];

const HrData = () => {
  const [college, setCollege] = useState('');
  const [location, setLocation] = useState([]);
  const [course, setCourse] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showUpdatedOnly, setShowUpdatedOnly] = useState(false);

 const [updatedData, setUpdatedData] = useState({
        College_Name: '',
        State: '',
        District: '',
        Course: '',
        Anual_fees: '',
        Placement_fees: '',
        Ranking: '',
        Address: '',
        Phone: '',
        Director_name: '',
        Director_number: '',
        Director_email: '',
        Placement_coor_name: '',
        Placement_coor_contact: '',
        Placement_coor_email: '',
        Hr_team_name: '',
        Spoke_for_placement: '',
        Resume_received: '',
        Interview_status: '',
        Total_num_students: '',
        Hired_students: '',
        Data_updated_by_name: '',
        Term: '',
        Clg_ID: '', // if editing/updating
        Date_of_Contact: '',
        Date_of_Next_Contact: '',
        Send_proposal: '',
        Total_payment: '',
        Payment_received: '',
        Payment_period: '',
        Replacement_period: '',
        Placed_on_Month: '',
        Placed_on_Year: '',
        Update_timestamp: '' // usually auto-set, but good to include if needed
      }
      );
      

  const handleSearch = async () => {
    if (!college && location.length === 0 && course.length === 0) {
      alert('Please enter College Name, Location, or Course.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/search', {
        params: {
          college,
          location: location.map(l => l.value).join(','),
          course: course.map(c => c.value).join(','),
        }
      });
      setColleges(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleEdit = (collegeId) => {
    const collegeToEdit = colleges.find(col => col.Clg_ID === collegeId);
    setEditingCollege(collegeToEdit);
    setShowEditForm(true);
    setUpdatedData({ ...collegeToEdit });
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setEditingCollege(null);
  };

  const handleUpdate = async () => {
    const updatedCollege = {
      ...updatedData,
      Update_timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    try {
      await axios.put(`http://localhost:5000/update/${editingCollege.Clg_ID}`, updatedCollege);
      setColleges(prev =>
        prev.map(col => (col.Clg_ID === editingCollege.Clg_ID ? { ...col, ...updatedCollege } : col))
      );
      setEditingCollege(null);
      setShowEditForm(false);
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const handleDelete = async (collegeId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this record?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/delete/${collegeId}`);
      setColleges(colleges.filter(col => col.Clg_ID !== collegeId));
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const filteredColleges = showUpdatedOnly
    ? colleges.filter(college => college.Update_timestamp !== null)
    : colleges;

  return (
    <div className="p-6 max-w-full">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-5">Hr Data  Editing </h1>
      <p className="text-sm sm:text-base md:text-lg text-gray-500 font-semibold mt-1">
        Dashboard - Hr data edit
      </p>
      <Card className='mt-5'>
  <p className="text-xl font-bold text-gray-400 mb-5">Hr Data Search</p>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    <div>
      <label className="block text-xl mb-2 font-medium text-gray-700">College Name</label>
      <input
        type="text"
        className="w-full border rounded px-3 py-2"
        placeholder="Enter college name"
        value={college}
        onChange={(e) => setCollege(e.target.value)}
      />
    </div>

    <div>
      <label className="block text-xl mb-2 font-medium text-gray-700">Location/City</label>
      <Select
        isMulti
        isSearchable
        placeholder="Select locations"
        options={locationOptions}
        value={location}
        onChange={setLocation}
        menuPortalTarget={document.body}
        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
      />
    </div>

    <div>
      <label className="block text-xl mb-2 font-medium text-gray-700">Courses</label>
      <Select
        isMulti
        isSearchable
        placeholder="Select Courses"
        options={courseOptions}
        value={course}
        onChange={setCourse}
        menuPortalTarget={document.body}
        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
      />
    </div>
  </div>

  <label className="flex items-center gap-2 mb-6 cursor-pointer">
    <input
      type="checkbox"
      checked={showUpdatedOnly}
      onChange={() => setShowUpdatedOnly(!showUpdatedOnly)}
    />
    <span>Show Updated Data Only</span>
  </label>

  <div className="flex gap-4 mb-10">
    <button
      type="button"
      className="bg-gray-900 shadow-md text-white px-4 py-2 rounded hover:bg-gray-700"
      onClick={handleSearch}
    >
      Search
    </button>
    <button
      type="button"
      className="bg-gray-300 shadow-md text-black px-4 py-2 rounded hover:bg-gray-400"
      onClick={() => {
        setCollege('');
        setLocation([]);
        setCourse([]);
        setShowUpdatedOnly(false);
        setColleges([]);
      }}
    >
      Clear Filters
    </button>
  </div>
</Card>


     <Card className="mt-5">
  <div className="overflow-auto">
    <p className="text-xl font-bold text-gray-400 mb-5">Search Results</p>
    {loading ? (
      <p>Loading...</p>
    ) : filteredColleges.length > 0 ? (
      <table className="min-w-[1200px] w-full table-auto border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-sm">
            {[
              'College ID', 'College Name', 'District', 'State', 'Courses',
              'Anual Fees', 'Placement Fees', 'Ranking', 'Phone', 'Address',
              'Director Name', 'Director Email', 'Director Contact',
              'Placement Coordinator Name', 'Placement Coordinator Email', 'Placement Coordinator Contact',
              'Date of Contact', 'Date of Next Contact', 'Hr team name',
              'Send proposal', 'Total payment', 'Payment received', 'Payment period',
              'Replacement_period', 'Spoke for placement', 'Resume received', 'Interview status',
              'Total number of student', 'Hired student', 'Term', 'Update By',
              'Placed_on_Month', 'Placed_on_Year', 'Update Timestamp', 'Update'
            ].map((header, idx) => (
              <th key={idx} scope="col" className="border px-3 py-2">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredColleges.map((college) => (
            <tr key={college.Clg_ID} className="text-sm text-center border-t">
              <td>{college.Clg_ID}</td>
              <td>{college.College_Name}</td>
              <td>{college.District}</td>
              <td>{college.State}</td>
              <td>{college.Course}</td>
              <td>{college.Anual_fees}</td>
              <td>{college.Placement_fees}</td>
              <td>{college.Ranking}</td>
              <td>{college.Phone}</td>
              <td>{college.Address}</td>
              <td>{college.Director_name}</td>
              <td>{college.Director_email}</td>
              <td>{college.Director_number}</td>
              <td>{college.Placement_coor_name}</td>
              <td>{college.Placement_coor_email}</td>
              <td>{college.Placement_coor_contact}</td>
              <td>{college.Date_of_Contact}</td>
              <td>{college.Date_of_Next_Contact}</td>
              <td>{college.Hr_team_name}</td>
              <td>{college.Send_proposal}</td>
              <td>{college.Total_payment}</td>
              <td>{college.Payment_received}</td>
              <td>{college.Payment_period}</td>
              <td>{college.Replacement_period}</td>
              <td>{college.Spoke_for_placement}</td>
              <td>{college.Resume_received}</td>
              <td>{college.Interview_status}</td>
              <td>{college.Total_num_students}</td>
              <td>{college.Hired_students}</td>
              <td>{college.Term}</td>
              <td>{college.Data_updated_by_name}</td>
              <td>{college.Placed_on_Month}</td>
              <td>{college.Placed_on_Year}</td>
              <td>{college.Update_timestamp}</td>

              <td className="flex flex-col gap-1 justify-center items-center py-2">
                <button
                  onClick={() => handleEdit(college.Clg_ID)}
                  className="bg-yellow-400 shadow-md text-sm px-3 py-1 rounded hover:bg-yellow-500"
                  aria-label={`Edit details of college ${college.College_Name}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(college.Clg_ID)}
                  className="bg-red-500 shadow-md text-white text-sm px-3 py-1 rounded hover:bg-red-600"
                  aria-label={`Delete college ${college.College_Name}`}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>No results found</p>
    )}
  </div>
</Card>


     {/* Edit Form Modal */}
{showEditForm && (
  <div
    className="fixed inset-0 flex items-center justify-center z-50 "
    role="dialog"
    aria-modal="true"
    aria-labelledby="editFormTitle"
    onClick={handleCloseEditForm} // Close modal on backdrop click
  >
    <div
      className="bg-white p-6 rounded-lg shadow-lg w-[95%] max-w-4xl max-h-[800px] overflow-y-auto"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
    >
      <h2 id="editFormTitle" className="sr-only">Edit College Details</h2> {/* For screen readers */}
      
      <HrForm
        college={editingCollege}
        updatedData={updatedData}
        setUpdatedData={setUpdatedData}
        onClose={handleCloseEditForm}
        onSave={handleUpdate}
      />
    </div>
  </div>
)}

    </div>
  );
};

export default HrData;
