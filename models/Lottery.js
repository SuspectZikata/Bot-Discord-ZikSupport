// models/Lottery.js
const mongoose = require('mongoose');

const lotteryEntrySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  tickets: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const lotteryConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: true },
  ticketPrice: { type: Number, default: 500, min: 100 },
  drawTime: { type: String, default: '21:00', match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  channelId: { type: String },
  jackpot: { type: Number, default: 0 },
  currentEntries: [lotteryEntrySchema],
  lastWinner: {
    userId: { type: String },
    prize: { type: Number },
    date: { type: Date }
  },
  lastDrawAttempt: { type: Date },
  lastManualDraw: {
    by: { type: String },
    at: { type: Date }
  }
});

module.exports = mongoose.model('Lottery', lotteryConfigSchema);