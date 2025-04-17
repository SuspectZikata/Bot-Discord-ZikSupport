# 🤖 Bots-Discord

![GitHub Repo stars](https://img.shields.io/github/stars/SuspectZikata/Bots-Discord?style=social)
![GitHub forks](https://img.shields.io/github/forks/SuspectZikata/Bots-Discord?style=social)
![License](https://img.shields.io/badge/licença-MIT-blue.svg)

> Bot multifuncional para servidores Discord, com comandos de moderação, economia, formulários, sorteios, diversão e muito mais!

---

## ✨ Destaques
- 🎛️ Totalmente configurável via comandos
- 🛡️ Moderação avançada
- 🎁 Sistema de sorteios
- 💰 Economia com ranking e inventário
- 📋 Formulários personalizados
- 🎨 Perfis com planos de fundo e cargos
- 🐱 Comandos de diversão e utilidades

---

## 🧠 Índice
- [📜 Comandos](#-comandos)
- [🧩 Dependências](#-dependências-packagejson)
- [📌 Observações](#-observações)
- [📝 Licença](#-licença)

---

## 📜 Comandos

<details>
<summary><strong>👑 Apenas Dono</strong></summary>

| Comando | Descrição |
|--------|-----------|
| `add-itens` | Adiciona itens à base de dados (cargos e planos de fundo) |
| `configbot` | Configura as opções gerais do bot |
| `dar item` | Dá um item diretamente a um usuário |
| `gerenciar-loja` | Gerencia os planos de fundo da loja |
| `ordemcargos` | Define a ordem dos cargos no perfil |
| `rem-itens` | Remove itens da base de dados |
| `remover-item` | Remove item do inventário de um usuário |
| `resetcontador` | Reseta a contagem numérica |
| `setstatus` | Define o status do bot |

</details>

<details>
<summary><strong>🛡️ Apenas Admin/Mod</strong></summary>

| Comando | Descrição |
|--------|-----------|
| `anunciar` | Envia um anúncio no canal |
| `ban` | Bane um usuário |
| `boasvindas-config` | Configura mensagens de boas-vindas |
| `contador` | Ativa o sistema de contagem |
| `embed` | (Em desenvolvimento) |
| `itens` | Lista todos os itens disponíveis |
| `say` | O bot fala por você |
| `sugerir` | Envia uma sugestão |
| `transcript` | Gera um histórico do canal |
| `unban` | Desbane um usuário |
| `verificação` | Sistema de verificação de membros |

</details>

<details>
<summary><strong>🌐 Comandos Discord</strong></summary>

- `emoji-info` — Mostra informações detalhadas sobre um emoji

</details>

<details>
<summary><strong>🎉 Diversão</strong></summary>

- `cat` — Imagem aleatória de gato 🐱  
- `dog` — Imagem aleatória de cachorro 🐶  
- `hug` — Abraça um usuário  
- `kiss` — Beija um usuário  
- `slap` — Dá um tapa em um usuário  

</details>

<details>
<summary><strong>💰 Economia</strong></summary>

- `daily` — Recebe estrelas diárias  
- `loja` — Visualiza planos de fundo disponíveis  
- `ranking` — Ranking dos usuários com mais estrelas  
- `saldo` — Mostra seu saldo atual  
- `transferir` — Transfere estrelas para outro usuário (sem taxas)  

</details>

<details>
<summary><strong>📋 Formulários</strong></summary>

- `formconfig` — Cria ou edita formulários  
- `formpanel` — Cria um painel de formulário  
- `formquestions` — Gerencia perguntas do formulário  

</details>

<details>
<summary><strong>🔨 Moderação</strong></summary>

- `clear` — Limpa mensagens do canal  
- `dm` — Envia DM para um usuário  
- `dmclear` — Apaga DMs do bot para um usuário  
- `kick` — Expulsa um usuário  
- `lock` — Tranca o canal  
- `setnick` — Altera apelido de um membro  
- `slowmode` — Ativa o modo lento  
- `unlock` — Destranca o canal  

</details>

<details>
<summary><strong>🧍 Perfil</strong></summary>

- `inventario` — Mostra seus itens comprados  
- `perfil` — Exibe seu perfil com cargos e fundo  

</details>

<details>
<summary><strong>🎁 Sorteios</strong></summary>

- `sorteio-adiantar` — ⏩ Finaliza sorteio antecipadamente  
- `sorteio-cancelar` — ❌ Cancela sorteio permanentemente  
- `sorteio-criar` — 📝 Cria um novo sorteio  
- `sorteio-enviar` — 📤 Publica sorteio criado  
- `sorteio-listar` — 📋 Lista sorteios pendentes  

</details>

<details>
<summary><strong>🧰 Utilitários</strong></summary>

- `botinfo` — Informações sobre o bot  
- `help` — Painel de ajuda  
- `ping` — Latência do bot  
- `serverinfo` — Info do servidor  
- `userinfo` — Info de um usuário  

</details>

---

## 🧩 Dependências (`package.json`)

```json
{
  "name": "bot-discord-zik",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js"
  },
  "dependencies": {
    "@discordjs/voice": "^0.18.0",
    "@napi-rs/canvas": "^0.1.69",
    "axios": "^1.8.4",
    "better-sqlite3": "^11.8.1",
    "canvas": "^3.1.0",
    "discord-html-transcripts": "^3.2.0",
    "discord.js": "^14.18.0",
    "fs": "^0.0.1-security",
    "mongodb": "^6.15.0",
    "mongoose": "^8.13.2",
    "ms": "^2.1.3",
    "sharp": "^0.34.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.9"
  }
}
```

---

## 📌 Observações

- 🔐 Comandos de administração e proprietário são restritos por permissões.
- 🎨 Os perfis são customizáveis com planos de fundo e cargos.
- 🧩 O sistema de formulários é dinâmico e personalizável.
- 💸 Estrelas são a moeda principal e podem ser usadas na loja e sorteios.

---

## 📝 Licença

Este projeto está sob licença **MIT**. Sinta-se livre para usar, modificar e contribuir!

---

> Desenvolvido com ❤️ por **SuspectZikata**  
> Mantenha seu servidor organizado, seguro e divertido com este bot! 🚀
