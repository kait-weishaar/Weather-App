   //Link to all html elements first
const inputEl = document.getElementById("search-input");
const searchEl = document.getElementById("search-button");
const formEl = document.getElementById("search-form");
const nameEl = document.getElementById("city-name");
const currentHeaderEl = document.getElementById("current-header");
const currentTempEl = document.getElementById("temperature");
const currentHumidityEl = document.getElementById("humidity");
const currentWindEl = document.getElementById("wind-speed");
const currentUVEl = document.getElementById("UV-index");
const historyContainerEl = document.getElementById("history");

//define empty array to fill
let cities = [];

//Get any existing searh history out of local storage to display to page
let searchHistory = JSON.parse(localStorage.getItem("search")) || [];



let saveHistory = function(){
    localStorage.setItem("cities", JSON.stringify(cities));
};


//open weather api requires an api key
const myKey= 'd91f911bcf2c0f925fb6535547a5ddc9';

const fetchWeather= function(city) {
    let apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${myKey}`

    fetch(apiURL)
    .then(function(response){
        response.json.then(function(data){
            displayCurrent(data, city);
        });
    })
    .catch(function(error) {
        
        alert("Unable to locate city. Please enter a valid city name");
      });
};

const displayCurrent = function(weather, searchInput) {
    console.log(weather)
    //display current date and location
   
            nameEl.textContent = weather.name + " (" + moment(weather.dt.value).format("MMM D, YYYY") + ") ";


    let currentIcon = document.createElement("img")
            currentIcon.setAttribute("src", `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`);
            currentHeaderEl.appendChild(currentIcon);
            currentIcon.setAttribute("alt", weather.weather[0].description);
    //set content for current weather
    currentTempEl.textContent = "Temperature: " + weather.main.temp + " °F";
    currentHumidityEl.textContent = "Humidity: " + weather.main.humidity + " %";
    currentWindEl.textContent = "Wind Speed: " + weather.wind.speed + " MPH";
    currentTempEl.classList = "list-group-item";
    currentHumidityEl.classList = "list-group-item";
    currentWindEl.classList = "list-group-item";



    let lat = weather.coord.lat;
    let lon = weather.coord.lon;
    getUvIndex(lat,lon)

}

let getUVIndex = function(lat,lon){
    
    let apiURL = `https://api.openweathermap.org/data/2.5/uvi?appid=${myKey}&lat=${lat}&lon=${lon}`
    fetch(apiURL)
    .then(function(response){
        response.json().then(function(data){
            displayUV(data)
            console.log(data)
        });
    });
}

let displayUV = function(index) {
    currentUVEl.textContent = 'UV Index: '
    let UVindex = document.createElement("span");
    UVindex.textContent = index.value

    if(index.value <=2){
        uvIndexValue.classList = "badge bg-success"
    }else if(index.value >2 && index.value<=8){
        uvIndexValue.classList = "badge bg-warning "
    }
    else if(index.value >8){
        uvIndexValue.classList = "badge bg-danger"
    };

    currentUVEl.appendChild(UVindex);
    currentUVEl.classList = "list-group-item"
}

const fetch5Day = function(city) {
    let apiCall = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${myKey}`
    fetch(apiCall)
    .then(function(response) {
        response.json().then(function(data) 
        {
            display5Day(data);
        })
    })
};

const display5Day = function (weather) {
    let forecastCards = document.querySelectorAll("forecast");
    
    let forecast = weather.list; 
    console.log(forecast);
    for (let i=0; i<forecastCards.length; i++) {//step by eight because forecasts occur every three hours, and we want daily
        let eachDay = forecast[i];
        forecastCards[i].innerHTML = "";
        //diplsay date as title of card
        let forecastDate = document.createElement("h4")
        forecastDate.textContent = moment.unix(eachDay.dt).format("MMM D, YYYY");
        forecastDate.classList = "card-header text-center";
        forecastCards[i].appendChild(forecastDate);


        //add icon in center of card
        let forecastIcon = document.createElement("img");
        forecastIcon.classList = "card-body text-center";
        forecastIcon.setAttribute("src", `https://openweathermap.org/img/wn/${eachDay.weather[0].icon}@2x.png`);
        forecastCards[i].appendChild(forecastIcon);


        //display temp
        let forecastTemp = document.createElement("h5");
        forecastTemp.classList = "card-body text-center"
        forecastTemp.textContent = eachDay.main.temp + " °F";
        forecastCards[i].appendChild(forecastTemp);

        //display % humidity
        let forecastHum = document.createElement("h5");
        forecastHum.classList = "card-body text-center";
        forecastHum.textContent = eachDay.main.humidity + " %"
        forecastCards[i].appendChild(forecastHum);
}
};
let historyItem = function(searchTerm) {
    historyEl = document.createElement("button");
    historyEl.textContent = searchTerm;
    historyEl.classlist = "d-flex w-100 btn light";
    historyEl.setAttribute("city-input", searchTerm)
    historyEl.setAttribute("type", "submit");
    historyContainerEl.prepend(historyEl);
}

let historySearch = function(event) {
    let location = event.target.getAttribute("city-input")
    if (location) {
        fetchWeather(location);
        fetch5Day(location);
    }
}
let formHandler = function(event) {
    //event.preventDefault();
    let city = inputEl.value.trim();
    console.log(city)
    if(city){
        fetchWeather(city);
        fetch5Day(city);
        cities.unshift({city});
        inputEl.value = "";
    } else{
        alert("Please enter a City");
    }
    saveHistory();
    historyItem(city);
}
searchEl.addEventListener("click", formHandler);
historyContainerEl.addEventListener("click", historySearch);
