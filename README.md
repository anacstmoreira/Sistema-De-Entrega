# Sistema de Simulação de Drones para Entregas

Simulação de drones realizando entregas em um mapa 2D, com obstáculos, fila de entregas e indicador de bateria. O projeto é feito com Typescript, utilizando canva para desenhar o mapa, obstaculos, e drones.

- Drones só pegam entregas compatíveis com seu peso máximo, e sempre que esvaziarem suas entregas, irão voltar para a base para pegar mais

- Entregas são geradas em posições válidas do mapa, e tem prioridade e peso

- Cada drone possui indicador de bateria, caso ele esteja na rota para uma entrega e chegar a 10%, automaticamente retorna pra base e segue para a entrega após recarregar

- Entregas impossíveis de serem realizadas são automaticamente rejeitadas permanentemente

- Se um novo drone é criado com um limite maximo de peso, ele pegará apenas entregas novas

- Inicialmente o projeto seria feito pelo terminal, mas achei interessante ter algo mais gráfico para melhorar a experiência de quem estivesse usando, com botões interativos e uma pagina simples, mas que serve o proposito.

---

## Como Usar

### Passo a passo completo em terminal/bash

```bash
# 1. Clonar o repositório
git clone https://github.com/anacstmoreira/Sistema-De-Entrega.git

# 2. Instalar dependências (Node.js e npm)
npm install

### 3. Compilar TypeScript para JavaScript
tsc

# 4. Executar o projeto
Abrindo index.html no navegador
Ou usando Live Server no VS Code
(clicar com o botão direito em index.html > "Open with Live Server")
     
# 5. Interagir com a simulação no navegador:
Adicionar Drone: clica em "Adicionar Drone" e preenche nome/peso
Adicionar Entrega: clica em "Adicionar Entrega" e preenche descrição/peso/prioridade
Iniciar Simulação: clica em "Iniciar Simulação" → drones começam a se mover
Encerrar Simulação: clica em "Encerrar Simulação" → pausa a simulação
