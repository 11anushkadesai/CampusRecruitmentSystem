import React, { useState, useEffect, useRef } from 'react';
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

function Marketing_chart() {
  const [activeTab, setActiveTab] = useState('college');
  const [team, setteam] = useState('');
  const [proposal, setproposal] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [course, setCourse] = useState('');
  const [chartData, setChartData] = useState([]);
  const [totalColleges, setTotalColleges] = useState(0);
  const [totalhiring, sethiring] = useState(0);
  const [totalhiringconsultant, sethiringconsultant] = useState(0);
  const [totalpayment, setotalpayment] = useState(0);
  const years = ["2023", "2022", "2021"];
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

    //  total colleges on mount
  useEffect(() => {
    const fetchCollegeCount = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (team) queryParams.append('team', team);
        if (proposal) queryParams.append('proposal', proposal);
        if (state) queryParams.append('state', state);
        if (district) queryParams.append('district', district);
        
  
        const response = await fetch(`http://localhost:5000/total-clg?${queryParams.toString()}`);
        const data = await response.json();
        setTotalColleges(data.total);
      } catch (error) {
        console.error('Error fetching college count:', error);
      }
    };
  
    fetchCollegeCount();
  }, [team, proposal, state, district]); 


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



  const handleUpdateReport = async () => {
    const response = await fetch("http://localhost:5000/marketing_chart?" + new URLSearchParams({
      team,
      proposal,
      state,
      district,
      course
    }), {
      method: "GET", // Use GET for fetching data
      headers: { "Content-Type": "application/json" }
    });
    const data = await response.json();
    setChartData(data.chartData); // Assuming the backend sends { chartData: [...] }
  };


  // total hiring college 
    
    useEffect(() => {
      fetch('http://localhost:5000/hiring-clg')
        .then(response => response.json())
        .then(data => {
          console.log("Hiring Colleges API Response:", data);
          sethiring(data.total); // Ensure `total` exists in response
        })
        .catch(error => console.error('Error fetching data:', error));
    }, []);
    
     // total hiring college from consultant
    
    useEffect(() => {
      fetch('http://localhost:5000/hiring-clg-consultant')
        .then(response => response.json())
        .then(data => {
          console.log("Hiring Colleges API Response:", data);
          sethiringconsultant(data.total); // Ensure `total` exists in response
        })
        .catch(error => console.error('Error fetching data:', error));
    }, []);
  

    //total payment
    useEffect(() => {
      const fetchTotalPayment = async () => {
        try {
          const queryParams = new URLSearchParams();
          if (team) queryParams.append('team', team);
          if (proposal) queryParams.append('proposal', proposal);
          if (state) queryParams.append('state', state);
          if (district) queryParams.append('district', district);
          
    
          const response = await fetch(`http://localhost:5000/total-payment?${queryParams.toString()}`);
          const data = await response.json();
          setotalpayment(data.total_payment || 0); // Use the correct key 'total_payment' here
        } catch (error) {
          console.error('Error fetching total payment:', error);
        }
      };
    
      fetchTotalPayment();
    }, [team, proposal, state, district, course]);

  return (
    <div>
      
      {/* Filter Card */}
      <p className="text-xl font-semibold text-gray-900 mb-5">Marketing Reports </p>

      <Card className="p-6 sm:p-10 max-w-full">
  <div>
    <div className="flex flex-col sm:flex-row sm:justify-between mb-4 gap-4 sm:gap-0">
      <p className="text-xl font-bold text-gray-600">Report Filters</p>
      <div className="flex space-x-4 justify-start sm:justify-end">
        <button
          type="button"
          className="px-4 py-2 shadow-md hover:bg-gray-700 text-white bg-gray-900 rounded-full flex items-center"
          onClick={handleExportPDF}
        >
          <FaDownload className="mr-2" /> Export
        </button>
        <button
          type="button"
          className="px-4 py-2 shadow-md hover:bg-gray-700 text-white bg-gray-900 rounded-full flex items-center"
        >
          <FaShareAlt className="mr-2" /> Share
        </button>
      </div>
    </div>

    <p className="font-semibold text-gray-500 mb-5">
      Customize your reports by time period, course and other parameters
    </p>

    <div>
      {/* Filters container */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-6 overflow-x-auto">
        {/* State */}
        <div className="w-full sm:w-52">
          <label htmlFor="state-select" className="block text-xl font-medium text-gray-700 mb-1">
            State
          </label>
          <select
            id="state-select"
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

        {/* City */}
        <div className="w-full sm:w-52">
          <label htmlFor="city-select" className="block text-xl font-medium text-gray-700 mb-1">
            City
          </label>
          <select
            id="city-select"
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

        {/* Team */}
        <div className="w-full sm:w-52">
          <label htmlFor="team-select" className="block text-xl font-medium text-gray-700 mb-1">
            Team
          </label>
          <select
            id="team-select"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Select Team</option>
            <option value="Netrali">Netrali</option>
            <option value="Sakshi">Sakshi</option>
            <option value="Tejal">Tejal</option>
          </select>
        </div>

        {/* Proposal */}
        <div className="w-full sm:w-52">
          <label htmlFor="proposal-select" className="block text-xl font-medium text-gray-700 mb-1">
            Send Proposal?
          </label>
          <select
            id="proposal-select"
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">ALL</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      </div>

      {/* Button below filters */}
      <div className="mt-8 flex justify-start sm:justify-end">
        <button
          type="button"
          onClick={handleUpdateReport}
          className="px-6 py-3 bg-gray-900 hover:bg-gray-700 shadow-md text-white rounded-full flex items-center"
        >
          <FaSyncAlt className="mr-2" /> Update Reports
        </button>
      </div>
    </div>
  </div>
</Card>


      {/* Stats */}
      <div className="overflow-x-auto">
  <div className="grid grid-cols-4 min-w-[800px] gap-4 mt-5 mb-6">
  <Card className="p-4 text-center">
    <div className="text-lg font-semibold">Total Colleges</div>
    <h3 className="text-xl font-semibold">{totalColleges}</h3>
    <span className="text-green-600 text-sm">+12.5% vs last year</span>
  </Card>
  
  <Card className="p-4 text-center">
    <div className="text-lg font-semibold">Total Colleges interested in hiring</div>
    <h3 className="text-xl font-semibold">{totalhiring}</h3>
    <span className="text-green-600 text-sm">+4.2% vs last year</span>
  </Card>
  
  <Card className="p-4 text-center">
    <div className="text-lg font-semibold">Total Colleges interested in hiring</div>
    <div className="text-m font-semibold">From Talent corner</div>
    <h3 className="text-xl font-semibold">{totalhiringconsultant}</h3>
    <span className="text-blue-600 text-sm">12 Marketings engaged</span>
  </Card>
  
  <Card className="p-4 text-center">
    <div className="text-lg font-semibold">Total Payment</div>
    <h3 className="text-xl font-semibold">₹{totalpayment}</h3>
    <span className="text-green-600 text-sm">+18.3% growth</span>
  </Card>
</div>
      </div>


    
      {/* Charts Section */}
<div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    {/* Bar Chart */}
    <div className="bg-white chart p-6 rounded-lg shadow-md h-40 sm:h-56 lg:h-72">
      <h3 className="text-xl font-semibold mb-4">Placement by Course</h3>
      {chartData.length > 0 ? (
        <Bar
          data={{
            labels: chartData.map((item) => item.team),
            datasets: [
              {
                label: 'Total Placements',
                data: chartData.map((item) => item.total_college),
                backgroundColor: 'rgba(190, 178, 198, 0.7)',
                borderWidth: 1,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          }}
          // width and height here are optional, the container controls size now
        />
      ) : (
        <p className="text-gray-500">No data available for chart.</p>
      )}
    </div>

    {/* Scatter Chart */}
    <div className="bg-white chart p-6 rounded-lg shadow-md h-40 sm:h-56 lg:h-72">
      <h3 className="text-xl font-semibold mb-4">Placement Distribution</h3>
      {chartData.length > 0 ? (
        <Scatter
          data={{
            datasets: [
              {
                label: 'Total Colleges',
                data: chartData.map((item) => ({
                  x: item.team,
                  y: item.total_college,
                })),
                backgroundColor: 'rgba(59, 130, 246, 1)',
                borderColor: 'rgba(59, 130, 246, 0.7)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' },
              tooltip: { mode: 'nearest', intersect: false },
            },
            scales: {
              x: {
                type: 'category',
                title: { display: true, text: 'Courses' },
              },
              y: {
                beginAtZero: true,
                title: { display: true, text: 'Placed Students' },
              },
            },
          }}
        />
      ) : (
        <p className="text-gray-500">No data available for chart.</p>
      )}
    </div>
  </div>

  {/* Line Chart */}
  <Card className="chart mt-5 p-6 rounded-lg shadow-md h-40 sm:h-56 lg:h-72">
    <Line
      data={{
        labels: chartData.map((item) => item.team),
        datasets: [
          {
            label: 'Total Colleges',
            data: chartData.map((item) => item.total_college),
            fill: false,
            borderColor: 'rgba(59, 130, 246, 0.7)',
            tension: 0.4,
            pointBackgroundColor: 'rgba(59, 130, 246, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: {
            title: { display: true, text: 'Courses' },
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Placed Students' },
          },
        },
      }}
    />
  </Card>
</div>

    
</div>
);
}

export default Marketing_chart;



