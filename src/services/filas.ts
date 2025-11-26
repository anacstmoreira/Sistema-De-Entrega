import { Drone } from '../models/drone.js';
import { Entrega } from '../models/entrega.js';

export const filaEntregas: Entrega[] = [];

export function adicionarFila(entrega: Entrega) {
    filaEntregas.push(entrega);
    filaEntregas.sort((a, b) =>
        a.prioridade !== b.prioridade ? a.prioridade - b.prioridade : a.tempoChegada - b.tempoChegada
    );
}

export function alocarEntrega(drone: Drone) {
    const cargaAtual = drone.entregasAtuais?.reduce((sum, e) => sum + e.peso, 0) || 0;
    let capacidadeRestante = drone.pesoMaximo - cargaAtual;

    for (const e of filaEntregas) {
        if (e.peso <= capacidadeRestante && e.status === 'pendente') {

            drone.carregarEntrega(e);  
            e.drone = drone;
            e.status = 'pendente';

            const index = filaEntregas.indexOf(e);
            if (index >= 0) filaEntregas.splice(index, 1);

            capacidadeRestante -= e.peso;
        }

        if (capacidadeRestante <= 0) break;
    }
}


