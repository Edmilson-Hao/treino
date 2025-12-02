// main.js — Gorila Mode: enxuto, rápido e indestrutível
const treinos = { /* ← seu objeto de treinos (mantido igual) */ 
  "Dia 1 - Supino": { exercicios: [ {nome:"Supino Inclinado Halteres",series:4,reps:null,grupo:"Peito"}, /* ... todo o resto igual ... */ ]},
  "Dia 2 - Terra": { exercicios: [ /* ... */ ]},
  "Dia 3 - Agachamento": { exercicios: [ /* ... */ ]}
};

let diaAtual = null, segundos = 0, timer = null;
const get = k => JSON.parse(localStorage.getItem(k) || (k==="treinosRealizados"?"[]":"null"));
const set = (k,v) => localStorage.setItem(k, JSON.stringify(v));
const del = k => localStorage.removeItem(k);

function calcularTonelagem(exs) {
  return Math.round(exs.reduce((t,ex) => t + ex.series.reduce((s,sr) => s + (Number(sr.peso)||0)*(Number(sr.reps)||0), 0), 0));
}

function salvarRascunho() {
  if (!diaAtual) return;
  const inputs = [...document.querySelectorAll("#exercisesList input")];
  const rasc = {
    dia: diaAtual,
    data: new Date().toISOString().split('T')[0],
    tempo: segundos,
    rodando: !!timer,
    exs: treinos[diaAtual].exercicios.map((_,i) => ({
      nome: treinos[diaAtual].exercicios[i].nome,
      series: inputs.filter((_,j)=>Math.floor(j/2)===i).reduce((a,inp,j)=>(j%2===0?a.push({peso:inp.value||inp.placeholder||null,reps:null}):a[a.length-1].reps=inp.value||inp.placeholder||null,a),[])
    }))
  };
  set("rascunho", rasc);
}

function timerAtualizar() {
  const m = String(Math.floor(segundos/60)).padStart(2,'0');
  const s = String(segundos%60).padStart(2,'0');
  document.querySelector(".timer").textContent = `${m}:${s}`;
}
function timerToggle() {
  if (timer) { clearInterval(timer); timer=null; document.getElementById("timerBtn").textContent="Iniciar Timer"; }
  else { timer=setInterval(()=>{segundos++;timerAtualizar();salvarRascunho();},1000); document.getElementById("timerBtn").textContent="Parar Timer"; }
}

function abrirTreino(dia, rasc=null) {
  diaAtual = dia;
  document.getElementById("workoutTitle").textContent = dia;
  document.getElementById("exercisesList").innerHTML = "";
  const ultimo = get("treinosRealizados").filter(t=>t.dia===dia).sort((a,b)=>b.data.localeCompare(a.data))[0];

  treinos[dia].exercicios.forEach((ex,i) => {
    const div = Object.assign(document.createElement("div"), {className:"exercise"});
    const header = Object.assign(document.createElement("div"), {className:"exercise-header", innerHTML: `${ex.nome} — <small>${ex.grupo}</small>`});
    header.onclick = () => div.querySelector(".series").classList.toggle("show") || header.classList.toggle("open");
    const seriesDiv = Object.assign(document.createElement("div"), {className:"series"});

    for (let s=1; s<=ex.series; s++) {
      const linha = document.createElement("div");
      linha.style = "margin:14px 0;display:flex;align-items:center;justify-content:center;gap:8px;";
      const p = Object.assign(document.createElement("input"),{type:"number",placeholder:"Peso",oninput:salvarRascunho});
      const r = Object.assign(document.createElement("input"),{type:"number",placeholder:ex.reps|| "Reps",oninput:salvarRascunho});

      if (ultimo?.exercicios[i]?.series[s-1]) { p.placeholder = ultimo.exercicios[i].series[s-1].peso || p.placeholder; r.placeholder = ultimo.exercicios[i].series[s-1].reps || r.placeholder; }
      if (rasc?.exs[i]?.series[s-1]) { p.value = rasc.exs[i].series[s-1].peso; r.value = rasc.exs[i].series[s-1].reps; }

      linha.innerHTML = `<strong>S${s}:</strong>`;
      linha.append(p, "kg ×", r, "reps");
      seriesDiv.appendChild(linha);
    }
    div.append(header, seriesDiv);
    document.getElementById("exercisesList").appendChild(div);
  });

  segundos = rasc?.tempo || 0;
  if (rasc?.rodando) timerToggle();
  timerAtualizar();
  salvarRascunho();

  document.getElementById("timerBtn").onclick = timerToggle;
  document.getElementById("finishWorkout").onclick = finalizarTreino;
}

