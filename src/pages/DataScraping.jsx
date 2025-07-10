import React, { useState, useRef, useEffect } from 'react';
import Card from '../components/Card';


function DataScraping() {
  const [activeTab, setActiveTab] = useState('scrape');
  const [selectedSite, setSelectedSite] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [customState, setCustomState] = useState('');
  const [customStream, setCustomStream] = useState('');
  const [scrapedData, setScrapedData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [finalFile, setFinalFile] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const fileInputRef = useRef(null);
  const [commonState, setCommonState] = useState([]);
  const [File, setFile] = useState([]);

  const states = ["Andaman and Nicobar Islands","Andhra Pradesh","Arunachal Pradesh",
  "Assam","Bihar","Chandigarh","Chhattisgarh","Delhi", "Goa","Gujarat","Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka","Kerala","Ladakh",
  "Lakshadweep","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Puducherry","Rajasthan","Sikkim","Tamil Nadu","Telangana","The Dadra and Nagar Haveli and Daman and Diu", "Tripura","Uttar Pradesh","West Bengal",
];

  const cities = {
    "Andhra Pradesh": ["Alluri Sitharama Raju","Anakapalli","Ananthapuramu","Annamayya","Bapatla","Chittoor","Dr. B.R. Ambedkar Konaseema","East Godavari","Eluru","Guntur","Kakinada","Krishna","Kurnool","NTR","Nandyal","Palnadu","Parvathipuram Manyam","Prakasam","Sri Potti Sriramulu Nellore","Sri Sathya Sai","Srikakulam","Tirupati","Visakhapatnam","Vizianagaram","West Godavari","Y.S.R."],
    "Maharashtra": ["Ahmednagar","Akola","Amravati","Beed","Bhandara","Buldhana","Chandrapur","Chhatrapati Sambhajinagar","Dharashiv","Dhule","Gadchiroli","Gondia","Hingoli","Jalgaon","Jalna","Kolhapur","Latur","Mumbai","Mumbai Suburban","Nagpur","Nanded","Nandurbar","Nashik","Palghar","Parbhani","Pune","Raigad","Ratnagiri","Sangli","Satara","Sindhudurg","Solapur","Thane","Wardha","Washim","Yavatmal"],
    "Karnataka": ["Bagalkote","Ballari","Belagavi","Bengaluru Rural","Bengaluru Urban","Bidar","Chamarajanagara","Chikkaballapura","Chikkamagaluru","Chitradurga","Dakshina Kannada","Davangere","Dharwad","Gadag","Hassan","Haveri","Kalaburagi","Kodagu","Kolar","Koppal","Mandya","Mysuru","Raichur","Ramanagara","Shivamogga","Tumakuru","Udupi","Uttara Kannada","Vijayanagar","Vijayapura","Yadgir"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Vellore", "Erode", "Tirunelveli"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Malda", "Naihati"],
    "Delhi": ["Central","East","New Delhi","North","North East","North West","Shahdara","South","South East","South West","West"],
    "Gujarat": ["Ahmedabad","Amreli","Anand","Arvalli","Banas Kantha","Bharuch","Bhavnagar","Botad","Chhotaudepur","Dahod","Dangs","Devbhumi Dwarka","Gandhinagar","Gir Somnath","Jamnagar","Junagadh","Kachchh","Kheda","Mahesana","Mahisagar","Morbi","Narmada","Navsari","Panch Mahals","Patan","Porbandar","Rajkot","Sabar Kantha","Surat","Surendranagar","Tapi","Vadodara","Valsad"],
    "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur", "Kota", "Ajmer", "Bikaner", "Alwar", "Bhilwara"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Allahabad (Prayagraj)", "Ghaziabad", "Bareilly", "Aligarh", "Moradabad"],
    "Madhya Pradesh": ["Agar-Malwa","Alirajpur","Anuppur","Ashoknagar","Balaghat","Barwani","Betul","Bhind","Bhopal","Burhanpur","Chhatarpur","Chhindwara","Damoh","Datia","Dewas","Dhar","Dindori","Guna","Gwalior","Harda","Indore","Jabalpur","Jhabua","Katni","Khandwa (East Nimar)","Khargone (West Nimar)","Maihar","Mandla","Mandsaur","Mauganj","Morena","Narmadapuram","Narsimhapur","Neemuch","Niwari","Pandhurna","Panna","Raisen","Rajgarh","Ratlam","Rewa","Sagar","Satna","Sehore","Seoni","Shahdol","Shajapur","Sheopur","Shivpuri","Sidhi","Singrauli","Tikamgarh","Ujjain","Umaria","Vidisha"],
    "Bihar": ["Araria","Arwal","Aurangabad","Banka","Begusarai","Bhagalpur","Bhojpur","Buxar","Darbhanga","Gaya","Gopalganj","Jamui","Jehanabad","Kaimur (Bhabua)","Katihar","Khagaria","Kishanganj","Lakhisarai","Madhepura","Madhubani","Munger","Muzaffarpur","Nalanda","Nawada","Pashchim Champaran","Patna","Purbi Champaran","Purnia","Rohtas","Saharsa","Samastipur","Saran","Sheikhpura","Sheohar","Sitamarhi","Siwan","Supaul","Vaishali"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Puri", "Sambalpur", "Berhampur", "Balasore", "Bhadrak"],
    "Chandigarh": ["Chandigarh"], 
    "Himachal Pradesh": ["Bilaspur","Chamba","Hamirpur","Kangra","Kinnaur","Kullu","Lahaul And Spiti","Mandi","Shimla","Sirmaur","Solan","Una"],
    "Jharkhand": ["Bokaro","Chatra","Deoghar","Dhanbad","Dumka","East Singhbum","Garhwa","Giridih","Godda","Gumla","Hazaribagh","Jamtara","Khunti","Koderma","Latehar","Lohardaga","Pakur","Palamu","Ramgarh","Ranchi","Sahebganj","Saraikela Kharsawan","Simdega","West Singhbhum"],
    "Kerala": ["Alappuzha","Ernakulam","Idukki","Kannur","Kasaragod","Kollam","Kottayam","Kozhikode","Malappuram","Palakkad","Pathanamthitta","Thiruvananthapuram","Thrissur","Wayanad"],
   "Arunachal Pradesh": ["Anjaw","Changlang","Dibang Valley","East Kameng","East Siang","Kamle","Kra Daadi","Kurung Kumey","Leparada","Lohit","Longding","Lower Dibang Valley","Lower Siang","Lower Subansiri","Namsai","Pakke Kessang","Papum Pare","Shi Yomi","Siang","Tawang","Tirap","Upper Siang","Upper Subansiri","West Kameng","West Siang"],
   "Goa": ["North Goa","South Goa"],
    "Assam": ["Bajali","Baksa","Barpeta","Biswanath","Bongaigaon","Cachar","Charaideo","Chirang","Darrang","Dhemaji","Dhubri","Dibrugarh","Dima Hasao","Goalpara","Golaghat","Hailakandi","Hojai","Jorhat","Kamrup","Kamrup Metro","Karbi Anglong","Karimganj","Kokrajhar","Lakhimpur","Majuli","Marigaon","Nagaon","Nalbari","Sivasagar","Sonitpur","South Salmara Mancachar","Tamulpur","Tinsukia","Udalguri","West Karbi Anglong"
],
    "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip"],
    "Meghalaya": ["EASTERN WEST KHASI HILLS","East Garo Hills","East Jaintia Hills","East Khasi Hills","North Garo Hills","Ri Bhoi","South Garo Hills","South West Garo Hills","South West Khasi Hills","West Garo Hills","West Jaintia Hills","West Khasi Hills"
],
    "Manipur": ["Bishnupur","Chandel","Churachandpur","Imphal East","Imphal West","Jiribam","Kakching","Kamjong","Kangpokpi","Noney","Pherzawl","Senapati","Tamenglong","Tengnoupal","Thoubal","Ukhrul"],
    "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Wokha"],
    "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan"],
    "Andaman and Nicobar Islands": ["Nicobars", "North and Middle Andaman", "South Andamans"],
    "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
    "Ladakh": ["Leh", "Kargil", "Diskit", "Padum", "Kargil","Leh Ladakh"],
    "Jammu and Kashmir": ["Anantnag","Bandipora","Baramulla","Budgam","Doda","Ganderbal","Jammu","Kathua","Kishtwar","Kulgam","Kupwara","Poonch","Pulwama","Rajouri","Ramban","Reasi","Samba","Shopian","Srinagar","Udhampur"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Ambikapur"],
    "Haryana": ["Ambala","Bhiwani","Charki Dadri","Faridabad","Fatehabad","Gurugram","Hisar","Jhajjar","Jind","Kaithal","Karnal","Kurukshetra","Mahendragarh","Nuh","Palwal","Panchkula","Panipat","Rewari","Rohtak","Sirsa","Sonipat","Yamunanagar"
],
    "The Dadra and Nagar Haveli and Daman and Diu": ["Silvassa", "Daman", "Diu"],
    "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Ambassa"],
    "Lakshadweep": ["Kavaratti", "Agatti", "Minicoy"] 
};
const availableCities = customState ? cities[customState] || [] : [];

