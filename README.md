# Weather MCP Server

Um servidor MCP (Model Context Protocol) que fornece ferramentas para obter informações meteorológicas dos Estados Unidos usando a API do National Weather Service (NWS).

## O que este projeto faz

Este é um servidor MCP que permite acesso a dados meteorológicos dos EUA através de duas ferramentas principais:

### Ferramentas Disponíveis

1. **`get_alerts`** - Obtém alertas meteorológicos ativos para um estado
   - Parâmetro: `state` (código de 2 letras do estado, ex: "CA", "NY")
   - Retorna alertas como tempestades, enchentes, etc.

2. **`get_forecast`** - Obtém previsão do tempo para coordenadas específicas
   - Parâmetros: `latitude` (-90 a 90), `longitude` (-180 a 180)
   - Retorna previsão detalhada com temperatura, vento e condições

## Como funciona o fluxo MCP/Cline/LLM

```
───────────────────────────────┐
                               │
1. Você: "Qual clima San Francisco?"
                               │ 
                               ↓
───────────────────────────────┘
           Cline Core
                              ┌─────────────────────────────────────┐
                              │                                     │
2. Cline adiciona contexto:   │"Ferramentas disponíveis:            │
                              │ - weather.get_forecast(lat, long)   │
                              │ - weather.get_alerts(state)         │
                              │ - google_drive.read_file(path)      │
                              │ - slack.send_message(...)           │
                              │ [...]"                              │
                              │                                     │
                              │ → passa para Claude (LLM)           │
                              └─────────────────────────────────────┘
                                      │
                                      ↓
───────────────────────────────┐
                               │
3. Claude (LLM) analisa:       │"Esta é pergunta meteorológica
                               │ Vou usar weather.get_forecast
                               │ Precisa converter 'San Francisco' <== a LLM faz essa conversão
                               │ para coordenadas (37.7749°N, 122.4194°W)"
                               │
                               ↓ Chama função MCP
───────────────────────────────┘
        MCP Execution Flow
                              ┌─────────────────────────────────────┐
                              │ 4. Cline executa servidor MCP:      │
                              │    `./build/index.js` (weather)     │
                              └─────────────────────────────────────┘
                                      │
                                      ↓
                              ┌─────────────────────────────────────┐
                              │ 5. Cline chama função MCP:          │
                              │    weather.get_forecast(            │
                              │        latitude: 37.7749,           │
                              │        longitude: -122.4194         │
                              │    )                                │
                              └─────────────────────────────────────┘
                                      │
                                      ↓
                            Weather MCP Server
                              ┌──────────────────────────────────────┐
                              │ 6. MCP server:                       │
                              │  - Faz requisição para Points API    │
                              │  - Obtém dados de pontos geográficos │
                              │  - Faz requisição para Forecast API  │
                              │  - Processa dados JSON               │
                              │  - Formata resposta textual          │
                              └──────────────────────────────────────┘
                                      │
                                      ↓
───────────────────────────────┐
                               │
7. MCP retorna dados:          │"Forecast for 37.77, -122.41:
                               │
                               │Today: 72°F, Partly Cloudy     │
                               │Tonight: 58°F, Clear           │
                               │Tomorrow: 75°F, Sunny          │
                               │[...]"                         │
                               │
                               ↓ Formata resposta final
───────────────────────────────┘
         Final Response
                              ┌─────────────────────────────────────┐
                              │ 8. Cline → LLM:                     │
                              │    "Recebi resposta técnica. Preciso│
                              │     apresenta-la? Avalie clareza,   │
                              │     idioma, unidades apropriadas?"  │
                              └─────────────────────────────────────┘
                                      │
                                      ↓
                              ┌─────────────────────────────────────┐
                              │ 9. LLM processa se necessário:      │
                              │    "Converte °F→°C, inglês→português│
                              │     formata de forma natural"       │
                              └─────────────────────────────────────┘
                                      │
                                      ↓ Apresenta resultado
───────────────────────────────┐
                               │
         Final Response        │
                              ┌─────────────────────────────────────┐
                              │ 10. Cline apresenta para você:      │
                              │                                     │
                              │ **Previsão para San Francisco:**    │
                              │                                     │
                              │ **Hoje:** 22°C, Parcial. Nublado    │
                              │ **Esta noite:** 14°C, Limpo         │
                              │ **Amanhã:** 24°C, Ensolarado        │
                              │ [...]                               │
                              └─────────────────────────────────────┘
```

### Pontos-chave do processo:

- **Decisão:** LLM usa inteligência para correlacionar palavras-chave ("clima", "previsão", "tempo") com ferramentas MCP disponíveis
- **Execução:** Cline orquestra a execução do processo MCP em background
- **Comunicação:** Tudo via protocolo MCP - Cline chama, servidor responde
- **Apresentação:** LLM formata respostas técnicas em texto legível

## Tecnologias utilizadas

- **TypeScript** - Linguagem de desenvolvimento
- **Node.js** - Runtime JavaScript
- **@modelcontextprotocol/sdk** - Framework MCP
- **zod** - Validação de entrada
- **National Weather Service API** - Fonte de dados meteorológicos

## Instalação e uso

### Pré-requisitos

- Node.js 18+
- npm

### 1. Clonar e instalar dependências

```bash
git clone <repository-url>
cd weather-mcp
npm install
```

### 2. Build do projeto

```bash
npm run build
```

Este comando:
- Compila o TypeScript para JavaScript
- Torna o arquivo `build/index.js` executável
- Gera o binário final do servidor MCP

### 3. Executar manualmente (opcional)

```bash
./build/index.js
```

### 4. Configuração no Cline (VS Code)

Para usar este servidor MCP no Cline, adicione a seguinte configuração no seu `cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["/caminho/para/weather/build/index.js"]
    }
  }
}
```

⭐ **`Ajuste o caminho`** para o local real onde o projeto foi clonado.

### 5. Usar no Cline

Após configurar, você pode usar frases como:
- "Qual o clima hoje?"
- "Há alertas para Califórnia?"
- "Previsão para Nova York"
- "Qual a temperatura em Chicago?"

O Cline automaticamente detectará que precisa usar este servidor MCP.

## APIs utilizados

- **National Weather Service API** (`https://api.weather.gov`)
  - `/alerts` - Para alertas por estado
  - `/points/{lat},{lon}` - Para obter URL de forecast
  - `/gridpoints/...forecast` - Para dados detalhados da previsão

## Limitações

- **Apenas EUA:** Funciona apenas com localizações dos Estados Unidos
- **Formato imperial:** Temperaturas em °F, vento em mph
- **Requisitos da API:** Respeita rate limits e requer User-Agent válido

## Arquitetura do código

### `src/index.ts`
- Servidor MCP principal
- Registra as duas ferramentas (`get_alerts`, `get_forecast`)
- Validação com Zod
- Comunicação via stdio

### `src/helper.ts`
- Funções utilitárias
- Cliente HTTP para NWS API
- Formatação de dados
- Interfaces TypeScript para APIs

### Build
- TypeScript → JavaScript
- Executável CLR no `build/`
- Binário CLI via `package.json`
