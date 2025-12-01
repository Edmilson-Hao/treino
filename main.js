// main.js — Treino + Timer + Salvamento + PWA (Gorila Mode Clean)

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

// TONELAGEM
function calcularTonelagem(exercicios) {
  let total = 0;
  exercicios.forEach(ex => {
    ex.series.forEach(s => {
      const p = Number(s.peso)||0, r = Number(s.reps)||0;
      if (p>0 && r>0) total += p * r;
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
    header.innerHTML = `${ex.nome} <span style="color:#778DA9; font-weight:normal">— ${ex.grupo}</span>`;
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

// FINALIZAR TREINO (agora salva o grupo!)
function finalizarTreino() {
  Swal.confirm("Finalizar e salvar esse treino agora?").then(result => {
    if (!result) return;
    pararTimer();

    const dados = {
      dia: diaAtual,
      data: new Date().toISOString().split('T')[0],
      tempoSegundos: segundos,
      exercicios: treinos[diaAtual].exercicios.map((e,i) => {
        const seriesSalvas = [...document.querySelectorAll(`#exercisesList .exercise:nth-child(${i+1}) input`)]
          .reduce((acc,inp,j) => {
            const idx = Math.floor(j/2);
            if (j%2===0) acc.push({peso: inp.value || inp.placeholder || null, reps: null});
            else if (acc[idx]) acc[idx].reps = inp.value || inp.placeholder || null;
            return acc;
          }, []);
        return {
          nome: e.nome,
          grupo: e.grupo,  // ← ESSA LINHA RESOLVEU O BUG DO "OUTRO"
          series: seriesSalvas
        };
      })
    };

    dados.tonelagem = calcularTonelagem(dados.exercicios);

    const todos = get("treinosRealizados");
    todos.push(dados);
    set("treinosRealizados", todos);
    // FORÇA LIMPEZA TOTAL DO RASCUNHO (nunca mais vai dar falso positivo)
    localStorage.removeItem("rascunhoTreino");
    sessionStorage.removeItem("rascunhoTreino"); // por segurança

    Swal.fire({
      title: "Treino Salvo!",
      text: `Tonelagem do dia: ${dados.tonelagem.toLocaleString()} kg`,
      confirmButtonText: "Brabo!"
    }).then(() => mostrarTela("home"));
  });
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

// EVENTOS
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("viewStats")?.addEventListener('click', () => {
    mostrarTela("statsScreen");
    carregarStats(); // função que está em stats.js
  });
  document.getElementById("backFromWorkout")?.addEventListener('click', () => {
    pararTimer(); salvarRascunho(); mostrarTela("home");
  });
  document.getElementById("backFromStats")?.addEventListener('click', () => mostrarTela("home"));
  document.getElementById("discardWorkout")?.addEventListener('click', () => {
    Swal.confirm("Descartar todo o progresso desse treino?").then(result => {
      if (result) { pararTimer(); del("rascunhoTreino"); mostrarTela("home"); }
    });
  });
});

// PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW registrado!', reg))
      .catch(err => console.log('Erro SW:', err));
  });
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
    document.getElementById('installContainer').style.display = 'block';
  }
});
document.getElementById('installBtn')?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') document.getElementById('installContainer').style.display = 'none';
  deferredPrompt = null;
});

// === BACKUP MANUAL DOS TREINOS ===
document.getElementById("backupBtn")?.addEventListener("click", () => {
  const dados = get("treinosRealizados");
  const blob = new Blob([JSON.stringify(dados, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `meus-treinos-gorila-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  Swal.fire({title:"Backup feito!",text:"Arquivo baixado com todos os seus treinos.",confirmButtonText:"Brabo!"});
});

document.getElementById("restoreBtn")?.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const dados = JSON.parse(ev.target.result);
        if (Array.isArray(dados)) {
          set("treinosRealizados", dados);
          Swal.fire({title:"Backup restaurado!",text:`${dados.length} treinos carregados com sucesso.`,confirmButtonText:"Monstro!"})
            .then(() => location.reload());
        } else throw "Formato inválido";
      } catch (err) {
        Swal.fire({title:"Erro",text:"Arquivo inválido ou corrompido.",confirmButtonText:"OK"});
      }
    };
    reader.readAsText(file);
  };
  input.click();
});

window.onload = () => {
  mostrarInicio();

  // === VERIFICAÇÃO BLINDADA DO RASCUNHO ===
  const rasc = get("rascunhoTreino");

  // Se o rascunho existe, mas o dia já foi finalizado depois da data do rascunho → ignora!
  if (rasc?.dia) {
    const ultimoTreinoDoDia = get("treinosRealizados")
      .filter(t => t.dia === rasc.dia)
      .sort((a,b) => b.data.localeCompare(a.data))[0];

    // Se já existe um treino finalizado mais recente que o rascunho → descarta o rascunho fantasma
    if (ultimoTreinoDoDia && ultimoTreinoDoDia.data >= rasc.ultimoAcesso.split('T')[0]) {
      del("rascunhoTreino");
      console.log("Rascunho fantasma removido automaticamente.");
      return;
    }

    // Só mostra o aviso se o rascunho for realmente válido
    Swal.fire({
      title: "Treino em andamento!",
      text: `Você parou no ${rasc.dia}. Deseja continuar?`,
      showCancelButton: true,
      confirmButtonText: "Sim, continuar",
      cancelButtonText: "Não, descartar"
    }).then(result => {
      if (result) {
        mostrarTela("workoutScreen");
        abrirTreino(rasc.dia, rasc);
      } else {
        del("rascunhoTreino");
      }
    });
  }
};