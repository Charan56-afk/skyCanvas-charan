const apikey = "c1c4e900c5a9fbac7d97ddec32761393";
const searchBox = document.querySelector(".search-bar input");
const searchBtn = document.querySelector(".search-bar button");
const weatherIcon = document.querySelector(".weather-icon");

// 1. Update Date & Time
function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', hour: '2-digit', minute: '2-digit' };
    document.getElementById('datetime').innerText = now.toLocaleDateString('en-US', options);
}
setInterval(updateDateTime, 1000);

// 2. Main Function to Update Screen
function displayWeatherData(data) {
    // Save city so we can recall it if we come back from a detail page
    localStorage.setItem("weatherCity", data.name);
    // Save Wind Data for the Detail Page
    localStorage.setItem("savedWindSpeed", data.wind.speed);
    localStorage.setItem("savedWindDeg", data.wind.deg);

    // --- MAIN DISPLAY UPDATES ---
    // We use a helper function now so we can reuse it when clicking forecast cards
    updateMainDisplay(data.name, data.main.temp, data.weather[0].description, data.weather[0].main, data.main.temp_max, data.main.temp_min);

    // --- OTHER METRICS ---
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".humidity-bar").style.width = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

    if(document.querySelector(".visibility")) {
        document.querySelector(".visibility").innerHTML = (data.visibility / 1000).toFixed(1) + " km";
    }
    if(document.querySelector(".pressure")) {
        document.querySelector(".pressure").innerHTML = data.main.pressure + " hPa";
    }

    // --- UV & AQI Logic ---
    const nowTime = Math.floor(Date.now() / 1000);
    let estimatedUV = 0;
    if (nowTime > data.sys.sunrise && nowTime < data.sys.sunset) {
        estimatedUV = Math.max(1, Math.round((100 - data.clouds.all) / 10));
    }
    const uvDashElement = document.getElementById("uv-dashboard-value");
    if(uvDashElement) uvDashElement.innerText = estimatedUV;

    if (data.coord) {
        getAirQuality(data.coord.lat, data.coord.lon);
    }
    
    // --- UPDATED: Pass the FULL data object here for the clickable forecast ---
    updateHourlyForecast(data);

    document.querySelector(".current-weather").style.display = "block";
    document.querySelector(".error").style.display = "none";
}

// --- NEW: Helper to update the big Main Display ---
function updateMainDisplay(title, temp, conditionDesc, conditionMain, high, low) {
    document.querySelector(".city").innerHTML = title;
    document.querySelector(".temp").innerHTML = Math.round(temp) + "°";
    document.querySelector(".condition").innerHTML = conditionDesc;
    document.querySelector(".high-low").innerHTML = `H:${Math.round(high)}° L:${Math.round(low)}°`;
    updateIcon(conditionMain);
}

// 3. Helper Functions
async function getAirQuality(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apikey}`);
        const data = await response.json();
        const aqi = data.list[0].main.aqi;

        const aqiValElement = document.getElementById("aqi-dashboard-value");
        if(aqiValElement) aqiValElement.innerText = aqi;

        const aqiStatusElement = document.getElementById("aqi-dashboard-status");
        if(aqiStatusElement) {
            const statusMap = { 1: "Good", 2: "Fair", 3: "Moderate", 4: "Poor", 5: "Very Poor" };
            aqiStatusElement.innerText = statusMap[aqi];
        }
    } catch (error) { console.error("Error fetching AQI:", error); }
}

// --- UPDATED: Clickable Hourly Forecast Logic ---
function updateHourlyForecast(fullData) {
    const container = document.getElementById("forecast-container");
    if(!container) return; 
    container.innerHTML = ""; 

    const now = new Date();
    let currentHour = now.getHours();
    
    // Grab base data from the API response
    let baseTemp = Math.round(fullData.main.temp);
    let baseCondition = fullData.weather[0].main;
    let baseDesc = fullData.weather[0].description;
    
    for (let i = 0; i < 5; i++) {
        const card = document.createElement("div");
        card.classList.add("f-card");
        
        // Data for this specific hour
        let displayTime = "Now";
        let displayTemp = baseTemp; 
        let displayCondition = baseCondition;
        let iconSrc = getIconSrc(baseCondition);

        // Simulation Logic for future hours (creating fake future data based on current)
        if (i > 0) {
            let nextHour = currentHour + i;
            let ampm = nextHour >= 12 && nextHour < 24 ? "PM" : "AM";
            let displayHour = nextHour % 12;
            if (displayHour === 0) displayHour = 12;
            if (nextHour >= 24) ampm = "AM"; 
            displayTime = `${displayHour} ${ampm}`;
            
            // Simulating a slight temp change for realism
            displayTemp = baseTemp - (i % 2); 
        }

        // Set the first card active by default
        if (i === 0) card.classList.add("active");

        // HTML for the card
        card.innerHTML = `<p>${displayTime}</p><img src="${iconSrc}" width="30"><p>${displayTemp}°</p>`;
        
        // --- CLICK EVENT: Update Main Screen ---
        card.addEventListener("click", () => {
            // 1. Remove 'active' class from all cards
            document.querySelectorAll(".f-card").forEach(c => c.classList.remove("active"));
            
            // 2. Add 'active' to THIS card
            card.classList.add("active");

            // 3. Update the Main Display
            if (i === 0) {
                // If "Now" is clicked, restore original Live Data
                updateMainDisplay(fullData.name, fullData.main.temp, baseDesc, baseCondition, fullData.main.temp_max, fullData.main.temp_min);
            } else {
                // If a future hour is clicked, show Forecast Preview
                updateMainDisplay(`Forecast: ${displayTime}`, displayTemp, baseDesc, displayCondition, fullData.main.temp_max, fullData.main.temp_min);
            }
        });

        container.appendChild(card);
    }
}

// --- NEW: Helper to get Icon Source (Cleaner code) ---
function getIconSrc(condition) {
    if (condition == "Clouds") return "pngtree-happy-happy-happy-clouds-drawing-design-vector-png-image_6745743.png";
    else if (condition == "Rain") return "heavy-rain.png";
    else if (condition == "Snow") return "download-_2_.png";
    else if (condition == "Drizzle") return "OIP.png";
    else if (condition == "Mist") return "https://cdn-icons-png.flaticon.com/512/3313/3313986.png";
    return "clear-sky.png";
}

// Used by Main Display to update the big icon
function updateIcon(condition) {
    weatherIcon.src = getIconSrc(condition);
}

// 4. Fetching Logic
async function checkWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?units=metric&q=${city}&appid=${apikey}`);
        if (response.status == 404) {
            document.querySelector(".error").style.display = "block";
            document.querySelector(".current-weather").style.display = "none";
        } else {
            const data = await response.json();
            displayWeatherData(data);
        }
    } catch (error) { console.error(error); }
}

