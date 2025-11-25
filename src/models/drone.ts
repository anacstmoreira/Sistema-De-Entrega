type EstadoDrone = 'idle' | 'carregando' | 'emRota' | 'entregando' | 'retornando';

export class Drone {
    id: number;
    nome: string;
    pesoMaximo: number;
    posX: number;
    posY: number;
    estado: EstadoDrone;
    cargaAtual: number;
    destinoX?: number;
    destinoY?: number;

    constructor(id: number, nome: string, pesoMaximo: number, posX: number, posY: number) {
        this.id = id;
        this.nome = nome;
        this.pesoMaximo = pesoMaximo;
        this.posX = posX;
        this.posY = posY;
        this.estado = 'idle';
        this.cargaAtual = 0;
    }

    carregarEntrega(peso: number, destinoX: number, destinoY: number) {
        if (peso > this.pesoMaximo) throw new Error("Peso excede capacidade do drone");
        this.estado = 'carregando';
        this.cargaAtual = peso;
        this.destinoX = destinoX;
        this.destinoY = destinoY;
    }

    iniciarEntrega() {
        if (this.estado === 'carregando') this.estado = 'emRota';
    }

    concluirEntrega() {
        this.estado = 'retornando';
        this.cargaAtual = 0;
        this.destinoX = 0;
        this.destinoY = 0;
    }

    atualizarPosicao(passo: number = 2) {
        if (this.destinoX === undefined || this.destinoY === undefined) return;

        const dx = this.destinoX - this.posX;
        const dy = this.destinoY - this.posY;

        if (Math.abs(dx) <= passo && Math.abs(dy) <= passo) {
            this.posX = this.destinoX;
            this.posY = this.destinoY;

            if (this.estado === 'emRota') this.estado = 'entregando';
            else if (this.estado === 'retornando') this.estado = 'idle';
        } else {
            this.posX += Math.sign(dx) * passo;
            this.posY += Math.sign(dy) * passo;
        }
    }
}
