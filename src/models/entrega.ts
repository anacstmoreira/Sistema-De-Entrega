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

    constructor(id: number, descricao: string, peso: number, destinoX: number, destinoY: number) {
        this.id = id;
        this.descricao = descricao;
        this.peso = peso;
        this.destinoX = destinoX;
        this.destinoY = destinoY;
        this.status = 'pendente';
    }

    atribuirDrone(drone: Drone) {
    if (this.peso > drone.pesoMaximo) {
        this.status = 'rejeitada';
        this.motivoRejeicao = 'Peso excede capacidade do drone';
    } else {
        this.drone = drone;
        this.status = 'pendente';          // <-- resetar status
        this.motivoRejeicao = undefined;   // <-- limpar motivo
        drone.carregarEntrega(this.peso, this.destinoX, this.destinoY);
    }
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