const streams = ["MBA/PGDM","B.Sc", "B.Com", "BA", "BE/B.Tech", "BBA/BMS", "M.Sc", "BCA", "MA", "ME/M.Tech", "B.Ed", "Polytechnic", "M.Com", "MCA", "M.Phil/Ph.D in Science", "BE/B.Tech Lateral", "B.Pharm", "B.Sc (Nursing)", "M.Phil/Ph.D in Arts", "M.Phil/Ph.D in Engineering", "M.Phil/Ph.D in Management", "M.Pharm", "LLB", "BA/BBA LLB", "B.Des", "GNM", "M.Phil/Ph.D in Commerce", "BHM", "LLM", "M.Ed", "BMM", "M.Phil/Ph.D in Pharmacy", "B.Pharma (Lateral)", "MBBS", "M.Sc (Nursing)", "MD", "Bachelor of Physiotherapy (BPT)", "B.Sc (Agriculture)", "B.Sc (Medicine)", "MSW", "BMLT", "MS", "Bachelors in Vocational Courses", "B.Arch", "M.Phil/Ph.D in Law", "M.Phil/Ph.D in Education", "BDS", "D.El.Ed", "M.Phil/Ph.D in Medicine", "M.Sc (Agriculture)", "MMC", "M.Sc (Medicine)", "DMLT", "B.P.Ed", "MDS", "Bachelor of Animation", "Master of Physiotherapy (MPT)", "Executive MBA", "ANM", "M.Des", "D.Ed", "M.Phil/Ph.D in Agriculture", "MCA (Lateral)", "BHM (Hospital)", "BAMS", "BSW", "BFA", "M.Phil/Ph.D in Mass Communication", "Bachelor in Aviation", "M.Ch", "Diploma in Engineering", "M.P.Ed", "M.Phil/Ph.D in Computer Applications", "MHM", "M.Arch", "MPH", "BHMS", "M.Phil/Ph.D in Paramedical", "MHA", "MMS", "Diplomate National Board [DNB]", "M.Phil/Ph.D in Architecture", "M.Phil/Ph.D in Design"
];
  useEffect(() => {
    fetch('http://localhost:5000/distinct')
      .then(response => response.json())
      .then(data => setFile(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handleScrape = async () => {
    if (selectedSite === "AISHE") {
      if (!customState || !customCity) {
        alert("Please select a state and city.");
        return;
      }
    } else {
      if (!customState || !customCity || !customStream) {
        alert("Please select a state, city, and stream.");
        return;
      }
    }

    setLogs(["Scraping has started..."]);
    setFinalFile('');
    setIsScraping(true);

    try {
      const response = await fetch('http://localhost:5000/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site: selectedSite,
          state: customState,
          city: customCity,
          stream: selectedSite === "College Dunia" ? customStream : undefined
        })
      });

      const data = await response.json();
      setScrapedData(data.results);
      if (data.fileName) setFinalFile(data.fileName);

      setLogs(prevLogs => [...prevLogs, "Scraping done!"]);
    } catch (error) {
      console.error("Scraping Error:", error.message);
      setLogs(prevLogs => [...prevLogs, "Error occurred while scraping. Please try again."]);
      alert("Error occurred while scraping. Please try again.");
    } finally {
      setIsScraping(false);
    }
  };


   // New function to handle stopping the scraping process
  const handleStopScrape = async () => {
    setLogs(prevLogs => [...prevLogs, "Attempting to stop scraping..."]);
    setIsScraping(false); // Optimistically set to false in UI

    try {
      const response = await fetch('http://localhost:5000/stop_scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setLogs(prevLogs => [...prevLogs, data.message]);
    } catch (error) {
      console.error("Stop Scraping Error:", error.message);
      setLogs(prevLogs => [...prevLogs, "Error trying to stop scraping. It might still be running."]);
    }
  };


  const handleUpload = async () => {
    if (!fileInputRef.current.files[0]) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileInputRef.current.files[0]);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to upload file.");
    }
  };






  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-5">Educational Data Scraping</h1>
      <p className="text-sm sm:text-base md:text-lg text-gray-500 font-semibold mt-1">Gather educational institution data for targeted marketing campaigns</p>

        <div className="flex flex-wrap justify-between items-center mt-5 mb-4 gap-3">
  <div className="flex flex-wrap gap-4">
    <button
      onClick={() => setActiveTab('scrape')}
      className={`px-4 py-2 shadow-md rounded-lg transition ${
        activeTab === 'scrape'
          ? 'bg-gray-900 text-white hover:bg-gray-700'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      Data Scrape
    </button>
    <button
      onClick={() => setActiveTab('history')}
      className={`px-4 py-2 shadow-md rounded-lg transition ${
        activeTab === 'history'
          ? 'bg-gray-900 text-white hover:bg-gray-700'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      Scrape History
    </button>
  </div>
  <button
    className="px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white rounded-lg shadow-md transition"
    onClick={() => window.location.reload()}
  >
    🔄 Refresh Data
  </button>
</div>

      <Card className="bg-white shadow-md rounded-2xl p-6 mb-8 w-full">
  <div className="space-y-6">
    {activeTab === 'scrape' ? (
      <div>
        <p className="text-xl font-bold text-gray-600 mb-5">
          Collect educational institution data from various sources
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-1">Data Source</label>
            <select
              value={selectedSite}
              onChange={(e) => {
                setSelectedSite(e.target.value);
                setCustomState('');
                setCustomCity('');
                setCustomStream('');
              }}
              className="mt-1 block w-full h-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>
                Select a Site
              </option>
              <option value="AISHE">AISHE</option>
              <option value="College Dunia">College Dunia</option>
            </select>
          </div>

          <div>
            <label className="block text-xl font-medium text-gray-700 mb-1">State</label>
            <select
              value={customState}
              onChange={(e) => {
                setCustomState(e.target.value);
                setCustomCity('');
              }}
              className="mt-1 block w-full h-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a State</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {availableCities.length > 0 && (
            <div>
              <label className="block text-xl font-medium text-gray-700 mb-1">City</label>
              <select
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a City</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedSite === 'College Dunia' && (
            <div>
              <label className="block text-xl font-medium text-gray-700 mb-1">Stream</label>
              <select
                value={customStream}
                onChange={(e) => setCustomStream(e.target.value)}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Stream</option>
                {streams.map((stream) => (
                  <option key={stream} value={stream}>
                    {stream}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={handleScrape}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
            disabled={isScraping}
          >
            {isScraping ? 'Scraping...' : 'Start Scraping'}
          </button>

        
        </div>
      </div>
    ) : (
      <div>
        <h2 className="text-2xl font-semibold mb-2">Scrape History</h2>
        <p className="text-gray-700 mb-4">View previously scraped data</p>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border-b border-gray-300">File Name</th>
              </tr>
            </thead>
            <tbody>
              {File.map((item, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-4 py-2 border-b border-gray-300">{item.File}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
</Card>


      <Card className="mt-5 p-6 bg-white shadow-md rounded-2xl">
  <p className="text-xl font-bold text-gray-600 mb-5">Latest Scraped File</p>
  {finalFile ? (
    <p className="text-xl text-green-700 flex items-center gap-2">
      <span>✅</span>
      Final file ready: <strong>{finalFile}</strong>
    </p>
  ) : (
    <p className="text-gray-500 italic">No file scraped yet.</p>
  )}
</Card>

    </div>
  );
}

export default DataScraping;
