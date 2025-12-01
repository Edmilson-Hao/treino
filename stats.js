// stats.js — Estatísticas completas + gráficos (Gorila Mode Clean)

function carregarStats() {
  const content = document.getElementById("statsContent");
  if (!content) return;

  const treinosFeitos = get("treinosRealizados"); // função get() vem do main.js

  if (treinosFeitos.length === 0) {
    content.innerHTML = `
      <p style="text-align:center;padding:100px 20px;color:#666;font-size:1.3em;">
        Nenhum treino registrado ainda.<br><br>
        Bora mudar isso, monstro?
      </p>`;
    return;
  }

  // HTML das estatísticas
  content.innerHTML = `
    <div class="stat-section">
      <h3>Evolução da Tonelagem por Treino</h3>
      <select id="selectDiaTonelagem" style="width:100%;padding:12px;margin:12px 0 20px;border-radius:12px;background:#1B263B;color:white;border:none;">
        <option value="">Selecione um dia</option>
      </select>
      <canvas id="chartTonelagemDia"></canvas>
    </div>

    <div class="stat-section">
      <h3>Tonelagem por Grupo Muscular</h3>
      <canvas id="chartGruposMusculares"></canvas>
    </div>

    <div class="stat-section">
      <h3>Últimos 12 treinos</h3>
      <div id="listaUltimosTreinos"></div>
    </div>

    <div class="stat-section">
      <h3>Evolução da Carga Máxima por Exercício</h3>
      <select id="selectExercicioCarga" style="width:100%;padding:12px;margin:12px 0 20px;border-radius:12px;background:#1B263B;color:white;border:none;">
        <option value="">Selecione um exercício</option>
      </select>
      <canvas id="chartCargaExercicio"></canvas>
    </div>
  `;

  preencherDropdownDias(treinosFeitos);
  preencherDropdownExercicios(treinosFeitos);
  graficoTonelagemPorGrupo(treinosFeitos);
  listaUltimosTreinos(treinosFeitos);
}

// Preenche dropdown de dias
function preencherDropdownDias(treinos) {
  const select = document.getElementById("selectDiaTonelagem");
  const dias = [...new Set(treinos.map(t => t.dia))].sort();
  dias.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    select.appendChild(opt);
  });
  select.onchange = () => graficoTonelagemPorDia(treinos);
}

// Preenche dropdown de exercícios
function preencherDropdownExercicios(treinos) {
  const todos = new Set();
  treinos.forEach(t => t.exercicios.forEach(ex => todos.add(ex.nome)));
  const select = document.getElementById("selectExercicioCarga");
  [...todos].sort().forEach(nome => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    select.appendChild(opt);
  });
  select.onchange = () => graficoCargaMaximaExercicio(treinos);
}

// Gráfico 1 – Tonelagem por dia selecionado
function graficoTonelagemPorDia(treinos) {
  const dia = document.getElementById("selectDiaTonelagem").value;
  const ctx = document.getElementById("chartTonelagemDia").getContext("2d");
  if (window.chart1) window.chart1.destroy();
  if (!dia) {
    ctx.canvas.style.height = "0px";
    return;
  }
  ctx.canvas.style.height = "280px";

  const dados = treinos.filter(t => t.dia === dia)
    .sort((a,b) => a.data.localeCompare(b.data));

  const labels = dados.map(t => new Date(t.data).toLocaleDateString('pt-BR'));
  const valores = dados.map(t => t.tonelagem || calcularTonelagem(t.exercicios));

  window.chart1 = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Tonelagem (kg)',
        data: valores,
        borderColor: '#00FF9D',
        backgroundColor: 'rgba(0,255,157,0.1)',
        tension: .3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { ticks: { color: '#778DA9' }, grid: { color: '#1e2a3b' } } }
    }
  });
}

