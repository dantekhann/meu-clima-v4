const weatherConfig = {
  0: {
    label: "Céu Limpo",
    icon: "☀️",
    color: "#00d2ff",
    msg: "Dia perfeito para sair!",
  },
  1: {
    label: "Quase Limpo",
    icon: "🌤️",
    color: "#00d2ff",
    msg: "O sol está brilhando.",
  },
  2: {
    label: "Parcialmente Nublado",
    icon: "⛅",
    color: "#00d2ff",
    msg: "Algumas nuvens no céu.",
  },
  3: {
    label: "Nublado",
    icon: "☁️",
    color: "#00d2ff",
    msg: "Tempo fechado por enquanto.",
  },
  45: {
    label: "Névoa",
    icon: "🌫️",
    color: "#a8a8b3",
    msg: "Visibilidade reduzida.",
  },
  61: {
    label: "Chuva Fraca",
    icon: "🌧️",
    color: "#00d2ff",
    msg: "Leve o guarda-chuva.",
  },
  80: {
    label: "Pancadas de Chuva",
    icon: "🌦️",
    color: "#00d2ff",
    msg: "Chuva passageira.",
  },
};

// --- OUVINTE DO ENTER ---
document.getElementById("cidadeInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    buscarClimaReal();
  }
});

// --- FUNÇÃO 1: BUSCA LOCALIDADES ---
async function buscarClimaReal() {
  const input = document.getElementById("cidadeInput");
  const container = document.getElementById("notificacao-container");
  const btn = document.getElementById("btnVerificar");

  // Limpa hífens e espaços extras para a API não se perder
  let busca = input.value.trim().replace(/-/g, " ").replace(/\s+/g, " ");

  if (!busca) return;

  btn.disabled = true;
  btn.innerText = "Buscando...";
  container.innerHTML = `<div class="skeleton"></div>`;

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(busca)}&count=5&language=pt&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("Local não encontrado.");
    }

    // Se houver mais de um, cria a lista
    if (geoData.results.length > 1) {
      container.innerHTML =
        '<p style="margin-bottom:15px; font-size:0.8rem; color:#a8a8b3;">Vários locais encontrados:</p>';
      const lista = document.createElement("div");
      lista.className = "lista-selecao";

      geoData.results.forEach((local) => {
        const item = document.createElement("div");
        item.className = "item-local";
        item.innerHTML = `<strong>${local.name}</strong><span>${local.admin1 || ""} - ${local.country}</span>`;

        // IMPORTANTE: Passamos o objeto 'local' inteiro para a função
        item.onclick = () => {
          exibirClimaFinal(local);
        };
        lista.appendChild(item);
      });
      container.appendChild(lista);
    } else {
      exibirClimaFinal(geoData.results[0]);
    }
  } catch (erro) {
    container.innerHTML = `<p style="color: #ff5555; padding: 20px;">${erro.message}</p>`;
  } finally {
    btn.disabled = false;
    btn.innerText = "Verificar Clima";
  }
}

// --- FUNÇÃO 2: MOSTRA O CLIMA FINAL ---
async function exibirClimaFinal(local) {
  const container = document.getElementById("notificacao-container");
  container.innerHTML = `<div class="skeleton"></div>`;

  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${local.latitude}&longitude=${local.longitude}&current_weather=true`;
    const res = await fetch(weatherUrl);
    const clm = await res.json();
    const data = clm.current_weather;

    // Lógica para definir se é Sol ou Lua
    const emojiEstado = data.is_day === 1 ? "☀️" : "🌙";

    const config = weatherConfig[data.weathercode] || {
      label: "Estável",
      icon: "🌤️",
      color: "#00d2ff",
      msg: "Aproveite!",
    };

    container.innerHTML = `
      <div class="alerta-moderno" style="border-left-color: ${config.color}">
          <span class="weather-icon-main">${config.icon}</span>
          
          <div style="font-size: 1.5rem; margin-top: -10px; margin-bottom: 10px;">
            ${emojiEstado}
          </div>

          <h2>${local.name}, ${local.country}</h2>
          <div class="temp-grande" style="color: ${config.color}">${data.temperature}°C</div>
          <p style="color: ${config.color}; font-weight: bold;">Condição: ${config.label}</p>
          <p style="font-size: 0.8rem; color: #a8a8b3;">Vento: ${data.windspeed} km/h</p>
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:15px 0;">
          <p>${config.msg}</p>
      </div>`;
  } catch (e) {
    container.innerHTML = `<p style="color: #ff5555;">Erro ao carregar clima.</p>`;
  }
}
