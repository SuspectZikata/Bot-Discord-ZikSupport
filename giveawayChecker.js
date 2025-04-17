module.exports = async (client) => {
  try {
    const giveawaysToEnd = await Giveaway.find({
      $or: [
        { status: 'active', endTime: { $lte: new Date() } },
        { status: 'canceled' } // Limpa quaisquer sorteios marcados como cancelados
      ]
    });

    for (const giveaway of giveawaysToEnd) {
      if (giveaway.status === 'active') {
        await endGiveaway(client, giveaway);
      } else {
        // Remove diretamente sorteios cancelados
        await Giveaway.findByIdAndDelete(giveaway._id);
      }
    }
  } catch (error) {
    console.error('Erro ao verificar sorteios:', error);
  }
};