# Bots-Discord

## 🤖 Sobre o Bot

Este bot para Discord foi desenvolvido por **SuspectZikata** com o intuito de fornecer uma experiência aprimorada em servidores, incluindo recursos de administração, diversão e utilidade. Com diversas configurações ajustáveis diretamente via comandos, este bot elimina a necessidade de modificar o código para realizar ajustes!

## 🚀 Funcionalidades

### 🌏 Configuração
- **⚙️ configbot** - Configura eventos, canais e outras opções do bot.
- **🎯 contador** - Define a sala onde o contador de mensagens funcionará.
- **🔄 resetcontador** - Reseta o contador.
- **📊 setstatus** - Define o status do bot.

### 🛠️ Administração
- **🔗 antilink** - Remove mensagens contendo links.
- **📢 anunciar** - Envia um anúncio em um canal especificado.
- **🛠️ ban** - Bane um usuário do servidor.
- **🧹 clear** - Limpa mensagens no canal.
- **📨 dm** - Envia uma mensagem privada a um usuário.
- **🗑  dmclear** - Limpa todas as mensagens do bot com um usuário.
- **👢 kick** - Expulsa um usuário do servidor.
- **🔒 lock** - Tranca um canal.
- **🏃️ say** - Faz o bot enviar uma mensagem.
- **✏️ setnick** - Define um apelido para um usuário.
- **🐢 slowmode** - Define o modo lento em um canal.
- **📝 transcript** - Gera um transcript de um canal.
- **🔓 unban** - Remove o ban de um usuário.
- **🔓 unlock** - Destranca um canal.
- **💡 sugerir** - Envia uma sugestão.
- **✅ verificação** - Configura a verificação de membros.

### 🎭 Diversão
- **🤗 hug** - Abraça um usuário.
- **😘 kiss** - Beija um usuário.
- **👋 slap** - Dá um tapa em um usuário.

### 🔧 Utilidade
- **🤖 botinfo** - Mostra informações sobre o bot.
- **❓ help** - Exibe o painel de ajuda.
- **🏟️ ping** - Mostra o ping do bot.
- **📊 serverinfo** - Mostra informações sobre o servidor.
- **👤 userinfo** - Mostra informações sobre um usuário.

## ⚡ Eventos
- **antiLink** - Implementa a funcionalidade do comando `antilink`.
- **autoCallJoin** - Faz o bot entrar automaticamente em uma call ao iniciar (configurável via `configbot`).
- **autoRole** - Atribui um cargo automaticamente a novos membros (configurável via `configbot`).
- **blockmessage** - Restringe o envio de mensagens em canais específicos, permitindo apenas imagens e vídeos (configurável via `configbot`).
- **botMention** - Responde a menções ao bot.
- **botOnline** - Mantém o status do bot mesmo após reiniciar.
- **messageCreate** - Base do contador de mensagens (configurável via `configbot`).
- **verificação** - Valida usuários ao usarem o comando de verificação.

## 📺 Dependências
```json
{
  "dependencies": {
    "@discordjs/voice": "^0.18.0",
    "better-sqlite3": "^11.8.1",
    "discord-html-transcripts": "^3.2.0",
    "discord.js": "^14.18.0",
    "fs": "^0.0.1-security",
    "ms": "^2.1.3",
    "node-fetch": "^3.3.2"
  }
}
```

## 🌜 Licença
Este projeto foi desenvolvido por **SuspectZikata** e está sob uma licença aberta para uso e modificação conforme necessário.

## 🌟 Contribuição
Se desejar contribuir, fique à vontade para abrir uma *issue* ou enviar um *pull request*!

---
✨ **Mantenha seu servidor organizado, seguro e divertido com este bot!** ✨

