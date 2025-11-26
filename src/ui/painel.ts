import { sim } from '../render/mapa.js';

let dronesList: HTMLUListElement;
let pendentesList: HTMLUListElement;
let concluidasList: HTMLUListElement;
let rejeitadasList: HTMLUListElement;
let totalEntregasEl: HTMLParagraphElement;

window.addEventListener('DOMContentLoaded', () => {
    dronesList = document.getElementById('dronesDisponiveis') as HTMLUListElement;
    pendentesList = document.getElementById('entregasPendentes') as HTMLUListElement;
    concluidasList = document.getElementById('entregasConcluidas') as HTMLUListElement;
    rejeitadasList = document.getElementById('entregasRejeitadas') as HTMLUListElement;
    totalEntregasEl = document.getElementById('totalEntregas') as HTMLParagraphElement;

    atualizarPainel();
});

// Atualiza painel
export function atualizarPainel() {
    dronesList.innerHTML = '';
    pendentesList.innerHTML = '';
    concluidasList.innerHTML = '';
    rejeitadasList.innerHTML = '';

    const estado = sim.getEstado();

    // Exibe drones
    estado.drones.forEach(d => {
        const li = document.createElement('li');
        li.textContent = `${d.nome} (${d.estado}) | Peso máximo: ${d.pesoMaximo} kg`;

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

    // Exibe entregas
    estado.entregas.forEach(e => {
        const li = document.createElement('li');
        const pesoTexto = ` (Peso: ${e.peso} kg)`;
        const prioridadeTexto = ` [Prioridade: ${e.prioridade === 1 ? 'Alta' : e.prioridade === 2 ? 'Média' : 'Baixa'}]`;
        const droneTexto = e.drone ? ` (Drone ${e.drone.id})` : '';

        if (e.status === 'pendente') {
            li.textContent = `${e.descricao}${pesoTexto}${prioridadeTexto}${droneTexto}`;
            pendentesList.appendChild(li);
        } else if (e.status === 'concluida') {
            li.textContent = `${e.descricao}${pesoTexto}${prioridadeTexto}${droneTexto}`;
            concluidasList.appendChild(li);
        } else if (e.status === 'rejeitada') {
            li.textContent = `${e.descricao}${pesoTexto}${prioridadeTexto}${droneTexto}`;
            if (e.motivoRejeicao) li.textContent += ` - ${e.motivoRejeicao}`;
            rejeitadasList.appendChild(li);
        }
    });

    totalEntregasEl.textContent = estado.entregas.filter(e => e.status === 'concluida').length.toString();
}
