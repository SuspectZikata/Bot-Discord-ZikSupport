const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now }
});

const giveawaySchema = new mongoose.Schema({
  messageId: { type: String, unique: true },
  channelId: { type: String, required: true },
  guildId: { type: String, required: true },
  title: { type: String, required: true },
  prize: { type: String, required: true },
  imageUrl: { type: String },
  endTime: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  requiredRoles: [{ type: String }],
  participants: [participantSchema],
  winnerCount: { type: Number, default: 1, min: 1, max: 20 },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'ended', 'canceled'],
    default: 'pending'
  },
  winners: [{ 
    userId: String,
    username: String 
  }],
  hostId: { type: String, required: true },
  hostUsername: { type: String, required: true }
});

module.exports = mongoose.model('Giveaway', giveawaySchema);