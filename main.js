// =============== MAIN.JS — VERSÃO CORRIGIDA E MELHORADA 100% FUNCIONAL ===============

const treinos = {
  "Dia 1 - Supino": { exercicios: [
    {nome:"Supino Inclinado Halteres",series:4,reps:null,grupo:"Peito"},
    {nome:"Supino Inclinado Máquina",series:4,reps:null,grupo:"Peito"},
    {nome:"Cross Over Polia Alta",series:4,reps:12,grupo:"Peito"},
    {nome:"Desenvolvimento Halteres",series:4,reps:10,grupo:"Deltóide Frontal"},
    {nome:"Elevação Lateral Halteres",series:4,reps:10,grupo:"Deltóide Lateral"},
    {nome:"Rosca Simutânea Sentada",series:4,reps:10,grupo:"Bíceps"},
    {nome:"Rosca Martelo Alternada",series:4,reps:10,grupo:"Bíceps"}
  ]},
  "Dia 2 - Terra": { exercicios: [
    {nome:"Levantamento Terra",series:4,reps:null,grupo:"Costas"},
    {nome:"Remada Sentada Pronada",series:4,reps:10,grupo:"Costas"},
    {nome:"Puxada Alta Pronada",series:4,reps:10,grupo:"Costas"},
    {nome:"Remada Serrote",series:4,reps:8,grupo:"Costas"},
    {nome:"Pull Down Barra",series:4,reps:12,grupo:"Costas"},
    {nome:"FacePull Corda",series:4,reps:12,grupo:"Deltóide Posterior"},
    {nome:"Tríceps Barra W",series:4,reps:12,grupo:"Tríceps"},
    {nome:"Tríceps Testa Polia",series:4,reps:12,grupo:"Tríceps"}
  ]},
  "Dia 3 - Agachamento": { exercicios: [
    {nome:"Agachamento Barra",series:4,reps:null,grupo:"Quadríceps"},
    {nome:"Leg Press 45°",series:4,reps:8,grupo:"Quadríceps"},
    {nome:"Panturrilha no Leg",series:4,reps:12,grupo:"Panturrilha"},
    {nome:"Flexora Deitada",series:4,reps:12,grupo:"Isquios Tibiais"},
    {nome:"Flexora Sentada",series:4,reps:12,grupo:"Isquios Tibiais"},
    {nome:"Abdutora + Adutora",series:4,reps:"12+12",grupo:"Adutores"}
  ]}
};

let diaAtual = null, segundos = 0, timer = null;

// LOCALSTORAGE
const get = k => JSON.parse(localStorage.getItem(k) || (k==="treinosRealizados"?"[]":"null"));
const set = (k,v) => localStorage.setItem(k, JSON.stringify(v));
const del = k => localStorage.removeItem(k);

// CALCULA TONELAGEM
function calcularTonelagem(exercicios) {
  let total = 0;
  exercicios.forEach(ex => {
    ex.series.forEach(s => {
      const peso = Number(s.peso);
      const reps = Number(s.reps);
      if (peso > 0 && reps > 0) total += peso * reps;
    });
  });
  return Math.round(total);
}

// RASCUNHO
function salvarRascunho() {
  if (!diaAtual) return;
  const inputs = [...document.querySelectorAll("#exercisesList input")];
  const rasc = {
    dia: diaAtual,
    ultimoAcesso: new Date().toISOString(),
    tempoBase: segundos,
    timerEstavaRodando: !!timer,
    exercicios: treinos[diaAtual].exercicios.map((_,i) => ({
      nome: treinos[diaAtual].exercicios[i].nome,
      series: inputs.filter((_,idx) => Math.floor(idx/2) === i)
        .reduce((acc,inp,j) => {
          const idx = Math.floor(j/2);
          if (j%2===0) acc.push({peso: inp.value || inp.placeholder || null, reps: null});
          else if (acc[idx]) acc[idx].reps = inp.value || inp.placeholder || null;
          return acc;
        }, [])
    }))
  };
  set("rascunhoTreino", rasc);
}

// TIMER
function atualizarTimer() {
  const m = String(Math.floor(segundos/60)).padStart(2,'0');
  const s = String(segundos%60).padStart(2,'0');
  const el = document.querySelector(".timer");
  if (el) el.textContent = `${m}:${s}`;
}
function iniciarTimer() {
  if (timer) return;
  timer = setInterval(() => { segundos++; atualizarTimer(); salvarRascunho(); }, 1000);
  document.getElementById("timerBtn").textContent = "Parar Timer";
}
function pararTimer() {
  clearInterval(timer); timer = null;
  document.getElementById("timerBtn").textContent = "Iniciar Timer";
  salvarRascunho();
}

