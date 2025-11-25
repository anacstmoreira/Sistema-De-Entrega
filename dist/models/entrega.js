export class Entrega {
    constructor(id, descricao, peso, destinoX, destinoY, prioridade = 2) {
        this.id = id;
        this.descricao = descricao;
        this.peso = peso;
        this.destinoX = destinoX;
        this.destinoY = destinoY;
        this.status = 'pendente';
        this.prioridade = prioridade;
        this.tempoChegada = Date.now();
    }
    atribuirDrone(drone) {
        if (this.drone)
            return false;
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
        if (this.drone)
            this.drone.concluirEntrega();
    }
    rejeitar(motivo) {
        this.status = 'rejeitada';
        this.motivoRejeicao = motivo;
        if (this.drone)
            this.drone.estado = 'retornando';
    }
}