function finalizarTreino() {
  Swal.confirm("Salvar treino agora?").then(ok => {
    if (!ok) return;
    timer && clearInterval(timer);
    const dados = {
      dia: diaAtual,
      data: new Date().toISOString().split('T')[0],
      tempoSegundos: segundos,
      exercicios: treinos[diaAtual].exercicios.map((e,i) => ({
        nome: e.nome,
        grupo: e.grupo,
        series: [...document.querySelectorAll(`#exercisesList .exercise:nth-child(${i+1}) input`)].reduce((a,inp,j)=>(j%2===0?a.push({peso:inp.value||inp.placeholder||null,reps:null}):a[a.length-1].reps=inp.value||inp.placeholder||null,a),[])
      }))
    };
    dados.tonelagem = calcularTonelagem(dados.exercicios);
    const todos = get("treinosRealizados"); todos.push(dados); set("treinosRealizados", todos);
    del("rascunho");
    Swal.fire({title:"Salvo!",text:`${dados.tonelagem.toLocaleString()} kg`,confirmButtonText:"BRABO!"}).then(()=>location.href="/");
  });
}

function mostrarInicio() {
  const lista = document.getElementById("daysList"); lista.innerHTML="";
  const feitos = get("treinosRealizados");
  Object.keys(treinos).forEach(d=> {
    const qtd = feitos.filter(t=>t.dia===d).length;
    const card = Object.assign(document.createElement("div"),{className:"workout-day",innerHTML:`<strong>${d}</strong><small>${qtd} vez${qtd!==1?"es":""}</small>`});
    card.onclick = () => { mostrarTela("workoutScreen"); abrirTreino(d); };
    lista.appendChild(card);
  });
}

function mostrarTela(t) {
  document.querySelectorAll("#home,#workoutScreen,#statsScreen").forEach(el=>el.classList.add("hidden"));
  document.getElementById(t).classList.remove("hidden");
  if (t==="home") { timer&&clearInterval(timer); diaAtual=null; segundos=0; timerAtualizar(); }
}

