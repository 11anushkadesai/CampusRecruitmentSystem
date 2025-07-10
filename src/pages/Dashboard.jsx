import React, { useEffect, useState } from "react";
import {Calendar,Building,TrendingUp,BarChart2,Users,Search, Plus, RefreshCw,} from "lucide-react";
import Card from "../components/Card";
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import MeetingSection from "../components/MeetingSection";
import { useNavigate } from 'react-router-dom';
import InserForm from "./Forms/InsertForm";



const data = [
  { name: "Colleges", value: 2000 },
  { name: "Scraped", value: 5 },
  { name: "Contacted", value: 1000 },
  { name: "Students", value: 500 },
  { name: "Placed", value: 100 },
];


function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [year, setYear] = useState('');
  const [team, setteam] = useState('');
  const [state, setState] = useState('');
  const [month, setMonth] = useState('');
  const [district, setDistrict] = useState('');
  const [course, setCourse] = useState('');
  const [totalColleges, setTotalColleges] = useState(0);
  const [totalscraped, setTotalScraped] = useState(0);
  const [totalcandidates, setotalcandidates] = useState(0);
  const [totalplacedcandidates, setotalplacedcandidates] = useState(0);
  const [totalhired, setTotalhired] = useState(0);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState(null);
  const [hrChartData, setHrChartData] = useState(null);
  const [courseChartData, setCourseChartData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
const navigate = useNavigate();
 


 


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // updates every second

    return () => clearInterval(timer); // cleanup on unmount
  }, []);



  //  total colleges on mount
  useEffect(() => {
    const fetchCollegeCount = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (year) queryParams.append('year', year);
        if (month) queryParams.append('month', month);
        if (state) queryParams.append('state', state);
        if (district) queryParams.append('district', district);
        if (course) queryParams.append('course', course);
  
        const response = await fetch(`http://localhost:5000/college-count?${queryParams.toString()}`);
        const data = await response.json();
        setTotalColleges(data.total);
      } catch (error) {
        console.error('Error fetching college count:', error);
      }
    };
  
    fetchCollegeCount();
  }, [year, month, state, district, course]);

  
  // total candidates
  useEffect(() => {
    const fetchTotalCandidates = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (year) queryParams.append('year', year);
        if (month) queryParams.append('month', month);
        if (state) queryParams.append('state', state);
        if (district) queryParams.append('district', district);
        if (course) queryParams.append('course', course);
  
        const response = await fetch(`http://localhost:5000/total-candidates?${queryParams.toString()}`);
        const data = await response.json();
        setotalcandidates(data.total_candidates || 0); // Adjust this key if your backend formats it differently
      } catch (error) {
        console.error('Error fetching total candidates:', error);
      }
    };
  
    fetchTotalCandidates();
  }, [year, month, state, district, course]);

//placed candidates
useEffect(() => {
  const fetchTotalCandidates = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (year) queryParams.append('year', year);
      if (month) queryParams.append('month', month);
      if (state) queryParams.append('state', state);
      if (district) queryParams.append('district', district);
      if (course) queryParams.append('course', course);

      const response = await fetch(`http://localhost:5000/placed-candidates?${queryParams.toString()}`);
      const data = await response.json();
      setotalplacedcandidates(data.total_candidates || 0); // Adjust this key if your backend formats it differently
    } catch (error) {
      console.error('Error fetching total candidates:', error);
    }
  };

  fetchTotalCandidates();
}, [year, month, state, district, course]);

//total scraped
  useEffect(() => {
    const fetchTotalScraped = async () => {
      try {
        const response = await fetch('http://localhost:5000/total-scraped');
        const data = await response.json();
        setTotalScraped(data.total);
      } catch (err) {
        console.error('Error fetching total scraped:', err);
        setError('Unable to load data');
      }
    };

    fetchTotalScraped();
  }, []);

 //  total Hired
useEffect(() => {
  const fetchTotalHired = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (team) queryParams.append('team', team);
      if (state) queryParams.append('state', state);
      if (district) queryParams.append('district', district);

      const response = await fetch(`http://localhost:5000/totalhired?${queryParams.toString()}`);
      const data = await response.json();
      
      // ✅ Corrected key: total_hired
      setTotalhired(data.total_hired || 0);
    } catch (error) {
      console.error('Error fetching total hired:', error);
    }
  };

  fetchTotalHired();
}, [team, state, district]);


