const { Background } = require('../models/ShopItems');
const DailyShop = require('../models/DailyShop');
const mongoose = require('mongoose');

async function updateDailyShop() {
  const now = new Date();
  const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const today = brasiliaTime.toLocaleDateString('pt-BR');

  // Verifica se já atualizou hoje
  const existingShop = await DailyShop.findOne({ date: today });
  if (existingShop) return;

  // Busca itens disponíveis e randomiza
  const availableItems = await Background.find({ availableInShop: true });
  const shuffledItems = [...availableItems].sort(() => 0.5 - Math.random());
  const selectedItems = shuffledItems.slice(0, 5).map(item => item._id);

  // Salva ou atualiza a loja do dia
  await DailyShop.findOneAndUpdate(
    { date: today },
    { 
      items: selectedItems,
      lastUpdated: brasiliaTime 
    },
    { upsert: true }
  );

  console.log(`🔄 Loja diária atualizada em ${brasiliaTime.toLocaleString()}`);
}

// Verifica a cada 1 minuto
setInterval(async () => {
  try {
    await updateDailyShop();
  } catch (err) {
    console.error('Erro ao atualizar loja diária:', err);
  }
}, 60 * 1000); // 1 minuto

// Executa imediatamente ao iniciar
updateDailyShop();