// ====== BACKUP MANUAL (BRABO) ======
document.getElementById("backupBtn")?.addEventListener("click", () => {
  const data = get("treinosRealizados");
  const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `treinos-gorila-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  Swal.fire("Backup feito!","Arquivo baixado.","success");
});

document.getElementById("restoreBtn")?.addEventListener("click", () => {
  const input = Object.assign(document.createElement("input"),{type:"file",accept:".json"});
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const dados = JSON.parse(ev.target.result);
        if (Array.isArray(dados)) { set("treinosRealizados",dados); Swal.fire("Restaurado!",`${dados.length} treinos carregados.`,"success").then(()=>location.reload()); }
      } catch { Swal.fire("Erro","Arquivo inválido.","error"); }
    };
    reader.readAsText(file);
  };
  input.click();
});

// ====== INICIO + RASCUNHO SEM FANTASMA ======
window.onload = () => {
  mostrarInicio();
  const rasc = get("rascunho");
  if (rasc?.dia) {
    const ultimo = get("treinosRealizados").findLast(t=>t.dia===rasc.dia);
    if (ultimo && ultimo.data >= rasc.data) { del("rascunho"); return; }
    Swal.fire({title:"Treino pausado",text:`Continuar ${rasc.dia}?`,showCancelButton:true,confirmButtonText:"Sim",cancelButtonText:"Não"}).then(res=>{
      if (res) { mostrarTela("workoutScreen"); abrirTreino(rasc.dia, {tempo:rasc.tempo,rodando:rasc.rodando,exs:rasc.exs}); }
      else del("rascunho");
    });
  }
};

// Eventos básicos
document.getElementById("viewStats")?.addEventListener("click",()=>{mostrarTela("statsScreen");carregarStats();});
document.getElementById("backFromWorkout")?.addEventListener("click",()=>{timer&&clearInterval(timer);salvarRascunho();mostrarTela("home");});
document.getElementById("backFromStats")?.addEventListener("click",()=>mostrarTela("home"));
document.getElementById("discardWorkout")?.addEventListener("click",()=>Swal.confirm("Descartar tudo?").then(ok=>{if(ok){timer&&clearInterval(timer);del("rascunho");mostrarTela("home");}}));

// Força atualização do Service Worker quando mudar a versão
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // Novo SW instalado → recarrega
          location.reload();
        }
      });
    });
  });
}

// ====== PWA + BOTÃO DE INSTALAÇÃO (FUNCIONA 100%) ======
let installPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();        // Impede o banner automático do Chrome
  installPrompt = e;         // Guarda o evento pra usar quando quiser
  document.getElementById('installContainer').style.display = 'block';
});

document.getElementById('installBtn')?.addEventListener('click', async () => {
  if (!installPrompt) return;

  installPrompt.prompt(); // Mostra o banner oficial do sistema

  const { outcome } = await installPrompt.userChoice;
  if (outcome === 'accepted') {
    document.getElementById('installContainer').style.display = 'none';
    Swal.fire({
      title: "Instalado com sucesso!",
      text: "Gorila Mode agora está na sua tela inicial",
      icon: "success",
      timer: 2500,
      showConfirmButton: false
    });
  }
  installPrompt = null;
});

// Esconde o botão se já estiver instalado
window.addEventListener('appinstalled', () => {
  document.getElementById('installContainer').style.display = 'none';
});

// ====== VERSIONAMENTO + ATUALIZAÇÃO AUTOMÁTICA + AVISO BRABO ======
// (coloque ESTE BLOCO INTEIRO no final do main.js, depois do window.onload)

const APP_VERSION = "v2.1"; // ← aumenta esse número toda vez que fizer update importante

// Só executa depois que get/set já foram definidos
if (typeof get === "function" && typeof set === "function") {

  // 1. Detecta versão antiga → limpa cache velho, mantém treinos, atualiza
  if (get("appVersion") !== APP_VERSION) {
    const treinosSalvos = get("treinosRealizados") || [];
    const rascunhoSalvo = get("rascunho");

    localStorage.clear(); // limpa tudo que não é dado do usuário

    // Restaura apenas os dados importantes
    set("treinosRealizados", treinosSalvos);
    if (rascunhoSalvo) set("rascunho", rascunhoSalvo);
    set("appVersion", APP_VERSION);
    set("jaMostrouUpdate", APP_VERSION); // evita aviso na primeira carga após update

    location.reload(true); // força reload completo com código novo
  }

  // 2. Mostra o aviso BRABO de atualização (só uma vez por versão)
  if (get("jaMostrouUpdate") !== APP_VERSION) {
    setTimeout(() => {
      Swal.fire({
        title: "ATUALIZAÇÃO CONCLUÍDA!",
        html: `
          <div style="text-align:center;line-height:1.7;font-size:1.1em;">
            <strong>Gorila Mode ${APP_VERSION}</strong><br><br>
            App atualizado com sucesso!<br>
            Bugs esmagados • Performance no talo<br><br>
            <span style="color:#00FF9D;font-size:1.4em;font-weight:900;">BORA CRESCER!</span>
          </div>
        `,
        icon: "success",
        confirmButtonText: "VAMOSSS 🦍",
        allowOutsideClick: false,
        background: "#0D1B2A",
        color: "#E0E1DD",
        customClass: { popup: 'my-swal' }
      }).then(() => {
        set("jaMostrouUpdate", APP_VERSION);
      });
    }, 1000);
  }
}