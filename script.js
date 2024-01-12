const apiKey = '6101926e2dfd52e44805f37f6aa11044';
const apiUrl = 'https://api.openweathermap.org/data/2.5/';
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const historyList = document.getElementById('history');
const todaySection = document.getElementById('today');
const forecastSection = document.getElementById('forecast');

const getCurrentWeather = async (city) => {
  const url = `${apiUrl}weather?q=${city}&appid=${apiKey}&units=metric`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    return null;
  }
};

const getForecast = async (city) => {
  const url = `${apiUrl}forecast?q=${city}&appid=${apiKey}&units=metric`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    return null;
  }
};

const displayCurrentWeather = (weatherData) => {
  const { name, dt, main, weather, wind } = weatherData;

  const date = dayjs.unix(dt).format('YYYY-MM-DD HH:mm:ss');
  const iconUrl = `https://openweathermap.org/img/w/${weather[0].icon}.png`;

  const html = `
    <h2>${name} - ${date}</h2>
    <img src="${iconUrl}" alt="${weather[0].description}">
    <p>Temperature: ${main.temp} °C</p>
    <p>Humidity: ${main.humidity}%</p>
    <p>Wind Speed: ${wind.speed} m/s</p>
  `;

  todaySection.innerHTML = html;
};

const displayForecast = (forecastData) => {
  const forecastList = forecastData.list;

  const html = forecastList.slice(0, 5).map((forecast) => {
    const { dt, main, weather } = forecast;
    const date = dayjs.unix(dt).format('YYYY-MM-DD');
    const iconUrl = `https://openweathermap.org/img/w/${weather[0].icon}.png`;

    return `
      <div class="col-md-2 mb-3">
        <div class="forecast-box">
          <h5>${date}</h5>
          <img src="${iconUrl}" alt="${weather[0].description}">
          <p>Temperature: ${main.temp} °C</p>
          <p>Humidity: ${main.humidity}%</p>
        </div>
      </div>
    `;
  }).join('');

  forecastSection.innerHTML = `
    <h2 class="mt-3">5-Day Forecast:</h2>
    <div class="row mt-3">${html}</div>
  `;
};

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const city = searchInput.value.trim();

  if (city !== '') {
    const currentWeather = await getCurrentWeather(city);
    displayCurrentWeather(currentWeather);

    const forecast = await getForecast(city);
    displayForecast(forecast);

    addToSearchHistory(city);
  }
});

document.querySelectorAll('.optional-city').forEach((button) => {
  button.addEventListener('click', async () => {
    const city = button.dataset.city;

    const currentWeather = await getCurrentWeather(city);
    displayCurrentWeather(currentWeather);

    const forecast = await getForecast(city);
    displayForecast(forecast);

    addToSearchHistory(city);
  });
});

const addToSearchHistory = (city) => {
  const listItem = document.createElement('li');
  listItem.textContent = city;
  historyList.appendChild(listItem);
};