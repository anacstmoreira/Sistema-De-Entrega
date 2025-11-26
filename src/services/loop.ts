import { Drone } from "../models/drone";
import { sim, BASE_X, BASE_Y, desenharMapa } from "../render/mapa.js";
import { atualizarPainel } from "../ui/painel.js";
import { alocarEntrega } from "./filas.js";

let rodando = false;

export function loop() {
    if (rodando) return;
    rodando = true;

    function frame() {
        const estado = sim.getEstado();

        if (sim.estaAtiva) {
            estado.drones.forEach(drone => {

                // Se o drone está sem entrega, tentar alocar uma
                if (drone.entregasAtuais.length === 0) {
                    alocarEntrega(drone);

                    const entregaAtual = drone.entregasAtuais[0];
                    if (entregaAtual) {
                        drone.destinoX = entregaAtual.destinoX;
                        drone.destinoY = entregaAtual.destinoY;

                        drone.calcularCaminho(
                            entregaAtual.destinoX,
                            entregaAtual.destinoY,
                            sim.GRID_SIZE,
                            estado.mapa
                        );
                    }
                }

                // Atualiza movimento
                drone.atualizarPosicao(
                    sim.GRID_SIZE,
                    BASE_X,
                    BASE_Y,
                    estado.mapa
                );

                // Chegou ao destino e pode alocar nova entrega
                if ((drone as any).prontoParaAlocar) {
                    (drone as any).prontoParaAlocar = false;

                    alocarEntrega(drone);

                    const entregaAtual = drone.entregasAtuais[0];
                    if (entregaAtual) {
                        drone.destinoX = entregaAtual.destinoX;
                        drone.destinoY = entregaAtual.destinoY;

                        drone.calcularCaminho(
                            entregaAtual.destinoX,
                            entregaAtual.destinoY,
                            sim.GRID_SIZE,
                            estado.mapa
                        );
                    }
                }
            });
        }

        atualizarPainel();
        desenharMapa();

        if (rodando) {
            requestAnimationFrame(frame);
        }
    }

    requestAnimationFrame(frame);
}

export function pararLoop() {
    rodando = false;
}
