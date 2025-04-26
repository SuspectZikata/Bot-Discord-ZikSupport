// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  stars: { type: Number, default: 0, min: 0 },
  lastDaily: { type: Date },

  // Compra de backgrounds
  ownedBackgrounds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Background' }],

  // Loteria
  lotteryTickets: { type: Number, default: 0 }, // Total de bilhetes acumulados
  lotteryWins: { type: Number, default: 0 },   // Quantidade de vitórias
  lastWin: { type: Date },                      // Data da última vitória
  purchasedTickets: { type: Number, default: 0 }
});

// Método para comprar background
userSchema.methods.purchaseBackground = async function(background) {
  if (this.stars < background.price) {
    throw new Error('Saldo insuficiente');
  }

  this.stars -= background.price;
  this.ownedBackgrounds.push(background._id);
  await this.save();
  return this;
};

// Método para comprar bilhetes de loteria
userSchema.methods.buyLotteryTickets = async function(quantity, ticketPrice) {
  const totalCost = quantity * ticketPrice;

  if (this.stars < totalCost) {
    throw new Error('Saldo insuficiente');
  }

  this.stars -= totalCost;
  this.lotteryTickets += quantity;
  this.purchasedTickets += quantity;
  await this.save();
  return this;
};

// Método para receber o prêmio da loteria
userSchema.methods.addPrize = async function(prizeAmount) {
  this.stars += prizeAmount;
  this.lotteryWins += 1;
  this.lastWin = new Date();
  await this.save();
  return this;
};

module.exports = mongoose.model('User', userSchema);
