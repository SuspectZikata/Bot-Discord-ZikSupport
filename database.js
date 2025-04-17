const mongoose = require('mongoose');
const URI = '';

// Configurações otimizadas para Atlas
const options = {
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  serverSelectionTimeoutMS: 50000,
  maxPoolSize: 10,
  retryWrites: true,
  retryReads: true
};

module.exports = {
  async connect() {
    try {
      await mongoose.connect(URI, options);
      
      console.log('✅ Conectado ao MongoDB Atlas');
      
      // Eventos de conexão
      mongoose.connection.on('connected', () => {
        console.log('🟢 Mongoose conectado');
      });

      mongoose.connection.on('error', (err) => {
        console.error('🔴 Erro na conexão:', err.message);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('🟡 Mongoose desconectado');
      });

    } catch (error) {
      console.error('❌ Falha na conexão inicial:', error.message);
      
      // Dicas específicas baseadas no erro
      if (error.message.includes('whitelist')) {
        console.log('\n👉 Solução: Adicione seu IP ao whitelist no MongoDB Atlas!');
        console.log('🔗 Acesse: https://cloud.mongodb.com → Security → Network Access\n');
      }
      
      process.exit(1); // Encerra o aplicativo se não conectar
    }
  }
};