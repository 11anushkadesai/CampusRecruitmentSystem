import React, { useState, useEffect } from 'react';
import { FaDownload, FaShareAlt, FaSyncAlt } from 'react-icons/fa';
import { Bar, Scatter, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import Card from '../../components/Card';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

function Hr_chart() {
  const [activeTab, setActiveTab] = useState('college');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [team, setteam] = useState('');
  const [chartData, setChartData] = useState([]);
  const [totalColleges, setTotalColleges] = useState(0);
  const [totalhired, setTotalhired] = useState(0);
  const [totalstudent ,setTotalstudent] = useState(0);
  
  
  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", 
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep", "Delhi", 
    "Puducherry", "Ladakh", "Jammu and Kashmir"
  ];
  
  const cities = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol"],
    "Delhi": ["Delhi", "New Delhi", "Dwarka"],
    // Add more states and cities as needed
  };

const handleUpdateReport = async () => {
  try {
    const response = await fetch("http://localhost:5000/hr-chart?" + new URLSearchParams({
      state,
      district,
      team
    }), {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    const data = await response.json();
    setChartData(data.chartData); // Now contains { team, total_hired }

  } catch (error) {
    console.error("Error fetching HR chart data:", error);
  }
};




 //export 
const handleExportPDF = async () => {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  const chartElements = document.querySelectorAll('.chart'); // class assigned to each chart

  for (let i = 0; i < chartElements.length; i++) {
    const chartEl = chartElements[i];

    // Scroll into view in case of rendering issues
    chartEl.scrollIntoView();

    const canvas = await html2canvas(chartEl, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    if (i !== 0) pdf.addPage(); // Add a new page from the second chart onwards

    pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight);
  }

  pdf.save('college_chart_report.pdf');
};

   //  total colleges on mount
    useEffect(() => {
      const fetchCollegeCount = async () => {
        try {
          const queryParams = new URLSearchParams();
          if (team) queryParams.append('team', team);
          if (state) queryParams.append('state', state);
          if (district) queryParams.append('district', district);
          
    
          const response = await fetch(`http://localhost:5000/totalcollege?${queryParams.toString()}`);
          const data = await response.json();
          setTotalColleges(data.total);
        } catch (error) {
          console.error('Error fetching college count:', error);
        }
      };
    
      fetchCollegeCount();
    }, [team, state, district]); 
  

// //total students 
 useEffect(() => {
    const fetchTotalStudents = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (team) queryParams.append('team', team);
        if (state) queryParams.append('state', state);
        if (district) queryParams.append('district', district);

        const response = await fetch(`http://localhost:5000/totalstudents?${queryParams}`);
        const data = await response.json();
        setTotalstudent(data.total_students || 0);
      } catch (error) {
        console.error('Error fetching total students:', error);
      }
    };

    fetchTotalStudents();
  }, [team, state, district]);




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

    
   
  
  return (
    <div>
      
      {/* Filter Card */}
      <p className="text-sm sm:text-base md:text-lg text-gray-500 font-semibold mt-1">Hr Reports </p>

     <Card className="p-6 sm:p-8 md:p-10">
  <div>
    {/* Header */}
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
      <p className="text-xl font-bold text-gray-600">Report Filters</p>
      <div className="flex flex-wrap gap-3">
        <button
          className="px-4 py-2 shadow-md hover:bg-gray-700 text-white bg-gray-900 rounded-full flex items-center"
          onClick={handleExportPDF}
        >
          <FaDownload className="mr-2" /> Export
        </button>
        <button className="px-4 py-2 shadow-md hover:bg-gray-700 text-white bg-gray-900 rounded-full flex items-center">
          <FaShareAlt className="mr-2" /> Share
        </button>
      </div>
    </div>

    <p className="font-semibold text-gray-500 mb-5">
      Customize your reports by time period, course and other parameters
    </p>

    {/* Filters */}
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-6 items-start">
      <div className="min-w-[200px]">
        <label className="block text-base font-medium text-gray-700">State</label>
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="">Select State</option>
          {states.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-[200px]">
        <label className="block text-base font-medium text-gray-700">City</label>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="">Select City</option>
          {state &&
            cities[state]?.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
        </select>
      </div>

      <div className="min-w-[200px]">
        <label className="block text-base font-medium text-gray-700">Team</label>
        <select
          value={team}
          onChange={(e) => setteam(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="">Select team</option>
          <option>Nandini</option>
          <option>Simran</option>
          <option>Pooja</option>
        </select>
      </div>
    </div>

    {/* Update Button */}
    <div className="mt-10">
      <button
        onClick={handleUpdateReport}
        className="px-6 py-3 bg-gray-900 hover:bg-gray-700 shadow-md text-white rounded-full flex items-center"
      >
        <FaSyncAlt className="mr-2" /> Update Reports
      </button>
    </div>
  </div>
</Card>

      {/* Stats */}
      <div className="overflow-x-auto">
  <div className="grid grid-cols-4 min-w-[800px] gap-4 mt-5 mb-6">
  {/* Total Colleges */}
  <Card className="p-4 text-center">
    <div className="text-lg font-medium text-gray-700">Total Colleges</div>
    <h3 className="text-2xl font-semibold text-gray-900 mt-2">{totalColleges}</h3>
    <span className="text-green-600 text-sm mt-1 block">+12.5% vs last year</span>
  </Card>

  {/* Total Students */}
  <Card className="p-4 text-center">
    <div className="text-lg font-medium text-gray-700">Total Students</div>
    <h3 className="text-2xl font-semibold text-gray-900 mt-2">{totalstudent}</h3>
    <span className="text-blue-600 text-sm mt-1 block">12 Hrs engaged</span>
  </Card>

  {/* Total Hired */}
  <Card className="p-4 text-center">
    <div className="text-lg font-medium text-gray-700">Total Hired</div>
    <h3 className="text-2xl font-semibold text-gray-900 mt-2">{totalhired}</h3>
    <span className="text-green-600 text-sm mt-1 block">+18.3% growth</span>
  </Card>
</div>
      </div>


     {/* Charts Section */}
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Bar Chart */}
        <div className="bg-white chart p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Placement by Course</h3>
          {chartData.length > 0 ? (
           <Bar
                         data={{
                           labels: chartData.map(item => item.team),
                           datasets: [{
                             label: 'Total Placements',
                             data: chartData.map(item => item.total_hired),
                             backgroundColor: 'rgba(190, 178, 198, 0.7)',
                             borderWidth: 1
                           }]
                         }}
                         options={{
                           scales: {
                             y: {
                               beginAtZero: true
                             }
                           }
                         }}
                       />
          ) : (
            <p className="text-gray-500">No data available for chart.</p>
          )}
        </div>
    
        {/* Scatter Chart */}
        <div className="bg-white chart p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Placement Distribution</h3>
          {chartData.length > 0 ? (
           <Scatter
  data={{
    datasets: [
      {
        label: 'Placement Distribution',
        data: chartData.map(item => ({
          x: item.team,
          y: item.total_hired
        })),
        backgroundColor: 'rgba(75, 192, 192, 0.6)', // Teal dots
        borderColor: '#fff',
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  }}
  options={{
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: context => {
            return `${context.raw.x}: ${context.raw.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Course'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Total Placed'
        },
        beginAtZero: true
      }
    }
  }}
/>
          ) : (
            <p className="text-gray-500">No data available for chart.</p>
          )}
        </div>
      </div>
      <Card className='chart mt-5'>
        <Line
               data={{
                 labels: chartData.map(item => item.team),
                 datasets: [{
                   label: 'Total Placements',
                   data: chartData.map(item => item.total_hired),
                   fill: false,
                   borderColor: 'rgba(59, 130, 246, 0.7)', // Blue with 0.7 transparency
                   tension: 0.4, // For smooth curves
                   pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                   pointBorderColor: '#fff',
                   pointHoverBackgroundColor: '#fff',
                   pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
                 }]
               }}
               options={{
                 responsive: true,
                 plugins: {
                   legend: {
                     display: true,
                     position: 'top'
                   },
                   tooltip: {
                     mode: 'index',
                     intersect: false,
                   }
                 },
                 scales: {
                   x: {
                     title: {
                       display: true,
                       text: 'Courses'
                     }
                   },
                   y: {
                     beginAtZero: true,
                     title: {
                       display: true,
                       text: 'Placed Students'
                     }
                   }
                 }
               }}
             />
      </Card>
    </div>
</div>
);
}

export default Hr_chart;



