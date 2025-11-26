import { Simulacao } from "../services/simulacao.js";
export const canvas = document.getElementById('mapa');
const ctx = canvas.getContext('2d');
export const BASE_X = canvas.width / 2;
export const BASE_Y = canvas.height / 2;
export const sim = new Simulacao(BASE_X, BASE_Y, canvas.width, canvas.height);
export function desenharMapa() {
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