// === NOVA VERSÃO DO GRÁFICO: TONELAGEM + NÚMERO DE SESSÕES ===
function graficoTonelagemPorGrupo(treinos) {
  const gruposTonelagem = {};
  const gruposSessoes = {};

  treinos.forEach(t => {
    t.exercicios.forEach(ex => {
      const grupo = ex.grupo || "Outro";
      // Contabiliza sessões (cada treino que tem o grupo = +1)
      gruposSessoes[grupo] = (gruposSessoes[grupo] || 0) + 1;

      // Contabiliza tonelagem
      ex.series.forEach(s => {
        const vol = (Number(s.peso) || 0) * (Number(s.reps) || 0);
        if (vol > 0) {
          gruposTonelagem[grupo] = (gruposTonelagem[grupo] || 0) + vol;
        }
      });
    });
  });

  const ctx = document.getElementById("chartGruposMusculares").getContext("2d");
  if (window.chart2) window.chart2.destroy();

  const sorted = Object.keys(gruposTonelagem)
    .map(grupo => ({
      nome: grupo,
      tonelagem: Math.round(gruposTonelagem[grupo] || 0),
      sessoes: gruposSessoes[grupo] || 0
    }))
    .sort((a, b) => b.tonelagem - a.tonelagem);

  window.chart2 = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(item => `${item.nome} (${item.sessoes} sess${item.sessoes === 1 ? 'ão' : 'ões'})`),
      datasets: [{
        label: 'Tonelagem (kg)',
        data: sorted.map(item => item.tonelagem),
        backgroundColor: '#00FF9D',
        borderRadius: 10,
        barThickness: 32
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            afterLabel: function(context) {
              const item = sorted[context.dataIndex];
              return `Sessões: ${item.sessoes}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#778DA9' },
          grid: { color: '#1e2a3b' }
        },
        y: {
          ticks: { color: '#E0E1DD', font: { weight: 'bold' } },
          grid: { display: false }
        }
      }
    }
  });
}

// Últimos 12 treinos
function listaUltimosTreinos(treinos) {
  const div = document.getElementById("listaUltimosTreinos");
  div.innerHTML = "";
  treinos.slice(-12).reverse().forEach(t => {
    const ton = t.tonelagem || calcularTonelagem(t.exercicios);
    const dataBR = new Date(t.data).toLocaleDateString('pt-BR');
    const el = document.createElement("div");
    el.style.cssText = "background:#1B263B;padding:18px;margin:12px 0;border-radius:16px;border-left:5px solid #00FF9D;";
    el.innerHTML = `
      <div style="color:#00FF9D;font-weight:900;">${t.dia}</div>
      <div style="color:#778DA9;font-size:.9em;margin:6px 0;">${dataBR}</div>
      <div style="font-size:1.5em;font-weight:900;color:#00FF9D;margin-top:8px;">${ton.toLocaleString()} kg</div>
    `;
    div.appendChild(el);
  });
}

// Gráfico 3 – Carga máxima por exercício
function graficoCargaMaximaExercicio(treinos) {
  const ex = document.getElementById("selectExercicioCarga").value;
  const ctx = document.getElementById("chartCargaExercicio").getContext("2d");
  if (window.chart3) window.chart3.destroy();
  if (!ex) {
    ctx.canvas.style.height = "0px";
    return;
  }
  ctx.canvas.style.height = "280px";

  const dados = [];
  treinos.forEach(t => {
    const e = t.exercicios.find(e => e.nome === ex);
    if (e) {
      const max = Math.max(...e.series.map(s => Number(s.peso)||0).filter(p=>p>0));
      if (max > 0) dados.push({ data: t.data, peso: max });
    }
  });

  dados.sort((a,b) => a.data.localeCompare(b.data));

  window.chart3 = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dados.map(d => new Date(d.data).toLocaleDateString('pt-BR')),
      datasets: [{
        label: 'Carga máxima',
        data: dados.map(d => d.peso),
        borderColor: '#00FF9D',
        backgroundColor: 'rgba(0,255,157,0.2)',
        tension: .3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}