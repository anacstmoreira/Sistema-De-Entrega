import { Simulacao } from './services/simulacao.js';
const canvas = document.getElementById('mapa');
const ctx = canvas.getContext('2d');
const BASE_X = canvas.width / 2;
const BASE_Y = canvas.height / 2;
const sim = new Simulacao(BASE_X, BASE_Y, canvas.width, canvas.height);
// DOM
const dronesList = document.getElementById('dronesDisponiveis');
const pendentesList = document.getElementById('entregasPendentes');
const concluidasList = document.getElementById('entregasConcluidas');
const rejeitadasList = document.getElementById('entregasRejeitadas');
const totalEntregasEl = document.getElementById('totalEntregas');
// Atualiza painel
function atualizarPainel() {
    dronesList.innerHTML = '';
    pendentesList.innerHTML = '';
    concluidasList.innerHTML = '';
    rejeitadasList.innerHTML = '';
    const estado = sim.getEstado();
    estado.drones.forEach(d => {
        const li = document.createElement('li');
        li.textContent = `${d.nome} (${d.estado}) | Peso máximo: ${d.pesoMaximo} kg `;
        // Barra de bateria
        const barraContainer = document.createElement('div');
        barraContainer.style.display = 'inline-block';
        barraContainer.style.width = '80px';
        barraContainer.style.height = '10px';
        barraContainer.style.background = '#ddd';
        barraContainer.style.marginLeft = '10px';
        barraContainer.style.verticalAlign = 'middle';
        const barraBateria = document.createElement('div');
        barraBateria.style.width = `${d.bateria}%`;
        barraBateria.style.height = '100%';
        barraBateria.style.background = d.bateria < 20 ? 'red' : 'green';
        barraContainer.appendChild(barraBateria);
        li.appendChild(barraContainer);
        dronesList.appendChild(li);
    });
    estado.entregas.forEach(e => {
        const li = document.createElement('li');
        const pesoTexto = ` (Peso: ${e.peso} kg)`;
        if (e.status === 'pendente') {
            li.textContent = e.descricao + pesoTexto + (e.drone ? ` (Drone ${e.drone.id})` : '');
            pendentesList.appendChild(li);
        }
        else if (e.status === 'concluida') {
            li.textContent = e.descricao + pesoTexto + (e.drone ? ` (Drone ${e.drone.id})` : '');
            concluidasList.appendChild(li);
        }
        else if (e.status === 'rejeitada') {
            li.textContent = e.descricao + pesoTexto + (e.drone ? ` (Drone ${e.drone.id})` : '');
            if (e.motivoRejeicao)
                li.textContent += ` - ${e.motivoRejeicao}`;
            rejeitadasList.appendChild(li);
        }
    });
    totalEntregasEl.textContent = estado.entregas.filter(e => e.status === 'concluida').length.toString();
}
function desenharMapa() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Fundo
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const estado = sim.getEstado();
    const { mapa, gridSize } = estado;
    // Obstáculos
    for (let r = 0; r < mapa.length; r++) {
        for (let c = 0; c < mapa[0].length; c++) {
            if (mapa[r][c] === 1) {
                ctx.fillStyle = 'darkgray';
                ctx.fillRect(c * gridSize, r * gridSize, gridSize, gridSize);
            }
        }
    }
    //Grid
    ctx.strokeStyle = '#ccc';
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    //Entregas
    estado.entregas.forEach(e => {
        ctx.fillStyle = e.status === 'concluida' ? 'green' : 'red';
        ctx.beginPath();
        ctx.arc(e.destinoX, e.destinoY, 5, 0, Math.PI * 2);
        ctx.fill();
    });
    //Drones
    estado.drones.forEach(d => {
        let cor = 'black';
        switch (d.estado) {
            case 'idle':
                cor = 'green';
                break;
            case 'emRota':
                cor = 'blue';
                break;
            case 'retornando':
                cor = 'purple';
                break;
        }
        ctx.fillStyle = cor;
        ctx.beginPath();
        ctx.arc(d.posX, d.posY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';
        ctx.fillText(d.id.toString(), d.posX - 3, d.posY + 3);
    });
}
//Fila de entregas
export const filaEntregas = [];
export function adicionarFila(entrega) {
    filaEntregas.push(entrega);
    filaEntregas.sort((a, b) => a.prioridade !== b.prioridade ? a.prioridade - b.prioridade : a.tempoChegada - b.tempoChegada);
}
function alocarEntrega(drone) {
    if (drone.entregaAtual)
        return;
    const entrega = sim.getEstado().entregas.find(e => e.status === 'pendente' &&
        !e.drone &&
        e.peso <= drone.pesoMaximo);
    if (!entrega)
        return;
    const ok = entrega.atribuirDrone(drone);
    if (!ok)
        return;
    drone.carregarEntrega(entrega);
    entrega.drone = drone;
    drone.calcularCaminho(entrega.destinoX, entrega.destinoY, sim.GRID_SIZE, sim.mapa);
    drone.estado = 'emRota';
}
//Drones e entregas iniciais
if (sim.getEstado().drones.length === 0)
    sim.adicionarDrone("Drone01", 5, BASE_X, BASE_Y);
