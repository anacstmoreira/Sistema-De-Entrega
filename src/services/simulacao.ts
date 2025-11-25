import { Drone } from '../models/drone.js';
import { Entrega } from '../models/entrega.js';

export class Simulacao {
    drones: Drone[] = [];
    entregas: Entrega[] = [];
    private droneIdCounter = 1;
    private entregaIdCounter = 1;
    private simulacaoAtiva = false;
    private intervalo?: number;

    // Base fixa
    private baseX: number;
    private baseY: number;

    constructor(baseX: number, baseY: number) {
        this.baseX = baseX;
        this.baseY = baseY;
    }

    adicionarDrone(nome: string, pesoMaximo: number, posX?: number, posY?: number) {
        // Se não passar posição, nasce na base
        const drone = new Drone(
            this.droneIdCounter++,
            nome,
            pesoMaximo,
            posX ?? this.baseX,
            posY ?? this.baseY
        );
        this.drones.push(drone);
        return drone;
    }

    adicionarEntrega(descricao: string, peso: number, destinoX: number, destinoY: number) {
        const entrega = new Entrega(this.entregaIdCounter++, descricao, peso, destinoX, destinoY);
        this.entregas.push(entrega);
        return entrega;
    }

    iniciarSimulacao() {
        if (this.simulacaoAtiva) return;
        this.simulacaoAtiva = true;
        this.intervalo = setInterval(() => this.atualizar(), 16);
    }

    encerrarSimulacao() {
        this.simulacaoAtiva = false;
        if (this.intervalo) clearInterval(this.intervalo);
    }

    private atualizar() {
    for (const drone of this.drones.filter(d => d.estado === 'idle')) {
        // Entregas pendentes sem drone
        let entrega = this.entregas.find(e => e.status === 'pendente' && !e.drone);

        // Se não achou, tenta pegar uma rejeitada por peso que o drone consiga carregar
        if (!entrega) {
            entrega = this.entregas.find(
                e => e.status === 'rejeitada' &&
                     e.motivoRejeicao === 'Peso excede capacidade do drone' &&
                     e.peso <= drone.pesoMaximo &&
                     !e.drone
            );
        }

        if (entrega) {
            entrega.atribuirDrone(drone);
            drone.iniciarEntrega();
        }
    }

    for (const drone of this.drones) {
        drone.atualizarPosicao();

        // Chegou na entrega
        if (drone.estado === 'entregando') {
            const entrega = this.entregas.find(e => e.drone === drone && e.status === 'pendente');
            if (entrega) {
                entrega.concluir();
                drone.destinoX = this.baseX;
                drone.destinoY = this.baseY;
                drone.estado = 'retornando';
            }
        }

        // Chegou na base
        if (drone.estado === 'retornando' &&
            drone.posX === this.baseX && drone.posY === this.baseY) {
            drone.estado = 'idle';
        }
    }
}



    getEstado() {
        return { drones: this.drones, entregas: this.entregas };
    }
}
