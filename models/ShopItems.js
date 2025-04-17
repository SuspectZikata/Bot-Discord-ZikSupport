const mongoose = require('mongoose');

// Modelo para Cargos
const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String, required: true }, // URL do ícone
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  availableInShop: { type: Boolean, default: false }
});

// Modelo para Planos de Fundo
const backgroundSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  imageUrl: { type: String, required: true }, // URL da imagem
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  availableInShop: { type: Boolean, default: false }
});

// Modelo para vincular itens aos usuários
const userInventorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  ownedRoles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  ownedBackgrounds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Background' }],
  equippedBackground: { type: mongoose.Schema.Types.ObjectId, ref: 'Background' }
});

module.exports = {
  Role: mongoose.model('Role', roleSchema),
  Background: mongoose.model('Background', backgroundSchema),
  UserInventory: mongoose.model('UserInventory', userInventorySchema)
};