
const themeButton = document.getElementById("themeToggle");

themeButton.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        themeButton.textContent = "Switch to Light Mode";
    } else {
        themeButton.textContent = "Switch to Dark Mode";
    }
});

const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const chatSend = document.getElementById("chatSend");

function addChatMessage(message, className) {
    const paragraph = document.createElement("p");
    paragraph.className = className;
    paragraph.textContent = message;
    chatMessages.appendChild(paragraph);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const message = chatInput.value.trim();
    if (!message) return;

    addChatMessage(message, "user-message");
    chatInput.value = "";
    chatSend.disabled = true;
    chatSend.textContent = "Sending...";

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "The request failed."
            );
        }

        addChatMessage(data.reply, "bot-message");

    } catch (error) {
        addChatMessage(
            error.message ||
            "Sorry, the chatbot is unavailable. Please try again.",
            "bot-message"
        );
    } finally {
        chatSend.disabled = false;
        chatSend.textContent = "Send";
        chatInput.focus();
    }
});

const weatherButton = document.getElementById("weather-btn");
const cityInput = document.getElementById("city-input");
const weatherStatus = document.getElementById("weather-status");
const weatherResult = document.getElementById("weather-result");

function getWeatherDescription(code) {
  const conditions = {
    0: "Clear sky ☀️",
    1: "Mainly clear 🌤️",
    2: "Partly cloudy ⛅",
    3: "Overcast ☁️",
    45: "Foggy 🌫️",
    48: "Foggy with frost 🌫️",
    51: "Light drizzle 🌦️",
    53: "Moderate drizzle 🌦️",
    55: "Dense drizzle 🌧️",
    61: "Light rain 🌧️",
    63: "Moderate rain 🌧️",
    65: "Heavy rain 🌧️",
    71: "Light snow ❄️",
    73: "Moderate snow ❄️",
    75: "Heavy snow ❄️",
    80: "Rain showers 🌦️",
    81: "Moderate rain showers 🌧️",
    82: "Heavy rain showers 🌧️",
    95: "Thunderstorm ⛈️",
    96: "Thunderstorm with hail ⛈️",
    99: "Thunderstorm with heavy hail ⛈️"
  };

  return conditions[code] || "Weather conditions unavailable";
}

async function searchWeather() {
  const city = cityInput.value.trim();

  if (!city) {
    weatherStatus.textContent = "Please enter a city name.";
    weatherResult.hidden = true;
    return;
  }

  weatherButton.disabled = true;
  weatherStatus.textContent = "Searching for weather...";
  weatherResult.hidden = true;

  try {
    // Step 1: Find the city's coordinates
    const geoUrl =
      "https://geocoding-api.open-meteo.com/v1/search?name=" +
      encodeURIComponent(city) +
      "&count=1&language=en&format=json";

    const geoResponse = await fetch(geoUrl);

    if (!geoResponse.ok) {
      throw new Error("Could not search for this city.");
    }

    const geoData = await geoResponse.json();
    const place = geoData.results?.[0];

    if (!place) {
      weatherStatus.textContent =
        "City not found. Please check the spelling and try again.";
      return;
    }

    // Step 2: Get the current weather
    const weatherUrl =
      "https://api.open-meteo.com/v1/forecast?latitude=" +
      place.latitude +
      "&longitude=" +
      place.longitude +
      "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m";

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error("Could not fetch weather data.");
    }

    const weatherData = await weatherResponse.json();
    const current = weatherData.current;

    if (!current) {
      throw new Error("Weather data is unavailable.");
    }

    document.getElementById("weather-city").textContent =
      place.name + (place.country ? ", " + place.country : "");

    document.getElementById("weather-condition").textContent =
      getWeatherDescription(current.weather_code);

    document.getElementById("weather-temp").textContent =
      current.temperature_2m + " °C";

    document.getElementById("weather-humidity").textContent =
      current.relative_humidity_2m + "%";

    document.getElementById("weather-wind").textContent =
      current.wind_speed_10m + " km/h";

    weatherResult.hidden = false;
    weatherStatus.textContent = "Weather updated successfully!";
  } catch (error) {
    console.error("Weather error:", error);
    weatherStatus.textContent =
      "Unable to load weather. Please try again.";
  } finally {
    weatherButton.disabled = false;
  }
}

weatherButton.addEventListener("click", searchWeather);

cityInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    searchWeather();
  }
});

