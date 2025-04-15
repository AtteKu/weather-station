async function fetchWeatherData(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    hourly: "temperature_2m,rain,windspeed_10m"
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

    const tbody = document.querySelector("#data-table1 tbody");
    const len = weatherData.hourly.time.length;
    
    const now = new Date();
    const pastData = weatherData.hourly.time.filter(time => time <=now);

    const start = Math.max(0, pastData.length - 20);

    
    for (let i = start; i < len; i++) {
      const dateString = pastData[i].toLocaleString("fi-Fi", {
        weekday: "long",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });

      const timeString = pastData[i].toLocaleString("fi-Fi", {
          hour: "2-digit",
          minute: "2-digit"
        });

      const temp = weatherData.hourly.temperature2m[i].toFixed(1);

      const rowTemp = document.createElement("tr");

      rowTemp.innerHTML = `
        <td>${dateString}</td>
        <td>${timeString}</td>
        <td>${temp} °C</td>
      `;
      
      tbody.appendChild(rowTemp);
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

fetchWeatherData(61.4991, 23.7871);


  
  

