import { Simulacao } from './services/simulacao.js';

const canvas = document.getElementById('mapa') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

const BASE_X = canvas.width / 2;
const BASE_Y = canvas.height / 2;
const sim = new Simulacao(BASE_X, BASE_Y);

// DOM
const dronesList = document.getElementById('dronesDisponiveis') as HTMLUListElement;
const pendentesList = document.getElementById('entregasPendentes') as HTMLUListElement;
const concluidasList = document.getElementById('entregasConcluidas') as HTMLUListElement;
const rejeitadasList = document.getElementById('entregasRejeitadas') as HTMLUListElement;
const totalEntregasEl = document.getElementById('totalEntregas') as HTMLParagraphElement;


// Atualiza painel
function atualizarPainel() {
    dronesList.innerHTML = '';
    pendentesList.innerHTML = '';
    concluidasList.innerHTML = '';
    rejeitadasList.innerHTML = '';

    const estado = sim.getEstado();

    estado.drones.forEach(d => {
        const li = document.createElement('li');
        li.textContent = `${d.nome} (${d.estado})`;
        dronesList.appendChild(li);
    });

    estado.entregas.forEach(e => {
    const li = document.createElement('li');

    if (e.status === 'pendente') {
        li.textContent = e.descricao + (e.drone ? ` (Drone ${e.drone.id})` : '');
        pendentesList.appendChild(li);
    } else if (e.status === 'concluida') {
        li.textContent = e.descricao + (e.drone ? ` (Drone ${e.drone.id})` : '');
        concluidasList.appendChild(li);
    } else if (e.status === 'rejeitada') {
        li.textContent = e.descricao + (e.drone ? ` (Drone ${e.drone.id})` : '');
        if (e.motivoRejeicao) li.textContent += ` - ${e.motivoRejeicao}`;
        rejeitadasList.appendChild(li);
    }
});

    totalEntregasEl.textContent = estado.entregas.length.toString();
}

// Desenha mapa
function desenharMapa() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fundo
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    const gridSize = 50;
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

    const estado = sim.getEstado();

    // Entregas

    estado.entregas.forEach(e => {
        if (e.status === 'concluida') ctx.fillStyle = 'green'; // entrega concluída
        else ctx.fillStyle = 'red'; // pendente ou rejeitada
        ctx.beginPath();
        ctx.arc(e.destinoX, e.destinoY, 5, 0, Math.PI * 2);
        ctx.fill();
});


    // Drones
    estado.drones.forEach(d => {
        let cor = 'black';
        switch(d.estado) {
            case 'idle': cor = 'green'; break;
            case 'carregando': cor = 'yellow'; break;
            case 'emRota': cor = 'blue'; break;
            case 'entregando': cor = 'orange'; break;
            case 'retornando': cor = 'purple'; break;
        }
        ctx.fillStyle = cor;
        ctx.beginPath();
        ctx.arc(d.posX, d.posY, 8, 0, Math.PI * 2);
        ctx.fill();

        // ID drone
        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';
        ctx.fillText(d.id.toString(), d.posX - 3, d.posY + 3);
    });
}

// Drones e entregas de teste iniciais
if (sim.getEstado().drones.length === 0) {
    sim.adicionarDrone("DroneTeste", 5, canvas.width/2, canvas.height/2);
}
if (sim.getEstado().entregas.length === 0) {
    sim.adicionarEntrega("EntregaTeste", 1, canvas.width/4, canvas.height/4);
}

// Loop principal
function loop() {
    atualizarPainel();
    desenharMapa();
    requestAnimationFrame(loop);
}
loop();

// Botões
document.getElementById('btnAdicionarDrone')?.addEventListener('click', () => {
    const nome = prompt("Nome do drone:") || `Drone`;
    const peso = parseFloat(prompt("Peso máximo do drone (kg):") || "5");
    const BASE_X = canvas.width / 2;
    const BASE_Y = canvas.height / 2;
    const drone = sim.adicionarDrone(nome, peso, BASE_X, BASE_Y);
    console.log("Drone adicionado:", drone);
});

document.getElementById('btnAdicionarEntrega')?.addEventListener('click', () => {
    const descricao = prompt("Descrição da entrega:") || `Entrega`;
    const peso = parseFloat(prompt("Peso da entrega (kg):") || "1");
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const entrega = sim.adicionarEntrega(descricao, peso, x, y);
    console.log("Entrega adicionada:", entrega);
});

document.getElementById('btnIniciarSimulacao')?.addEventListener('click', () => sim.iniciarSimulacao());
document.getElementById('btnEncerrarSimulacao')?.addEventListener('click', () => sim.encerrarSimulacao());
