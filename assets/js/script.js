   //Link to all html elements first
const inputEl = document.getElementById("search-input");
const formEl = document.getElementById("search-form");
const nameEl = document.getElementById("city-name");
const currentTempEl = document.getElementById("temperature");
const currentHumidityEl = document.getElementById("humidity");
const currentWindEl = document.getElementById("wind-speed");
const currentUVEl = document.getElementById("UV-index");
const historyContainerEl = document.getElementById("history");
const weathercontainerEl=document.getElementById("weather-container");
const iconContainerEl=document.getElementById("icon-holder");
const clearButtonEl= document.getElementById("clear-history");

let historyAdd = function(searchTerm) {
    historyEl = document.createElement("button");
    historyEl.textContent = searchTerm;
    historyEl.classlist = "d-flex w-100 btn light";
    historyEl.setAttribute("city-input", searchTerm)
    historyEl.setAttribute("type", "submit");
    historyContainerEl.prepend(historyEl);
}
function getLocalStorage() {
    return JSON.parse(localStorage.getItem('eventArray')) || [];
}
const loadSearch = function() {
    let savedItems = getLocalStorage();
    historyContainerEl.innerHTML="";
    if (!savedItems) {
        return
    } else {
        for (i=0; i<savedItems.length; i++) {
            historyAdd(savedItems[i].search);
        }
    }
}

let initialPage = function() {
    weathercontainerEl.classList.add("invisible");
    loadSearch();
}

initialPage();

//define empty array to fill with history
let cities = [];

//Get any existing search history out of local storage to display to page
//let searchHistory = JSON.parse(localStorage.getItem("cities")) || [];

const saveSearch = function(searchTerm) {
    let savedList = getLocalStorage();
    savedList.unshift({search: searchTerm});
    let filtered = Array.from(new Set(savedList));
    localStorage.setItem('cities', JSON.stringify(filtered))
    loadSearch();
}


// let saveHistory = function(){
//     localStorage.setItem("cities", JSON.stringify(cities));
// };

let cityID="";
let lat="";
let long="";
//open weather api requires an api key
const myKey= '46f480d0b74baea518033aaeba1e582c';

const fetchWeather= function(city) {
    let apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${myKey}`
    

    fetch(apiURL)
    
    .then(function(response){
        console.log(response)
        if(response.ok){
            response.json().then(function(data){
            console.log(data)
            if(!data.weather) {
                alert("Unable to locate city. Please enter a valid city name");
            } else{
                displayCurrent(data, city);
            }
                
        });
    }})
    // .catch(function(error) {
        
    //     alert("Unable to perform search. Please check your wifi");
    //   });
};

let getUVIndex = function(lat,long){
    
    let apiURL = `https://api.openweathermap.org/data/2.5/uvi?appid=${myKey}&lat=${lat}&lon=${long}`
    fetch(apiURL)
    .then(function(response){
        response.json().then(function(data){
            console.log(data)
            displayUV(data)
            
        });
    });
}

const displayCurrent = function(weather, searchInput) {
    console.log(weather)
    weathercontainerEl.classList.remove("invisible")
    //display current date and location
   
            nameEl.textContent = weather.name + " (" + moment(weather.dt.value).format("MMM D, YYYY") + ") ";


    let currentIcon = document.createElement("img")
            currentIcon.setAttribute("src", `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`);
            iconContainerEl.appendChild(currentIcon);
            currentIcon.setAttribute("alt", weather.weather[0].description);
    //set content for current weather
    currentTempEl.textContent = "Temperature: " + weather.main.temp + " °F";
    currentHumidityEl.textContent = "Humidity: " + weather.main.humidity + " %";
    currentWindEl.textContent = "Wind Speed: " + weather.wind.speed + " MPH";
    cityID=weather.id;
    



    let lat = weather.coord.lat;
    let long = weather.coord.lon;
    getUVIndex(lat,long);
    fetch5Day(lat,long);
    saveSearch(searchInput);

}


let displayUV = function(data) {
    currentUVEl.textContent = 'UV Index: '
    let UVindex = document.createElement("span");
    UVindex.textContent = data.value

    if(data.value <=2){
        UVindexValue.classList = "badge bg-success"
    }else if(data.value >2 && data.value<=8){
        UVindex.classList = "badge bg-warning "
    }
    else if(data.value >8){
        UVindex.classList = "badge bg-danger"
    };

    currentUVEl.appendChild(UVindex);
    //currentUVEl.classList = "list-group-item"
}

const fetch5Day = function(lat,long) {
    let apiCall = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=current,hourly,minutely,alerts&units=imperial&appid=${myKey}`
    
    fetch(apiCall)
    .then(function(response) {
        
        response.json().then(function(data) 
        {
            console.log(data);
            display5Day(data);
        })
    })
};

const display5Day = function (weather) {

    for (let i=1;i<6; i++) {
        let forecast = weather.daily;
        let eachDay = forecast[i];
        let dayCard = document.getElementById("day-"+ i);
        dayCard.innerHTML="";
        let forecastDate = document.createElement("h5")
        forecastDate.textContent = moment.unix(eachDay.dt).format("MM/DD/YYYY");
        dayCard.appendChild(forecastDate);


        let forecastIcon = document.createElement("img");
        forecastIcon.classList = "card-body text-center";
        forecastIcon.setAttribute("src", `https://openweathermap.org/img/wn/${eachDay.weather[0].icon}@2x.png`);
        dayCard.appendChild(forecastIcon);

        //display temp
        let forecastTemp = document.createElement("p");
        forecastTemp.classList = "card-text text-center"
        forecastTemp.textContent =eachDay.temp.max + " °F";
        dayCard.appendChild(forecastTemp);

        let forecastHum = document.createElement("p");
        forecastHum.classList = "card-text text-center fs-6";
        forecastHum.textContent = "Hum: " + eachDay.humidity + " %"
        dayCard.appendChild(forecastHum);
    }
}
;


let historySearch = function(event) {
    let location = event.target.getAttribute("city-input")
    if (location) {
        fetchWeather(location);
        //fetch5Day(location);
    }
}


let formHandlerFunction = function(event) {
    event.preventDefault();
    let city = inputEl.value.trim();
    console.log(city)
    if(city){
        fetchWeather(city);
        //fetch5Day(city);
        cities.unshift({city});
        inputEl.value = "";
        historyAdd(city);
    } else{
        alert("Please enter a City");
    }
}


let clearHistory = function() {
    localStorage.clear();
    loadSearch();
}


formEl.addEventListener("submit",formHandlerFunction) ;
clearButtonEl.addEventListener("click", clearHistory);

historyContainerEl.addEventListener("click", historySearch);
