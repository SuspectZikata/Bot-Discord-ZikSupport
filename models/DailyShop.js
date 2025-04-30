const mongoose = require('mongoose');

const dailyShopSchema = new mongoose.Schema({
  date: { 
    type: String, 
    required: true,
    unique: true,
    default: () => new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) 
  },
  items: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Background',
    required: true 
  }],
  lastUpdated: { 
    type: Date, 
    default: () => new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }) 
  }
});

module.exports = mongoose.model('DailyShop', dailyShopSchema);