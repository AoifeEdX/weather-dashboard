// Constants for API key and URL
const apiKey = '6101926e2dfd52e44805f37f6aa11044';
const apiUrl = 'https://api.openweathermap.org/data/2.5/';

// DOM elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const historyList = document.getElementById('history');
const todaySection = document.getElementById('today');
const forecastSection = document.getElementById('forecast');

// Function to fetch and display default weather for Dublin, Ireland
const fetchDefaultWeather = async () => {
	// Default city
	const defaultCity = 'Dublin';
	// Fetch current weather for default city
	const defaultWeather = await getCurrentWeather(defaultCity);
	displayCurrentWeather(defaultWeather);
	// Fetch forecast for default city
	const defaultForecast = await getForecast(defaultCity);
	displayForecast(defaultForecast);
};

// Call the fetchDefaultWeather function when the page loads
document.addEventListener('DOMContentLoaded', fetchDefaultWeather);

// Function to fetch current weather data
const getCurrentWeather = async (city) => {
	// API URL for current weather
	const url = `${apiUrl}weather?q=${city}&appid=${apiKey}&units=metric`;
	try {
		// Fetch data from the API
		const response = await fetch(url);
		const data = await response.json();
		return data;
	} catch (error) {
		// Handle errors
		console.error('Error fetching current weather:', error);
		return null;
	}
};

const getForecast = async (city) => {
	// API URL for forecast
	const url = `${apiUrl}forecast?q=${city}&appid=${apiKey}&units=metric`;
	try {
			// Fetch data from the API
			const response = await fetch(url);
			const data = await response.json();
			// Find the index of the first item for tomorrow
			const tomorrowIndex = data.list.findIndex(item => {
					const tomorrow = dayjs().add(1, 'day').startOf('day');
					const itemDate = dayjs.unix(item.dt);
					return itemDate.isSame(tomorrow, 'day');
			});
			// Slice the array starting from the index of tomorrow
			const forecastData = data.list.slice(tomorrowIndex, tomorrowIndex + 4 * 8);
			return { city: data.city, list: forecastData };
	} catch (error) {
			// Handle errors
			console.error('Error fetching forecast:', error);
			return null;
	}
};


// Function to display current weather
const displayCurrentWeather = (weatherData) => {
	const { name, dt, main, weather, wind } = weatherData;

	// Format date
	const date = dayjs.unix(dt).format('dddd<br><b>D MMM</b>');
	// Weather icon URL
	const iconUrl = `https://openweathermap.org/img/w/${weather[0].icon}.png`;
	const weatherDescription = weather[0].description.toUpperCase();
	// Temperature
	const temperature = Math.round(main.temp);

	// HTML for displaying current weather
	const html = `
	<h2 class="mb-4">Today:</h2>
	<div id="current-weather" class="bg-light p-3 border border-dark-subtle rounded text-center">
		<div class="bg-secondary bg-gradient bg-opacity-25 rounded pt-4 mb-4">
			<h2 class="display-5">${name}</h2>
			<h3>${date}</h3>
			<img src="${iconUrl}" alt="${weatherDescription}">
			<p>${weatherDescription}</p><br>
		</div>
		<p class="display-3">${temperature} °C</h3>
		<h4><strong>Humidity:</strong> ${main.humidity}%</h4>
		<h5><strong>Wind Speed:</strong> ${wind.speed} m/s</h5>
	</div>
	`;

	// Insert the HTML into the DOM
	todaySection.innerHTML = html;
};

// Function to display forecast
const displayForecast = (forecastData) => {
	const forecastList = forecastData.list;

	let html = ''; // Initialize HTML string for forecast

	let currentDate = ''; // Track current date to group forecast by day

	// Iterate through forecast data
	forecastList.forEach((forecast, index) => {
		const { dt, main, weather, wind } = forecast;
		const date = dayjs.unix(dt).format('dddd<br><b>D MMM</b>');

		// Check if it's a new date
		if (date !== currentDate) {
			// Weather icon URL
			const iconUrl = `https://openweathermap.org/img/w/${weather[0].icon}.png`;
			const weatherDescription = weather[0].description.toUpperCase();
			// Temperature
			const temperature = Math.round(main.temp);

			// Add HTML for forecast day
			html += `
				<div class="col-md-3 text-center mb-4">
					<div id="forecast-box-${index}" class="bg-light border border-dark-subtle rounded p-3 mb-2">
						<div class="bg-secondary bg-gradient bg-opacity-25 rounded pt-3 mb-4">
							<h4>${date}</h3>
							<img src="${iconUrl}" alt="${weatherDescription}">
							<p>${weatherDescription}</p><br>
						</div>
						<p class="display-5">${temperature} °C</h3>
						<h5><strong>Humidity:</strong> ${main.humidity}%</h5>
						<p><strong>Wind Speed:</strong> ${wind.speed} m/s</p>
					</div>
				</div>
			`;

			// Update currentDate to the current date
			currentDate = date;
		}
	});

	// Insert the HTML into the forecast section of the DOM
	forecastSection.innerHTML = `
		<h2 class="my-4">Next Four Days:</h2>
		<div class="row">${html}</div>
	`;
};

// Event listener for the search form
searchForm.addEventListener('submit', async (event) => {
	event.preventDefault();
	const city = searchInput.value.trim();

	if (city !== '') {
		// Fetch and display current weather
		const currentWeather = await getCurrentWeather(city);
		displayCurrentWeather(currentWeather);

		// Fetch and display forecast
		const forecast = await getForecast(city);
		displayForecast(forecast);

		// Add the searched city to search history
		addToSearchHistory(city);
	}
});

// Function to add searched city to search history
const addToSearchHistory = (city) => {
	// Retrieve the searched cities from local storage or initialize an empty array
	const storedCities = JSON.parse(localStorage.getItem('searchedCities')) || [];

	// Check if the city already exists in the search history
	if (!storedCities.includes(city)) {
		// Create a button element for the city
		const listItem = document.createElement('button');
		listItem.textContent = city;
		listItem.classList.add('btn', 'btn-secondary', 'bg-gradient', 'btn-block', 'mb-2');

		// Add click event listener to display weather and forecast when the button is clicked
		listItem.addEventListener('click', async () => {
			const currentWeather = await getCurrentWeather(city);
			displayCurrentWeather(currentWeather);

			const forecast = await getForecast(city);
			displayForecast(forecast);
		});

		// Append the button to the history list
		historyList.appendChild(listItem);

		// Store the searched city in local storage
		storedCities.push(city);
		localStorage.setItem('searchedCities', JSON.stringify(storedCities));
	}
};

// Load the previously searched cities from local storage on page load
document.addEventListener('DOMContentLoaded', () => {
	const storedCities = JSON.parse(localStorage.getItem('searchedCities')) || [];

	// Create buttons for each stored city and append them to the history list
	storedCities.forEach((city) => {
		const listItem = document.createElement('button');
		listItem.textContent = city;
		listItem.classList.add('btn', 'btn-secondary', 'bg-gradient', 'mb-2');

		// Add click event listener to display weather and forecast when the button is clicked
		listItem.addEventListener('click', async () => {
			const currentWeather = await getCurrentWeather(city);
			displayCurrentWeather(currentWeather);

			const forecast = await getForecast(city);
			displayForecast(forecast);
		});

		historyList.appendChild(listItem);
	});
});