// ABRIR TREINO
function abrirTreino(dia, rasc = null) {
  diaAtual = dia;
  document.getElementById("workoutTitle").textContent = dia;
  document.getElementById("exercisesList").innerHTML = "";

  const ultimo = get("treinosRealizados").filter(t=>t.dia===dia).sort((a,b)=>b.data.localeCompare(a.data))[0];

  treinos[dia].exercicios.forEach((ex,i) => {
    const div = document.createElement("div"); div.className = "exercise";
    const header = document.createElement("div"); header.className = "exercise-header";
    header.innerHTML = `${ex.nome} <span style="color:#888; font-weight:normal">— ${ex.grupo}</span>`;
    header.onclick = () => {
      const series = div.querySelector(".series");
      if (series) series.classList.toggle("show");
      header.classList.toggle("open");
    };

    const seriesDiv = document.createElement("div"); seriesDiv.className = "series";

    for (let s=1; s<=ex.series; s++) {
      const linha = document.createElement("div");
      linha.style.cssText = "margin:14px 0;display:flex;align-items:center;justify-content:center;gap:8px;";
      const p = document.createElement("input"); p.type="number"; p.placeholder="Peso";
      const r = document.createElement("input"); r.type="number"; r.placeholder = ex.reps ? String(ex.reps) : "Reps";

      if (ultimo?.exercicios?.[i]?.series?.[s-1]) {
        const u = ultimo.exercicios[i].series[s-1];
        if (u.peso) p.placeholder = u.peso;
        if (u.reps) r.placeholder = u.reps;
      }
      if (rasc?.exercicios?.[i]?.series?.[s-1]) {
        const d = rasc.exercicios[i].series[s-1];
        if (d.peso) p.value = d.peso;
        if (d.reps) r.value = d.reps;
      }

      p.oninput = r.oninput = salvarRascunho;

      linha.innerHTML = `<strong style="width:80px">Série ${s}:</strong>`;
      linha.appendChild(p);
      linha.appendChild(document.createTextNode("kg ×"));
      linha.appendChild(r);
      linha.appendChild(document.createTextNode("reps"));
      seriesDiv.appendChild(linha);
    }

    div.appendChild(header);
    div.appendChild(seriesDiv);
    document.getElementById("exercisesList").appendChild(div);
  });

  segundos = rasc ? rasc.tempoBase : 0;
  if (rasc?.timerEstavaRodando) iniciarTimer();
  atualizarTimer();
  salvarRascunho();

  document.getElementById("timerBtn").onclick = () => timer ? pararTimer() : iniciarTimer();
  document.getElementById("finishWorkout").onclick = finalizarTreino;
}

// FINALIZAR
function finalizarTreino() {
  if (!confirm("Finalizar e salvar esse treino agora?")) return;
  pararTimer();

  const dados = {
    dia: diaAtual,
    data: new Date().toISOString().split('T')[0],
    tempoSegundos: segundos,
    exercicios: treinos[diaAtual].exercicios.map((e,i) => ({
      nome: e.nome,
      series: [...document.querySelectorAll(`#exercisesList .exercise:nth-child(${i+1}) input`)]
        .reduce((acc,inp,j) => {
          const idx = Math.floor(j/2);
          if (j%2===0) acc.push({peso: inp.value || inp.placeholder || null, reps: null});
          else if (acc[idx]) acc[idx].reps = inp.value || inp.placeholder || null;
          return acc;
        }, [])
    }))
  };

  dados.tonelagem = calcularTonelagem(dados.exercicios);

  const todos = get("treinosRealizados");
  todos.push(dados);
  set("treinosRealizados", todos);
  del("rascunhoTreino");

  alert(`Treino salvo com sucesso!\n\nTonelagem do dia: ${dados.tonelagem.toLocaleString()} kg`);
  mostrarTela("home");
}

