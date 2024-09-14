# RapidaoFood

**RapidaoFood** é um projeto focado em simular um sistema de pedidos de uma plataforma de delivery, utilizando diversas tecnologias para implementar mensageria, WebSocket, testes e balanceamento de carga.

## Tecnologias Utilizadas

- **NestJS**: Framework Node.js utilizado para a construção da API e gestão dos serviços.
- **Node.js**: Plataforma utilizada para executar o JavaScript no lado do servidor.
- **Kafka**: Utilizado como sistema de mensageria, permitindo a comunicação entre diferentes serviços de maneira assíncrona.
- **WebSocket**: Utilizado para simular a conexão em tempo real entre o cliente e a loja, garantindo comunicação bidirecional para atualizações rápidas de status de pedidos.
- **Jest**: Framework de testes utilizado para realizar testes unitários, garantindo a qualidade e confiabilidade do código.
- **Artillery**: Ferramenta utilizada para testes de carga, permitindo a simulação de múltiplas conexões simultâneas e análise de desempenho do sistema.
- **NGINX**: Utilizado como load balancer para distribuir as conexões entre os servidores, garantindo que o usuário seja redirecionado para o servidor com menos conexões ativas, melhorando o desempenho e a experiência do usuário.

## Estrutura do Projeto

- **Mensageria (Kafka)**: O Kafka é utilizado para garantir a comunicação entre serviços, como a criação de pedidos e notificações sobre o status dos mesmos.
  
- **Conexão Cliente-Loja (WebSocket)**: Ao realizar um pedido, um WebSocket é aberto, permitindo que a loja e o cliente troquem informações em tempo real, como o status de aceitação do pedido e atualizações de entrega.

- **Testes Unitários (Jest)**: Todos os componentes críticos do sistema são testados com Jest para garantir que o comportamento esperado esteja sendo seguido.

- **Testes de Carga (Artillery)**: A ferramenta Artillery é utilizada para simular um alto volume de tráfego e garantir que o sistema possa lidar com múltiplas conexões simultâneas sem degradação significativa de performance.

- **Balanceamento de Carga (NGINX)**: O NGINX é configurado como um balanceador de carga, direcionando os usuários para o servidor com menos conexões abertas, garantindo melhor distribuição dos recursos e otimizando a experiência do usuário.

## Como Rodar o Projeto

1. Clone o repositório:
   
2. docker-compose up
