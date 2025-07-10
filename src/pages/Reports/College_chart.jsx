import React, { useState, useEffect, useRef } from 'react';
import { FaDownload, FaShareAlt, FaSyncAlt } from 'react-icons/fa';
import { Bar, Scatter , Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Card from '../../components/Card';
import { AreaChart, Radius } from 'lucide-react';

Chart.register(...registerables);
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

function College_chart() {
  const chartRef = useRef(null);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [course, setCourse] = useState('');
  const [chartData, setChartData] = useState([]);
  const [totalColleges, setTotalColleges] = useState(0);
  const [totalhiring, sethiring] = useState(0);
  const [totalhiringconsultant, sethiringconsultant] = useState(0);
  const [totalcandidates, setotalcandidates] = useState(0);
  const [totalplacedcandidates, setotalplacedcandidates] = useState(0);
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
    "Delhi": ["Delhi", "New Delhi", "Dwarka"]
  };

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


//total payment
useEffect(() => {
  const fetchTotalPayment = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (year) queryParams.append('year', year);
      if (month) queryParams.append('month', month);
      if (state) queryParams.append('state', state);
      if (district) queryParams.append('district', district);
      if (course) queryParams.append('course', course);

      const response = await fetch(`http://localhost:5000/payment-received?${queryParams.toString()}`);
      const data = await response.json();
      setotalpayment(data.total_payment || 0); // Use the correct key 'total_payment' here
    } catch (error) {
      console.error('Error fetching total payment:', error);
    }
  };

  fetchTotalPayment();
}, [year, month, state, district, course]);




  // Dummy fetchChartData implementation (replace with actual API logic)
   const handleUpdateReport = async () => {
    const response = await fetch("http://localhost:5000/chart-data?" + new URLSearchParams({
      year,
      month,
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

  return (
    <div>
      <p className="text-sm sm:text-base md:text-lg text-gray-500 font-semibold mt-1">College Reports</p>

     <Card className="p-5 sm:p-8 md:p-10">
  <div>
    <div className="flex flex-col md:flex-row md:justify-between mb-4 gap-4">
      <p className="text-lg md:text-xl font-bold text-gray-600">Report Filters</p>
      <div className="flex flex-wrap gap-3">
        <button
          className="px-4 py-2 shadow-md hover:bg-gray-700 text-white bg-gray-900 rounded-full flex items-center gap-2"
          onClick={handleExportPDF}
        >
          <FaDownload /> Export
        </button>
        <button className="px-4 py-2 shadow-md hover:bg-gray-700 text-white bg-gray-900 rounded-full flex items-center gap-2">
          <FaShareAlt /> Share
        </button>
      </div>
    </div>

    <p className="font-semibold text-gray-500 mb-5 text-sm sm:text-base">
      Customize your reports by time period, course, and other parameters
    </p>

    <div className="flex flex-wrap gap-4 sm:gap-6 md:gap-10">
      {/* Filters */}
      {[
        {
          label: 'Year',
          value: year,
          onChange: (e) => setYear(e.target.value),
          options: ['', ...years],
        },
        {
          label: 'Months',
          value: month,
          onChange: (e) => setMonth(e.target.value),
          options: ['', 'January', 'March', 'April'],
        },
        {
          label: 'State',
          value: state,
          onChange: (e) => setState(e.target.value),
          options: ['', ...states],
        },
        {
          label: 'City',
          value: district,
          onChange: (e) => setDistrict(e.target.value),
          options: ['', ...(state ? cities[state] || [] : [])],
        },
        {
          label: 'Course Filter',
          value: course,
          onChange: (e) => setCourse(e.target.value),
          options: ['', 'Engineering', 'B.Tech'],
        },
      ].map(({ label, value, onChange, options }, i) => (
        <div key={i} className="w-full sm:w-[48%] md:w-1/6">
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <select
            value={value}
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            {options.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt || `Select ${label}`}
              </option>
            ))}
          </select>
        </div>
      ))}

      <div className="w-full sm:w-auto mt-1">
        <button
          onClick={handleUpdateReport}
          className="px-5 py-3 bg-gray-900 hover:bg-gray-700 shadow-md text-white rounded-full flex items-center gap-2"
        >
          <FaSyncAlt /> Update Reports
        </button>
      </div>
    </div>
  </div>
</Card>


      {/* Stats */}
      <div className="overflow-x-auto">
  <div className="grid grid-cols-4 min-w-[800px] gap-4 mt-5 mb-6">
    <Card className="p-4 text-center">
      <div className="text-lg font-semibold">Total College</div>
      <h3 className="text-xl font-semibold">{totalColleges}</h3>
      <span className="text-green-600 text-sm">+12.5% vs last year</span>
    </Card>
    <Card className="p-4 text-center">
      <div className="text-lg font-semibold">Total Candidates</div>
      <h3 className="text-xl font-semibold">{totalcandidates}</h3>
      <span className="text-green-600 text-sm">+4.2% vs last year</span>
    </Card>
    <Card className="p-4 text-center">
      <div className="text-lg font-semibold">Total Candidates Placed</div>
      <h3 className="text-xl font-semibold">{totalplacedcandidates}</h3>
      <span className="text-blue-600 text-sm">12 colleges engaged</span>
    </Card>
    <Card className="p-4 text-center">
      <div className="text-lg font-semibold">Total Payment Received</div>
      <h3 className="text-xl font-semibold">₹{totalpayment}</h3>
      <span className="text-green-600 text-sm">+18.3% growth</span>
    </Card>
  </div>
</div>

      {/* Charts */}
      
       <div ref={chartRef}>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div  className="bg-white chart  p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Placement by Course</h3>
          {chartData.length > 0 && (
            <Bar
              data={{
                labels: chartData.map(item => item.course),
                datasets: [{
                  label: 'Total Placements',
                  data: chartData.map(item => item.total_placed),
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
          )}
        </div>

        <div  className="bg-white chart  p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Placement Distribution</h3>
          {chartData.length > 0 && (
  <Scatter
    data={{
      datasets: [{
        label: 'Placement Distribution',
        data: chartData.map((item, index) => ({
          x: index, // numeric index for x-axis
          y: item.total_placed,
        })),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      }]
    }}
    options={{
      responsive: true,
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          ticks: {
            callback: function(value) {
              return chartData[value] ? chartData[value].course : value;
            }
          },
          title: {
            display: true,
            text: 'Course'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Total Placed'
          }
        }
      },
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: (context) => {
              const index = context.parsed.x;
              const courseName = chartData[index] ? chartData[index].course : 'Unknown';
              return `${courseName}: ${context.parsed.y}`;
            }
          }
        }
      }
    }}
  />
)}
        </div>
      </div>
      <Card className='chart mt-5'>
          {chartData && chartData.length > 0 && (
              <Line
                data={{
                  labels: chartData.map(item => item.course),
                  datasets: [{
                    label: 'Total Placements',
                    data: chartData.map(item => item.total_placed),
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
            )}
      </Card>
      </div>
    </div>
  );
}

export default College_chart;
