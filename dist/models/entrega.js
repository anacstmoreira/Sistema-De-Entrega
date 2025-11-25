export class Entrega {
    constructor(id, descricao, peso, destinoX, destinoY) {
        this.id = id;
        this.descricao = descricao;
        this.peso = peso;
        this.destinoX = destinoX;
        this.destinoY = destinoY;
        this.status = 'pendente';
    }
    atribuirDrone(drone) {
        if (this.peso > drone.pesoMaximo) {
            this.status = 'rejeitada';
            this.motivoRejeicao = 'Peso excede capacidade do drone';
        }
        else {
            this.drone = drone;
            this.status = 'pendente'; // <-- resetar status
            this.motivoRejeicao = undefined; // <-- limpar motivo
            drone.carregarEntrega(this.peso, this.destinoX, this.destinoY);
        }
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