async function checkWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${lat}&lon=${lon}&appid=${apikey}`);
        const data = await response.json();
        displayWeatherData(data);
    } catch (error) { console.error(error); }
}

function getDeviceLocation() {
    document.querySelector(".city").innerHTML = "Locating...";
    document.querySelector(".temp").innerHTML = "--°";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => checkWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
            (err) => checkWeather("Eluru")
        );
    } else {
        checkWeather("Eluru");
    }
}

// Listeners
searchBtn.addEventListener("click", () => checkWeather(searchBox.value));
searchBox.addEventListener("keypress", (e) => { if (e.key === "Enter") checkWeather(searchBox.value); });

// ============================================
//  NEW: CARD CLICK LISTENERS (For "Back" Logic)
// ============================================
// Find all highlight cards and add a "flag" when clicked
const cards = document.querySelectorAll('.highlight-card');
cards.forEach(card => {
    card.addEventListener('click', () => {
        // Set a temporary flag saying "We are leaving the home page"
        sessionStorage.setItem("returningFromDetail", "true");
    });
});

// ============================================
//  SMART STARTUP LOGIC
// ============================================
function init() {
    updateDateTime();

    // Check if the "flag" exists
    const isReturning = sessionStorage.getItem("returningFromDetail");
    const savedCity = localStorage.getItem("weatherCity");

    if (isReturning && savedCity) {
        // CASE: Back Button Pressed (Flag found)
        // 1. Clear the flag immediately (so next refresh acts normal)
        sessionStorage.removeItem("returningFromDetail");
        // 2. Load the saved city
        console.log("Welcome back! Loading saved city: " + savedCity);
        checkWeather(savedCity);
    } else {
        // CASE: Refresh, New Tab, or First Visit (No flag found)
        // Force GPS Check
        console.log("Fresh load. Checking Location...");
        getDeviceLocation();
    }

}



// =========================================
//  REVIEW SURVEY LOGIC
// =========================================

const modal = document.getElementById("survey-modal");
const btn = document.getElementById("open-survey-btn");
const closeSpan = document.querySelector(".close-modal");
const form = document.getElementById("feedback-form");

// Open Modal
if(btn) {
    btn.onclick = function() {
        modal.style.display = "flex"; // Using flex to center it
    }
}

// Close Modal (X button)
if(closeSpan) {
    closeSpan.onclick = function() {
        modal.style.display = "none";
    }
}

// Close Modal (Click outside)
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Handle Form Submission
if(form) {
    form.onsubmit = function(e) {
        e.preventDefault(); // Stop actual page reload
        
        // You can save this data to a database later.
        // For now, we just show a thank you alert.
        alert("Thank you for your feedback! We appreciate it.");
        
        modal.style.display = "none";
        form.reset(); // Clear the form
    }
}

init();