// TELA INICIAL
function mostrarInicio() {
  const lista = document.getElementById("daysList");
  lista.innerHTML = "";
  const feitos = get("treinosRealizados");
  Object.keys(treinos).forEach(dia => {
    const qtd = feitos.filter(t=>t.dia===dia).length;
    const card = document.createElement("div"); card.className="workout-day";
    card.innerHTML = `<strong>${dia}</strong><br><small>${qtd} ${qtd===1?"vez":"vezes"} realizada${qtd===1?"":"s"}</small>`;
    card.onclick = () => { mostrarTela("workoutScreen"); abrirTreino(dia); };
    lista.appendChild(card);
  });
}

function mostrarTela(tela) {
  ["home","workoutScreen","statsScreen"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });
  document.getElementById(tela).classList.remove("hidden");
  if (tela === "home") {
    pararTimer();
    diaAtual = null;
    segundos = 0;
    atualizarTimer();
  }
}

// =============== ESTATÍSTICAS — VERSÃO CORRIGIDA ===============
function carregarStats() {
  const content = document.getElementById("statsContent");
  if (!content) return;

  const treinosFeitos = get("treinosRealizados");
  if (treinosFeitos.length === 0) {
    content.innerHTML = "<p style='text-align:center;padding:80px;color:#666;font-size:1.2em'>Nenhum treino registrado ainda.<br><br>Vamos mudar isso?</p>";
    return;
  }

  // Garante que o HTML novo está lá
  content.innerHTML = `
    <div class="stat-section">
      <h3>Evolução da Tonelagem por Treino</h3>
      <select id="selectDiaTonelagem"><option value="">Selecione um dia</option></select>
      <canvas id="chartTonelagemDia"></canvas>
    </div>
    <div class="stat-section">
      <h3>Tonelagem por Grupo Muscular</h3>
      <canvas id="chartGruposMusculares"></canvas>
    </div>
    <div class="stat-section">
      <h3>Evolução da Carga Máxima por Exercício</h3>
      <select id="selectExercicioCarga"><option value="">Selecione um exercício</option></select>
      <canvas id="chartCargaExercicio"></canvas>
    </div>
    <div class="stat-section">
      <h3>Últimos 12 treinos</h3>
      <div id="listaUltimosTreinos"></div>
    </div>
  `;

  preencherDropdownDias(treinosFeitos);
  preencherDropdownExercicios(treinosFeitos);
  graficoTonelagemPorGrupo(treinosFeitos);
  listaUltimosTreinos(treinosFeitos);
  // gráficos individuais só aparecem quando selecionar
}

function preencherDropdownDias(treinos) {
  const select = document.getElementById("selectDiaTonelagem");
  const dias = [...new Set(treinos.map(t => t.dia))].sort();
  dias.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d; opt.textContent = d;
    select.appendChild(opt);
  });
  select.onchange = () => graficoTonelagemPorDia(treinos);
}

function preencherDropdownExercicios(treinos) {
  const todos = new Set();
  treinos.forEach(t => t.exercicios.forEach(ex => todos.add(ex.nome)));
  const select = document.getElementById("selectExercicioCarga");
  [...todos].sort().forEach(nome => {
    const opt = document.createElement("option");
    opt.value = nome; opt.textContent = nome;
    select.appendChild(opt);
  });
  select.onchange = () => graficoCargaMaximaExercicio(treinos);
}

function graficoTonelagemPorDia(treinos) {
  const dia = document.getElementById("selectDiaTonelagem").value;
  const ctx = document.getElementById("chartTonelagemDia").getContext("2d");
  if (window.chart1) window.chart1.destroy();
  if (!dia) { ctx.canvas.height = 0; return; }
  ctx.canvas.height = 300;

  const dados = treinos.filter(t => t.dia === dia).sort((a,b) => a.data.localeCompare(b.data));
  const labels = dados.map(t => new Date(t.data).toLocaleDateString('pt-BR'));
  const valores = dados.map(t => t.tonelagem || calcularTonelagem(t.exercicios));

  window.chart1 = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: 'Tonelagem (kg)', data: valores, borderColor: '#ff6b35', backgroundColor: 'rgba(255,107,53,0.2)', tension: 0.3, fill: true }] },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}

