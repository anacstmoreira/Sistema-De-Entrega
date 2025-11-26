export class Drone {
    constructor(id, nome, pesoMaximo, posX, posY) {
        this.caminho = [];
        this.entregasAtuais = [];
        this.tempoEntregaRestante = 0;
        this.caminhoIda = [];
        this.bateria = 15;
        this.consumoPorPixel = 0.10;
        this.tempoAntesDeCarregar = 2000; // 2s
        this.id = id;
        this.nome = nome;
        this.pesoMaximo = pesoMaximo;
        this.posX = posX;
        this.posY = posY;
        this.estado = 'idle';
    }
    carregarEntrega(entrega) {
        const estavaVazio = this.entregasAtuais.length === 0;
        this.entregasAtuais.push(entrega);
        if (estavaVazio) {
            // só na primeira entrega
            this.destinoX = entrega.destinoX;
            this.destinoY = entrega.destinoY;
            if (this.estado === "idle") {
                this.estado = "carregando";
                this.tempoEntregaRestante = 2000;
            }
        }
    }
    concluirEntrega() {
        const entrega = this.getEntregaAtual();
        if (!entrega)
            return null;
        entrega.status = "concluida";
        this.entregasAtuais.shift();
        const proxima = this.entregasAtuais[0];
        if (proxima) {
            this.destinoX = proxima.destinoX;
            this.destinoY = proxima.destinoY;
        }
        else {
            this.destinoX = undefined;
            this.destinoY = undefined;
        }
        this.estado = "entregando";
        this.tempoEntregaRestante = 2000;
        return entrega;
    }
    calcularCaminho(destinoX, destinoY, gridSize, mapa, retorno = false) {
        const start = { x: Math.floor(this.posX / gridSize), y: Math.floor(this.posY / gridSize) };
        const end = { x: Math.floor(destinoX / gridSize), y: Math.floor(destinoY / gridSize) };
        this.caminho = aStar(start, end, mapa);
        this.caminhoIda = [...this.caminho];
        this.estado = retorno ? 'retornando' : 'emRota';
    }
    atualizarPosicao(gridSize, BASE_X, BASE_Y, mapa) {
        const passo = 0.4;
        const entregaAtual = this.entregasAtuais.length > 0 ? this.entregasAtuais[0] : null;
        if (this.bateria <= 10 && this.estado !== "retornando" && this.estado !== "carregandoBateria") {
            this.calcularCaminho(BASE_X, BASE_Y, gridSize, mapa, true);
            this.estado = "retornando";
            return null;
        }
        if (this.estado === "carregandoBateria") {
            const naBase = Math.abs(this.posX - BASE_X) < 1 && Math.abs(this.posY - BASE_Y) < 1;
            if (!naBase)
                return null;
            if (this.tempoAntesDeCarregar > 0) {
                this.tempoAntesDeCarregar -= 16; // 16ms por frame
                return null;
            }
            this.bateria += 10;
            if (this.bateria >= 100) {
                this.bateria = 100;
                this.estado = "idle";
                this.tempoAntesDeCarregar = 2000;
                this.prontoParaAlocar = true;
            }
            return null;
        }
        if (this.estado === "carregando") {
            this.tempoEntregaRestante -= 16;
            if (this.tempoEntregaRestante <= 0 && entregaAtual && this.destinoX !== undefined && this.destinoY !== undefined) {
                this.calcularCaminho(this.destinoX, this.destinoY, gridSize, mapa);
            }
            return null;
        }
        if (this.estado === "entregando") {
            this.tempoEntregaRestante -= 16;
            if (this.tempoEntregaRestante <= 0) {
                const proxima = this.getEntregaAtual();
                if (proxima) {
                    this.calcularCaminho(proxima.destinoX, proxima.destinoY, gridSize, mapa);
                }
                else {
                    this.calcularCaminho(BASE_X, BASE_Y, gridSize, mapa, true);
                }
            }
            return null;
        }
        if (this.caminho.length > 0 || this.estado === "retornando") {
            let alvoX = BASE_X;
            let alvoY = BASE_Y;
            if (this.caminho.length > 0) {
                const prox = this.caminho[0];
                alvoX = prox.x * gridSize + gridSize / 2;
                alvoY = prox.y * gridSize + gridSize / 2;
            }
            const dx = alvoX - this.posX;
            const dy = alvoY - this.posY;
            const distancia = Math.sqrt(dx * dx + dy * dy);
            if (distancia <= passo) {
                this.posX = alvoX;
                this.posY = alvoY;
                if (this.caminho.length > 0)
                    this.caminho.shift();
            }
            else {
                this.posX += (dx / distancia) * passo;
                this.posY += (dy / distancia) * passo;
            }
            this.bateria -= passo * this.consumoPorPixel;
            if (this.bateria < 0)
                this.bateria = 0;
            if (this.estado === "emRota" && this.caminho.length === 0) {
                const entrega = this.getEntregaAtual();
                if (entrega) {
                    this.posX = entrega.destinoX;
                    this.posY = entrega.destinoY;
                    return this.concluirEntrega();
                }
            }
            if (this.estado === "retornando" && this.caminho.length === 0) {
                // força drone exatamente na base
                this.posX = BASE_X;
                this.posY = BASE_Y;
                // garante que nenhum resíduo do caminho fique
                this.caminho = [];
                this.estado = "carregandoBateria";
                return null;
            }
            return null;
        }
        return null;
    }
    getEntregaAtual() {
        return this.entregasAtuais.length > 0 ? this.entregasAtuais[0] : null;
    }
    get cargaAtual() {
        return this.entregasAtuais.reduce((sum, e) => sum + e.peso, 0);
    }
}
function aStar(start, end, mapa) {
    const width = mapa[0].length;
    const height = mapa.length;
    const openList = [];
    const closedList = Array.from({ length: height }, () => Array(width).fill(false));
    function heuristic(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }
    openList.push({ x: start.x, y: start.y, g: 0, h: heuristic(start, end), f: 0 });
    while (openList.length > 0) {
        openList.sort((a, b) => a.f - b.f);
        const current = openList.shift();
        closedList[current.y][current.x] = true;
        if (current.x === end.x && current.y === end.y) {
            const path = [];
            let cur = current;
            while (cur) {
                path.unshift({ x: cur.x, y: cur.y });
                cur = cur.parent;
            }
            return path;
        }
        const neighbors = [
            { x: current.x + 1, y: current.y },
            { x: current.x - 1, y: current.y },
            { x: current.x, y: current.y + 1 },
            { x: current.x, y: current.y - 1 }
        ];
        for (const n of neighbors) {
            if (n.x < 0 || n.y < 0 || n.x >= width || n.y >= height)
                continue;
            if (closedList[n.y][n.x] || mapa[n.y][n.x] === 1)
                continue;
            const g = current.g + 1;
            const h = Math.abs(n.x - end.x) + Math.abs(n.y - end.y);
            const f = g + h;
            const existing = openList.find(node => node.x === n.x && node.y === n.y);
            if (!existing || g < existing.g)
                openList.push({ x: n.x, y: n.y, g, h, f, parent: current });
        }
    }
    return [];
}
