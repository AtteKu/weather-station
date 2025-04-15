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
  
      const tbody = document.querySelector("#data-table2 tbody");
      const now = new Date();
      

      // Suodatetaan ja yhdistetään data, otetaan viimeiset 20 aiempaa tuntia
      const pastData = weatherData.hourly.time
      .map((time, index) => ({
        time: time,
        rain: weatherData.hourly.rain[index]
      }))
      .filter(entry => entry.time <= now)
      .reverse();

      const availableData = pastData.slice(0, 20);

      let labels = [];
      let rainData = [];
      
      for (let i = 0; i < availableData.length; i++) {
        
        const dateString = availableData[i].time.toLocaleString("fi-FI", {
          weekday: "long",
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        });

        const timeString = availableData[i].time.toLocaleString("fi-FI", {
            hour: "2-digit",
            minute: "2-digit"
          });

        const [hour, minute] = timeString.split(".");

        const rain =  availableData[i].rain.toFixed(1);

        labels.push(`${hour}:${minute}`);
        rainData.push(parseFloat(rain));
  
        const rowRain = document.createElement("tr");
  
        rowRain.innerHTML = `
        <td>${dateString}</td>
        <td>${timeString}</td>
        <td>${rain} mm</td>
      `;

      tbody.appendChild(rowRain);
  
      }

      const ctx = document.getElementById("Graph2").getContext("2d");

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Rain (mm)',
            data: rainData,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          }]
        },
        options: {
            responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'mm'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Time'
              }
            }
          }
        },
        

      });
  
    } catch (error) {
      console.error("Error:", error);
    }
  }
  
  fetchWeatherData(61.4991, 23.7871);