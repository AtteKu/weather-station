async function fetchWeatherData(latitude, longitude) {

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
  
    const formatDate = (date) => date.toISOString().split("T")[0];
    
    // Haetaan viimeisen viikon tiedot
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      hourly: "temperature_2m,rain,windspeed_10m",
      start_date: formatDate(lastWeek),
      end_date: formatDate(yesterday),
    });
  
    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  
    try {
      // Lähetetään GET-pyyntö Open-Meteo API:lle
      const response = await fetch(url);
  
      // Tarkistetaan, että pyyntö onnistui
      if (!response.ok) {
        throw new Error('API-call failed');
      }
  
      // JSON-vastaus
      const data = await response.json();
  
      // Tarkistetaan, että data löytyy
      if (!data || !data.hourly || !data.hourly.temperature_2m || !data.hourly.time || !data.hourly.rain || !data.hourly.windspeed_10m) {
        throw new Error('Missing Info');
      }
  
      // Muodostetaan säätiedot
      const weatherData = {
        hourly: {
          time: data.hourly.time.map((t) => new Date(t)),
          temperature2m: data.hourly.temperature_2m,
          rain: data.hourly.rain,
          windspeed: data.hourly.windspeed_10m,
        },
      };

      
  
      let rainData = [];
        
      for (let i = 0; i < weatherData.hourly.rain.length; i++) {
          
        rainData.push(weatherData.hourly.rain[i]);
      }

      

      const sum = rainData.reduce((acc, val) => acc + val, 0);
      const averageRainAmount = sum / rainData.length;

      const medianRain = getMedian(rainData);

      const RainMode = getMode(rainData);
    
      const RainRange = getRange(rainData);

      const RainSD = getStandardDeviation(rainData);

      const minAndMaxRain = getMinMax(rainData);
      const minRain = minAndMaxRain[0];
      const maxRain = minAndMaxRain[1];

      document.querySelector("#average-span").innerHTML = ` <strong>${averageRainAmount.toFixed(1)} mm</strong>`;

      document.querySelector("#median-span").innerHTML = ` <strong>${medianRain.toFixed(1)} mm</strong>`;

      const modeSpan = document.querySelector("#mode-span");
        if (Array.isArray(RainMode)) {
      modeSpan.innerHTML = RainMode.map(val => ` <strong>${val} mm,</strong>`).join('<strong>, </strong>');
      } else {
      modeSpan.textContent = RainMode;
      }

      document.querySelector("#range-span").innerHTML = ` <strong>${RainRange.toFixed(1)} mm</strong>`;

      document.querySelector("#sd-span").innerHTML = ` <strong>${RainSD.toFixed(1)} mm</strong>`;

      document.querySelector("#minmax-span").innerHTML = ` <strong>${minRain} mm, ${maxRain} mm</strong>`;

    } catch (error) {
      console.error("Error:", error);
    }
  }
  
  fetchWeatherData(61.4991, 23.7871);
  
  function getMedian(arr) {
    if (arr.length === 0) return null;
  
    const sorted = [...arr].sort((a, b) => a - b); 
    const mid = Math.floor(sorted.length / 2);
  
    if (sorted.length % 2 !== 0) {
      return sorted[mid];
    } else {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
  }

  function getMode(arr) {
    const frequency = {}; // tallennamme taulukon arvojen esiintymistiheydet
    let maxFrequency = 0; // seuraamme suurinta esiintymistiheyttä
    let modes = []; // taulukko, johon tallennetaan kaikki moodit

    // Käydään läpi taulukko ja lasketaan arvojen esiintymistiheydet
    for (let i = 0; i < arr.length; i++) {
        const value = arr[i];
        frequency[value] = (frequency[value] || 0) + 1; // lisätään yksi esiintymistiheys arvolle

        // Päivitetään suurin esiintymistiheys, jos se on suurempi kuin aikaisempi
        if (frequency[value] > maxFrequency) {
            maxFrequency = frequency[value];
        }
    }

    // Etsitään kaikki arvot, jotka esiintyvät suurimman määrän kertoja (maxFrequency)
    for (const value in frequency) {
        if (frequency[value] === maxFrequency) {
            modes.push(Number(value)); // lisätään arvot, jotka esiintyvät eniten
        }
    }

    // Jos taulukossa ei ole selkeää moodia, kaikki arvot ovat uniikkeja
    return modes.length === arr.length ? "No Mode in dataset" : modes;
}


/* Testataan funktiota
const data = [1, 2, 3, 4, 4, 5, 6, 6, 6];
const mode = getMode(data);

console.log(mode); */ // Output: [6]

function getRange(arr) {
  if (arr.length === 0) return null;

  const sorted = [...arr].sort((a, b) => a - b); 
  const min = sorted[0];
  const max = sorted[arr.length - 1];
  const range = max - min;
  return range;
}

function getStandardDeviation(arr) {
  const sum = arr.reduce((acc, val) => acc + val, 0);
  const average = sum / arr.length;
  const square = [];

  for (let i = 0; i < arr.length; i++) {
    let deviation = (arr[i] - average)
    let squarered = deviation * deviation
    square.push(squarered);
  }

  const sum2 = square.reduce((acc, val) => acc + val, 0);
  const variance = sum2 / arr.length;  

  const StandardDeviation = Math.sqrt(variance);
  return StandardDeviation;
}

function getMinMax(arr) {
  if (arr.length === 0) return null;
  const minMax = [];

  const sorted = [...arr].sort((a, b) => a - b); 
  const min = sorted[0];
  const max = sorted[arr.length - 1];
  minMax.push(min);
  minMax.push(max);
  return minMax;
}