if (sim.getEstado().drones.length === 1)
    sim.adicionarDrone("Drone02", 5, BASE_X, BASE_Y);
if (sim.getEstado().entregas.length === 0)
    sim.adicionarEntrega("Entrega 1", 1, Math.random() * canvas.width, Math.random() * canvas.height);
if (sim.getEstado().entregas.length === 1)
    sim.adicionarEntrega("Entrega 2", 1, Math.random() * canvas.width, Math.random() * canvas.height);
if (sim.getEstado().entregas.length === 2)
    sim.adicionarEntrega("Entrega 3", 1, Math.random() * canvas.width, Math.random() * canvas.height);
//Loop principal
function loop() {
    const estado = sim.getEstado();
    //Atualiza drones apenas se a simulação estiver ativa
    if (sim.estaAtiva) {
        estado.drones.forEach(drone => {
            drone.atualizarPosicao(sim.GRID_SIZE, BASE_X, BASE_Y, estado.mapa);
            alocarEntrega(drone);
        });
    }
    //Sempre atualizar painel e desenhar mapa
    atualizarPainel();
    desenharMapa();
    requestAnimationFrame(loop); // continua chamando o loop sempre
}
//Inicia loop uma vez
loop();
//Botões
const modalDrone = document.getElementById('modalDrone');
const modalEntrega = document.getElementById('modalEntrega');
document.getElementById('btnAdicionarDrone')?.addEventListener('click', () => modalDrone.style.display = 'flex');
document.getElementById('btnAdicionarEntrega')?.addEventListener('click', () => modalEntrega.style.display = 'flex');
document.getElementById('cancelDrone')?.addEventListener('click', () => modalDrone.style.display = 'none');
document.getElementById('cancelEntrega')?.addEventListener('click', () => modalEntrega.style.display = 'none');
document.getElementById('confirmDrone')?.addEventListener('click', () => {
    const nome = document.getElementById('droneNome').value || `Drone`;
    const peso = parseFloat(document.getElementById('dronePeso').value || "5");
    sim.adicionarDrone(nome, peso, BASE_X, BASE_Y);
    modalDrone.style.display = 'none';
});
document.getElementById('confirmEntrega')?.addEventListener('click', () => {
    const descricao = document.getElementById('entregaDesc').value || "Entrega";
    const peso = parseFloat(document.getElementById('entregaPeso').value || "1");
    let x = 0, y = 0;
    let destinoValido = false;
    while (!destinoValido) {
        const px = Math.random() * canvas.width;
        const py = Math.random() * canvas.height;
        const gx = Math.floor(px / sim.GRID_SIZE);
        const gy = Math.floor(py / sim.GRID_SIZE);
        if (sim.mapa[gy] && sim.mapa[gy][gx] === 0) {
            destinoValido = true;
            x = px;
            y = py;
        }
    }
    sim.adicionarEntrega(descricao, peso, x, y);
    modalEntrega.style.display = 'none';
});
document.getElementById('btnIniciarSimulacao')?.addEventListener('click', () => {
    sim.iniciarSimulacao();
    loop();
});
document.getElementById('btnEncerrarSimulacao')?.addEventListener('click', () => sim.encerrarSimulacao());
// Seleciona elementos
const modalBemVindo = document.getElementById('modalBemVindo');
const btnFecharBemVindo = document.getElementById('btnFecharBemVindo');
// Exibe o modal ao carregar
window.addEventListener('load', () => {
    modalBemVindo.style.display = 'flex';
});
// Fecha o modal ao clicar no botão
btnFecharBemVindo.addEventListener('click', () => {
    modalBemVindo.style.display = 'none';
});
