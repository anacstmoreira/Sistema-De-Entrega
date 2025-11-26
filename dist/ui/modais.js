import { sim, BASE_X, BASE_Y, canvas } from "../render/mapa.js";
import { loop } from "../services/loop.js";
import { atualizarPainel } from "./painel.js";
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
    atualizarPainel();
});
document.getElementById('confirmEntrega')?.addEventListener('click', () => {
    const descricao = document.getElementById('entregaDesc').value || "Entrega";
    const peso = parseFloat(document.getElementById('entregaPeso').value || "1");
    const prioridade = parseInt(document.getElementById('entregaPrioridade').value || "2"); // nova linha
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
    sim.adicionarEntrega(descricao, peso, prioridade); // passa a prioridade
    modalEntrega.style.display = 'none';
    atualizarPainel();
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