function graficoTonelagemPorGrupo(treinos) {
  const grupos = {};
  treinos.forEach(t => {
    t.exercicios.forEach(ex => {
      const grupo = treinos[t.dia]?.exercicios.find(e => e.nome === ex.nome)?.grupo || "Outro";
      ex.series.forEach(s => {
        const vol = (Number(s.peso)||0) * (Number(s.reps)||0);
        if (vol > 0) grupos[grupo] = (grupos[grupo]||0) + vol;
      });
    });
  });

  const ctx = document.getElementById("chartGruposMusculares").getContext("2d");
  if (window.chart2) window.chart2.destroy();

  const sorted = Object.entries(grupos).sort((a,b) => b[1]-a[1]);
  window.chart2 = new Chart(ctx, {
    type: 'bar',
    data: { labels: sorted.map(x=>x[0]), datasets: [{ label: 'Volume (kg)', data: sorted.map(x=>Math.round(x[1])), backgroundColor: '#ff6b35' }] },
    options: { responsive: true, indexAxis: 'y', plugins: { legend: { display: false } } }
  });
}

function listaUltimosTreinos(treinos) {
  const div = document.getElementById("listaUltimosTreinos");
  div.innerHTML = "";
  treinos.slice(-12).reverse().forEach(t => {
    const ton = t.tonelagem || calcularTonelagem(t.exercicios);
    const dataBR = new Date(t.data).toLocaleDateString('pt-BR');
    const el = document.createElement("div");
    el.style.cssText = "background:#1a1a1a;padding:15px;margin:8px 0;border-radius:12px;border-left:5px solid #ff6b35;";
    el.innerHTML = `<strong>${t.dia}</strong><br>${dataBR} — <span style="color:#ff6b35;font-size:1.3em">${ton.toLocaleString()} kg</span>`;
    div.appendChild(el);
  });
}

function graficoCargaMaximaExercicio(treinos) {
  const ex = document.getElementById("selectExercicioCarga").value;
  const ctx = document.getElementById("chartCargaExercicio").getContext("2d");
  if (window.chart3) window.chart3.destroy();
  if (!ex) { ctx.canvas.height = 0; return; }
  ctx.canvas.height = 300;

  const dados = [];
  treinos.forEach(t => {
    const e = t.exercicios.find(e => e.nome === ex);
    if (e) {
      const max = Math.max(...e.series.map(s => Number(s.peso)||0).filter(p=>p>0));
      if (max > 0) dados.push({ data: t.data, dia: t.dia, peso: max });
    }
  });

  if (dados.length === 0) { ctx.canvas.parentNode.innerHTML += "<p style='text-align:center;color:#888;padding:20px'>Sem dados</p>"; return; }

  dados.sort((a,b) => a.data.localeCompare(b.data));
  window.chart3 = new Chart(ctx, {
    type: 'line',
    data: { labels: dados.map(d => new Date(d.data).toLocaleDateString('pt-BR')), datasets: [{ label: 'Carga máxima (kg)', data: dados.map(d=>d.peso), borderColor: '#ff6b35', backgroundColor: 'rgba(255,107,53,0.3)', tension: 0.3, fill: true }] },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}

// EVENTOS
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("viewStats")?.addEventListener('click', () => { mostrarTela("statsScreen"); carregarStats(); });
  document.getElementById("backFromWorkout")?.addEventListener('click', () => { pararTimer(); salvarRascunho(); mostrarTela("home"); });
  document.getElementById("backFromStats")?.addEventListener('click', () => mostrarTela("home"));
  document.getElementById("discardWorkout")?.addEventListener('click', () => {
    if (confirm("Descartar todo o progresso desse treino?")) { pararTimer(); del("rascunhoTreino"); mostrarTela("home"); }
  });
});

// INÍCIO
window.onload = () => {
  mostrarInicio();
  const rasc = get("rascunhoTreino");
  if (rasc?.dia && confirm("Você tem um treino em andamento. Deseja continuar?")) {
    mostrarTela("workoutScreen");
    abrirTreino(rasc.dia, rasc);
  } else if (rasc?.dia) {
    del("rascunhoTreino");
  }
};

// REGISTRO DO SERVICE WORKER (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW registrado com sucesso!', reg))
      .catch(err => console.log('Falha ao registrar SW:', err));
  });
}

// ====== BOTÃO MANUAL DE INSTALAÇÃO PWA (funciona 100% no celular) ======
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Mostra o botão só no celular
  if (/Android|iPhone|iPad|iPod|webOS|BlackBerry|Windows Phone/i.test(navigator.userAgent)) {
    document.getElementById('installContainer').style.display = 'block';
  }
});

document.getElementById('installBtn')?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    document.getElementById('installContainer').style.display = 'none';
    console.log('App instalado com sucesso!');
  }
  deferredPrompt = null;
});