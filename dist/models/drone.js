export class Drone {
    constructor(id, nome, pesoMaximo, posX, posY) {
        this.caminho = [];
        this.entregaAtual = null;
        this.tempoEntregaRestante = 0;
        this.caminhoIda = [];
        this.bateria = 100;
        this.consumoPorPixel = 0.01;
        this.id = id;
        this.nome = nome;
        this.pesoMaximo = pesoMaximo;
        this.posX = posX;
        this.posY = posY;
        this.estado = 'idle';
        this.cargaAtual = 0;
    }
    carregarEntrega(entrega) {
        this.entregaAtual = entrega;
        this.cargaAtual = entrega.peso;
        this.destinoX = entrega.destinoX;
        this.destinoY = entrega.destinoY;
        this.estado = 'carregando';
        this.tempoEntregaRestante = 2000; // 2s de espera antes de partir
    }
    concluirEntrega() {
        if (!this.entregaAtual)
            return null;
        const entregaFinalizada = this.entregaAtual;
        entregaFinalizada.status = "concluida";
        // Transição para entregar: pausa de 2s antes de retornar
        this.estado = "entregando";
        this.tempoEntregaRestante = 2000;
        // this.entregaAtual = null; << removido daqui
        return entregaFinalizada;
    }
    calcularCaminho(destinoX, destinoY, gridSize, mapa, retorno = false) {
        const start = { x: Math.floor(this.posX / gridSize), y: Math.floor(this.posY / gridSize) };
        const end = { x: Math.floor(destinoX / gridSize), y: Math.floor(destinoY / gridSize) };
        this.caminho = aStar(start, end, mapa);
        this.caminhoIda = [...this.caminho];
        this.estado = retorno ? 'retornando' : 'emRota';
    }
    atualizarPosicao(gridSize, BASE_X, BASE_Y, mapa) {
        const passo = 0.2;
        const entregaAtual = this.entregaAtual;
        // Retorno automático se sem bateria ou sem entrega
        if ((this.bateria <= 0 || (!this.entregaAtual && this.estado !== "idle")) && this.estado !== "retornando") {
            this.calcularCaminho(BASE_X, BASE_Y, gridSize, mapa, true);
        }
        // Carregando
        if (this.estado === "carregando") {
            this.tempoEntregaRestante -= 16;
            if (this.tempoEntregaRestante <= 0 && entregaAtual && this.destinoX !== undefined && this.destinoY !== undefined) {
                this.calcularCaminho(this.destinoX, this.destinoY, gridSize, mapa);
            }
            return null;
        }
        // Entregando (pausa de 2s)
        if (this.estado === "entregando") {
            this.tempoEntregaRestante -= 16;
            if (this.tempoEntregaRestante <= 0) {
                this.calcularCaminho(BASE_X, BASE_Y, gridSize, mapa, true);
                this.entregaAtual = null;
            }
            return null;
        }
        // Movimentação
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
            // Chegada na entrega
            if (this.estado === "emRota" && entregaAtual && this.caminho.length === 0) {
                this.posX = this.destinoX;
                this.posY = this.destinoY;
                return this.concluirEntrega();
            }
            // Chegada na base
            if (this.estado === "retornando" && this.caminho.length === 0) {
                this.estado = "idle";
                this.bateria = 100;
            }
            return null;
        }
        return null;
    }
}
// A* permanece igual
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
