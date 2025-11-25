import { Drone } from '../models/drone.js';
import { Entrega } from '../models/entrega.js';
export class Simulacao {
    constructor(baseX, baseY, canvasWidth, canvasHeight) {
        this.drones = [];
        this.entregas = [];
        this.droneIdCounter = 1;
        this.entregaIdCounter = 1;
        this.simulacaoAtiva = false;
        this.GRID_SIZE = 15;
        this.BASE_X = baseX;
        this.BASE_Y = baseY;
        this.ROWS = Math.floor(canvasHeight / this.GRID_SIZE);
        this.COLS = Math.floor(canvasWidth / this.GRID_SIZE);
        this.mapa = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
        //Geração de obstáculos
        const densidade = 0.20;
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                // Evitar obstáculos muito perto da base
                const baseGX = Math.floor(this.BASE_X / this.GRID_SIZE);
                const baseGY = Math.floor(this.BASE_Y / this.GRID_SIZE);
                if (Math.abs(r - baseGY) <= 2 && Math.abs(c - baseGX) <= 2) {
                    continue;
                }
                // Gera blocos pequenos espalhados
                if (Math.random() < densidade) {
                    this.mapa[r][c] = 1;
                }
            }
        }
    }
    adicionarDrone(nome, pesoMaximo, posX = this.BASE_X, posY = this.BASE_Y) {
        const drone = new Drone(this.droneIdCounter++, nome, pesoMaximo, posX, posY);
        this.drones.push(drone);
        return drone;
    }
    adicionarEntrega(descricao, peso, destinoX, destinoY) {
        const ajustarDestino = () => {
            let px = destinoX;
            let py = destinoY;
            const largura = this.COLS * this.GRID_SIZE;
            const altura = this.ROWS * this.GRID_SIZE;
            while (true) {
                const gx = Math.floor(px / this.GRID_SIZE);
                const gy = Math.floor(py / this.GRID_SIZE);
                // Se dentro do mapa e não é obstáculo → válido
                if (gy >= 0 && gy < this.ROWS &&
                    gx >= 0 && gx < this.COLS &&
                    this.mapa[gy][gx] === 0) {
                    return { x: px, y: py };
                }
                // Gera nova posição
                px = Math.random() * largura;
                py = Math.random() * altura;
            }
        };
        const destino = ajustarDestino();
        const entrega = new Entrega(this.entregaIdCounter++, descricao, peso, destino.x, destino.y);
        this.entregas.push(entrega);
        return entrega;
    }
    iniciarSimulacao() {
        if (this.simulacaoAtiva)
            return;
        this.simulacaoAtiva = true;
        this.intervalo = setInterval(() => this.atualizar(), 16);
    }
    encerrarSimulacao() {
        this.simulacaoAtiva = false;
        if (this.intervalo)
            clearInterval(this.intervalo);
    }
    atualizar() {
        // Marca entregas impossíveis como rejeitadas PERMANENTEMENTE
        for (const entrega of this.entregas.filter(e => e.status === 'pendente')) {
            const algumDroneCapaz = this.drones.some(d => d.pesoMaximo >= entrega.peso);
            if (!algumDroneCapaz) {
                entrega.status = 'rejeitada';
                entrega.motivoRejeicao = 'Peso excede capacidade do drone';
            }
        }
        // Atribui entregas aos drones disponíveis
        for (const drone of this.drones.filter(d => d.estado === 'idle')) {
            const entrega = this.entregas.find(e => e.status === 'pendente' &&
                !e.drone &&
                e.peso <= drone.pesoMaximo);
            if (!entrega)
                continue;
            const ok = entrega.atribuirDrone(drone);
            if (ok) {
                drone.carregarEntrega(entrega);
                drone.calcularCaminho(entrega.destinoX, entrega.destinoY, this.GRID_SIZE, this.mapa);
                drone.estado = 'emRota';
            }
        }
        // Atualiza posição dos drones
        for (const drone of this.drones) {
            const entregaConcluida = drone.atualizarPosicao(this.GRID_SIZE, this.BASE_X, this.BASE_Y, this.mapa);
            if (entregaConcluida) {
                entregaConcluida.status = 'concluida';
                if (entregaConcluida.drone)
                    entregaConcluida.drone = undefined;
            }
        }
    }
    get estaAtiva() {
        return this.simulacaoAtiva;
    }
    getEstado() {
        return { drones: this.drones, entregas: this.entregas, mapa: this.mapa, gridSize: this.GRID_SIZE };
    }
}
