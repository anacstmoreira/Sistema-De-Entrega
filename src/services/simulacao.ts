import { Drone } from '../models/drone.js';
import { Entrega } from '../models/entrega.js';
import { filaEntregas, alocarEntrega } from '../services/filas.js';

export class Simulacao {
    drones: Drone[] = [];
    entregas: Entrega[] = [];
    private droneIdCounter = 1;
    private simulacaoAtiva = false;
    private intervalo?: number;
    BASE_X: number;
    BASE_Y: number;
    GRID_SIZE = 15;
    ROWS: number;
    COLS: number;
    mapa: number[][];

    constructor(baseX: number, baseY: number, canvasWidth: number, canvasHeight: number) {
        this.BASE_X = baseX;
        this.BASE_Y = baseY;

        this.ROWS = Math.floor(canvasHeight / this.GRID_SIZE);
        this.COLS = Math.floor(canvasWidth / this.GRID_SIZE);
        this.mapa = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));

        // Geração de obstáculos
        const densidade = 0.25;
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                const baseGX = Math.floor(this.BASE_X / this.GRID_SIZE);
                const baseGY = Math.floor(this.BASE_Y / this.GRID_SIZE);
                if (Math.abs(r - baseGY) <= 2 && Math.abs(c - baseGX) <= 3) continue;
                if (Math.random() < densidade) this.mapa[r][c] = 1;
            }
        }
    }

    adicionarDrone(nome: string, pesoMaximo: number, posX: number = this.BASE_X, posY: number = this.BASE_Y) {
        const drone = new Drone(this.droneIdCounter++, nome, pesoMaximo, posX, posY);
        this.drones.push(drone);
        return drone;
    }


    adicionarEntrega(desc: string, peso: number, prioridade: number = 2) {
        const gerarDestinoValido = () => {
            let gx: number, gy: number;
            do {
                gx = Math.floor(Math.random() * this.COLS);
                gy = Math.floor(Math.random() * this.ROWS);
            } while (this.mapa[gy][gx] === 1);
            return { x: gx * this.GRID_SIZE + this.GRID_SIZE/2, y: gy * this.GRID_SIZE + this.GRID_SIZE/2 };
        };

        const destino = gerarDestinoValido();
        const entrega = new Entrega(
            this.entregas.length + 1, desc, peso, destino.x, destino.y, prioridade
        );
        this.entregas.push(entrega);

        filaEntregas.push(entrega);
        filaEntregas.sort((a,b) => a.prioridade !== b.prioridade ? a.prioridade - b.prioridade : a.tempoChegada - b.tempoChegada);

        return entrega;
    }


    iniciarSimulacao() {
        if (this.simulacaoAtiva) return;
        this.simulacaoAtiva = true;
    }

    encerrarSimulacao() {
        this.simulacaoAtiva = false;
    }

    atualizar() {
        // Rejeita entregas que nenhum drone pode carregar
        for (const e of this.entregas.filter(en => en.status === 'pendente')) {
            if (!this.drones.some(d => d.pesoMaximo >= e.peso)) {
                e.rejeitar('Peso excede capacidade do drone');
            }
        }

        for (const drone of this.drones) {
            drone.atualizarPosicao(this.GRID_SIZE, this.BASE_X, this.BASE_Y, this.mapa);

            if (drone.estado === 'idle' || drone.estado === 'carregandoBateria') {
                alocarEntrega(drone);
            }
        }
    }

    iniciarDronesEntregas() {
        if (!this.drones.some(d => d.nome === "Drone01")) this.adicionarDrone("Drone01", 5);
        if (!this.drones.some(d => d.nome === "Drone02")) this.adicionarDrone("Drone02", 5);

        if (!this.entregas.some(e => e.descricao === "Entrega 1")) this.adicionarEntrega("Entrega 1", 1);
        if (!this.entregas.some(e => e.descricao === "Entrega 2")) this.adicionarEntrega("Entrega 2", 1);
        if (!this.entregas.some(e => e.descricao === "Entrega 3")) this.adicionarEntrega("Entrega 3", 1);
    }


    get estaAtiva() {
        return this.simulacaoAtiva;
    }

    getEstado() {
        return { drones: this.drones, entregas: this.entregas, mapa: this.mapa, gridSize: this.GRID_SIZE };
    }
}
