import { Drone } from './drone.js';

export type StatusEntrega = 'pendente' | 'concluida' | 'rejeitada';

export class Entrega {
    id: number;
    descricao: string;
    peso: number;
    destinoX: number;
    destinoY: number;
    status: StatusEntrega;
    motivoRejeicao?: string;
    drone?: Drone;
    prioridade: number;       // 1 = alta, 2 = média, 3 = baixa
    tempoChegada: number;   

    constructor(id: number, descricao: string, peso: number, destinoX: number, destinoY: number, prioridade: number = 2) {
        this.id = id;
        this.descricao = descricao;
        this.peso = peso;
        this.destinoX = destinoX;
        this.destinoY = destinoY;
        this.status = 'pendente';
        this.prioridade = prioridade;
        this.tempoChegada = Date.now();
    }

    atribuirDrone(drone: Drone): boolean {

        if (this.drone) return false;

        // Verifica peso
        if (this.peso > drone.pesoMaximo) {
            this.status = 'rejeitada';
            this.motivoRejeicao = 'Peso excede capacidade do drone';
            return false;
        }

        this.drone = drone;
        this.status = 'pendente';
        this.motivoRejeicao = undefined;

        return true;
    
    }

    concluir() {
        this.status = 'concluida';
        if (this.drone) this.drone.concluirEntrega();
    }

    rejeitar(motivo: string) {
        this.status = 'rejeitada';
        this.motivoRejeicao = motivo;
        if (this.drone) this.drone.estado = 'retornando';
    }
}

