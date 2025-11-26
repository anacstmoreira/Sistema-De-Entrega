import './ui/modais.js';
import { atualizarPainel } from './ui/painel.js';
import { desenharMapa, sim } from './render/mapa.js';


sim.iniciarDronesEntregas();
desenharMapa();
atualizarPainel();