// last 5 rows
  useEffect(() => {
    const fetchLastFiveRows = async () => {
      try {
        const response = await fetch('http://localhost:5000/last-5-rows');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        if (Array.isArray(data)) {
          setRows(data);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('Error fetching last 5 rows:', err);
        setError('Unable to load data');
      }
    };

    fetchLastFiveRows();
  }, []);


//Marketing team chart 
 useEffect(() => {
    axios.get('http://localhost:5000/mteam-chart')
      .then((res) => {
        const teamNames = res.data.map(item => item.Marketing_team_name);
        const collegeCounts = res.data.map(item => item.total_college);

        setChartData({
          labels: teamNames,
          datasets: [
            {
              label: 'Total College',
              data: collegeCounts,
              backgroundColor: 'rgba(190, 178, 198, 0.7)',
              borderWidth: 1,
            },
          ],
        });
      })
      .catch((err) => console.error('Error fetching chart data:', err));
  }, []);
// hr team  chart
 useEffect(() => {
  axios.get('http://localhost:5000/hrteam-chart')
    .then(res => {
      const teamNames = res.data.map(item => item.Hr_team_name);
      const hiredCounts = res.data.map(item => item.total_hired);

      setHrChartData({
        labels: teamNames,
        datasets: [
          {
            label: 'Total Hired Students',
            data: hiredCounts,
            fill: false,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            tension: 0.4,  // smooth curves
          },
        ],
      });
    })
    .catch(err => console.error('Error fetching HR team chart data:', err));
}, []);


//Course wisec college 
 useEffect(() => {
    fetch('http://localhost:5000/course-college') // Update if backend uses a different port
      .then(res => res.json())
      .then(data => {
        const labels = data.map(item => item.Course);
        const counts = data.map(item => Number(item.total_College));

        setCourseChartData({
          labels,
          datasets: [
            {
              label: 'Total Colleges',
              data: counts,
              backgroundColor: 'rgba(190, 178, 198, 0.7)',
             
              borderWidth: 1,
            },
          ],
        });
      })
      .catch(err => console.error('Error fetching course-college data:', err));
  }, []);

  

  return (
    <div className="p-4">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-5">
  Campus Recruitment Dashboard
</h1>
<p className="text-sm sm:text-base md:text-lg text-gray-500 font-semibold mt-1">
  Manage colleges, companies, and recruitment activities in one place.
</p>
      <div className="flex flex-wrap items-center gap-2 text-gray-400 text-sm sm:text-base">
  <Calendar />
  <p className="font-semibold mt-1 sm:mt-0">
    {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}
  </p>
</div>

      <div className="w-full mt-5 overflow-x-auto">
  <div className="flex gap-4 min-w-max px-2">
    
    <Card className="min-w-[250px]">
      <div className="flex items-center gap-5">
        <Building className="w-14 h-14 shadow-md rounded-2xl p-2 bg-purple-100 hover:bg-purple-200 text-purple-800" />
        <div>
          <h1 className="text-lg font-semibold text-gray-400 mb-1">Total College</h1>
          <h1 className="text-3xl font-bold">{totalColleges}</h1>
        </div>
      </div>
    </Card>

    <Card className="min-w-[250px]">
      <div className="flex items-center gap-5">
        <TrendingUp className="w-14 h-14 shadow-md rounded-2xl p-2 bg-green-100 hover:bg-green-200 text-green-800" />
        <div>
          <h1 className="text-lg font-semibold text-gray-400">Total Data Scraped</h1>
          <h2 className="text-sm font-semibold text-gray-300 mb-1">State wise</h2>
          <h1 className="text-3xl font-bold">{totalscraped}</h1>
        </div>
      </div>
    </Card>

    <Card className="min-w-[250px]">
      <div className="flex items-center gap-5">
        <BarChart2 className="w-14 h-14 shadow-md rounded-2xl p-2 bg-blue-100 hover:bg-blue-200 text-blue-800" />
        <div>
          <h1 className="text-lg font-semibold text-gray-400">Total Candidates</h1>
          <h1 className="text-3xl font-bold">{totalcandidates}</h1>
        </div>
      </div>
    </Card>

    <Card className="min-w-[250px]">
      <div className="flex items-center gap-5">
        <Users className="w-14 h-14 shadow-md rounded-2xl p-2 bg-pink-100 hover:bg-pink-200 text-pink-800" />
        <div>
          <h1 className="text-lg font-semibold text-gray-400">Total Candidates Placed</h1>
          <h1 className="text-3xl font-bold">{totalplacedcandidates}</h1>
        </div>
      </div>
    </Card>

    <Card className="min-w-[250px]">
      <div className="flex items-center gap-5">
        <Users className="w-14 h-14 shadow-md rounded-2xl p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800" />
        <div>
          <h1 className="text-lg font-semibold text-gray-400">Total Students Hired</h1>
          <h1 className="text-3xl font-bold">{totalhired}</h1>
        </div>
      </div>
    </Card>

  </div>
</div>


    {/* Recent Activities */}
<div className="mt-5">
  <p className="text-2xl font-bold text-gray-800 mb-5">Recent Activities</p>

  <Card className="max-h-[300px] overflow-y-auto shadow-md rounded-2xl p-4">
    <p className="text-lg font-semibold text-gray-700 mb-4">Latest Data Scraped</p>

    {error ? (
      <p className="text-red-600">{error}</p>
    ) : rows.length > 0 ? (
      <div className="w-full overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              {Object.keys(rows[0]).map((key, i, arr) => (
                <th
                  key={key}
                  className={`px-2 py-1 text-left text-gray-600 ${
                    i !== arr.length - 1 ? 'border-r border-gray-300' : ''
                  }`}
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {Object.values(row).map((value, colIndex, arr) => (
                  <td
                    key={colIndex}
                    className={`px-2 py-1 text-gray-700 whitespace-nowrap ${
                      colIndex !== arr.length - 1 ? 'border-r border-gray-200' : ''
                    }`}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="text-gray-500 text-center">No data found.</p>
    )}
  </Card>
</div>



    {/* Charts */}
<div className="mt-5 space-y-6">

  {/* Responsive Grid Layout for Two Charts */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    
    {/* Chart 1 */}
    <Card className="p-4">
      <h3 className="text-xl font-semibold mb-4">Colleges Reached By Each Marketing Team</h3>
      <div className="relative w-full h-[250px] sm:h-[300px] md:h-[350px]">
        {chartData ? (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        ) : (
          <p className="text-gray-500">No data available for chart.</p>
        )}
      </div>
    </Card>

    {/* Chart 2 */}
    <Card className="p-4">
      <h3 className="text-xl font-semibold mb-4">HR Team-wise Candidates Hired</h3>
      <div className="relative w-full h-[250px] sm:h-[300px] md:h-[350px]">
        {hrChartData ? (
          <Line
            data={hrChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
              plugins: {
                legend: { position: 'top' },
              },
            }}
          />
        ) : (
          <p className="text-gray-500">No data available for chart.</p>
        )}
      </div>
    </Card>
  </div>

  {/* Full-width Chart */}
  <Card className="p-4">
    <h3 className="text-xl font-semibold mb-4">Course vs College Bar Chart</h3>
    <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px]">
      {courseChartData ? (
        <Bar
          data={courseChartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top' },
              title: { display: true, text: 'Number of Colleges by Course' },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1 },
              },
              x: {
                ticks: {
                  maxRotation: 45,
                  minRotation: 45,
                },
              },
            },
          }}
        />
      ) : (
        <p className="text-gray-500">Loading chart data...</p>
      )}
    </div>
  </Card>

