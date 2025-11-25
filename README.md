# Sistema de Simulação de Drones para Entregas

Simulação de drones realizando entregas em um mapa 2D, com obstáculos, fila de entregas e indicador de bateria.

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
#   - Abrindo index.html no navegador
#   - Ou usando Live Server no VS Code
#     (clicar com o botão direito em index.html > "Open with Live Server")

# 5. Interagir com a simulação no navegador:
#   - Adicionar Drone: clica em "Adicionar Drone" e preenche nome/peso
#   - Adicionar Entrega: clica em "Adicionar Entrega" e preenche descrição/peso
#   - Iniciar Simulação: clica em "Iniciar Simulação" → drones começam a se mover
#   - Encerrar Simulação: clica em "Encerrar Simulação" → pausa a simulação

# 6. Estrutura do projeto:
#SISTEMA DE ENTREGAS
#├─ dist
#│  ├─ models
#│  │  ├─ drone.js
#│  │  └─ entrega.js
#│  ├─ services
#│  │  ├─ simulacao.js
#│  │  └─ main.js
#├─ src
#│  ├─ models
#│  │  ├─ drone.ts
#│  │  └─ entrega.ts
#│  ├─ services
#│  │  └─ simulacao.ts
#│  └─ main.ts
#├─ index.html
#├─ package.json
#└─ tsconfig.json

# 7. Observações:
#   - Drones só pegam entregas compatíveis com seu peso máximo
#   - Entregas são geradas em posições válidas do mapa (sem obstáculos)
#   - Cada drone possui indicador de bateria
#   - Entregas impossíveis de serem realizadas são automaticamente rejeitadas
