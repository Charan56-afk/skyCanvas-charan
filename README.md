# skyCanvas-charan

Based on the code we have built together, here is the theoretical background of your application, Sky Canvas Weather. You can use this for your project documentation or presentation.

1. Application Overview
Sky Canvas Weather is a responsive, web-based weather dashboard that provides real-time weather data and forecasts for any city worldwide. It uses a Client-Side Rendering (CSR) approach, where the browser (client) fetches data from an API and updates the interface dynamically without reloading the page.

2. Tech Stack & Core Concepts
A. HTML5 (Structure)
Semantic Elements: Uses semantic tags like <header>, <footer>, <div class="main-section"> to define the layout structure clearly.

DOM Structure: The HTML acts as the skeleton. Elements like <h1 class="temp"> are placeholders that get populated by JavaScript.

B. CSS3 (Styling & Design Paradigm)
Glassmorphism: The core design language of your app. It uses semi-transparent backgrounds (rgba(255, 255, 255, 0.2)) paired with backdrop-filter: blur(15px) to create a frosted glass effect, giving a modern, premium feel.

CSS Grid & Flexbox:

Grid: Used for the main layout (Left Column vs. Right Column) and the Highlights section (3x2 grid). This ensures precise 2-dimensional alignment.

Flexbox: Used for one-dimensional layouts like the Search Bar, Weather Header, and Card contents (aligning icons next to text).

Responsive Design (Media Queries): The app uses @media (max-width: 900px) to detect screen size. It automatically switches from a 2-column laptop view to a single-column mobile view, ensuring cross-device compatibility.

Keyframes Animation: The background uses @keyframes gradientBG to cycle through colors, creating a dynamic, living atmosphere.

C. JavaScript (Logic & API Integration)
Asynchronous Programming (async/await): The app uses fetch() to call the OpenWeatherMap API. Since fetching data takes time, await pauses the execution until data arrives, preventing the UI from freezing.

API Integration:

Endpoints: It connects to api.openweathermap.org.

JSON Parsing: The API responds with JSON (JavaScript Object Notation), which the app parses to extract specific details like temp, humidity, and wind.speed.

DOM Manipulation: Once data is fetched, JavaScript selects HTML elements (e.g., document.querySelector(".city")) and injects the new data using .innerHTML.

Geolocation API: The app uses navigator.geolocation to access the user's GPS coordinates, allowing it to load the local weather automatically upon startup.

3. Data Flow Diagram (Theory)
User Action: User types "London" and hits Search.

Request: JavaScript sends an HTTP GET request to OpenWeatherMap with the city name.

Response: The server validates the API key and city, then returns a JSON object containing temperature, wind, etc.

Processing: JavaScript extracts the necessary data points.

Rendering: The DOM is updated with new values, and the relevant weather icon is selected based on the weather condition (e.g., "Clouds" -> Load cloud image).

4. Key Features Explained
Dynamic Backgrounds: The background gradient is CSS-animated, but theoretically, it can be expanded to change based on weather conditions (e.g., Grey for rain, Blue for clear).

Highlights Grid: Displays specific metrics (UV Index, Visibility) in isolated cards for better readability (Data Visualization).

Error Handling: The try...catch block in JavaScript ensures that if a user types a wrong city name (404 Error), the app doesn't crash but instead displays a friendly "Invalid city name" message.