</div>

    
   {/* Quick Action */}
<div className="bg-white p-4 rounded-2xl shadow-md mt-10">
  <p className="text-xl font-bold text-gray-600 mb-5">Quick Actions</p>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
    <button
      onClick={() => navigate("/single-editing")}
      className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-950 text-white font-medium py-2 px-3 rounded-lg transition shadow-md text-sm sm:text-base"
    >
      <Search size={18} />
      Search Colleges/Companies
    </button>

    <button
      onClick={() => setIsModalOpen(true)}
      className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-950 text-white font-medium py-2 px-3 rounded-lg transition shadow-md text-sm sm:text-base"
    >
      <Plus size={18} />
      Add Manual Entry
    </button>

    <button
      onClick={() => navigate("/data-scraping")}
      className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-950 text-white font-medium py-2 px-3 rounded-lg transition shadow-md text-sm sm:text-base"
    >
      <RefreshCw size={18} />
      Start New Scraping
    </button>

    <button
      onClick={() => navigate("/reports")}
      className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-950 text-white font-medium py-2 px-3 rounded-lg transition shadow-md text-sm sm:text-base"
    >
      <BarChart2 size={18} />
      View Full Report
    </button>
  </div>

  {/* Modal Overlay */}
  {isModalOpen && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-[95%] max-w-4xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>
        <InserForm
          onClose={() => setIsModalOpen(false)}
          onAddRow={(newCollege) => {
            setIsModalOpen(false);
          }}
        />
      </div>
    </div>
  )}
</div>


    {/* Meetingsection */}

      <div className="mt-5 px-4 sm:px-6 lg:px-8">
  <p className="text-2xl font-bold text-gray-800 mb-5">Meeting Schedules</p>
  <MeetingSection />
</div>

    </div>
  );
}

export default Dashboard;
