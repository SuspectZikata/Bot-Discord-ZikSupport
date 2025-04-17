const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  stars: { type: Number, default: 0, min: 0 },
  lastDaily: { type: Date }
});

// Método para comprar itens
userSchema.methods.purchaseItem = async function(item, itemType) {
  if (this.stars < item.price) {
    throw new Error('Saldo insuficiente');
  }

  this.stars -= item.price;
  
  if (itemType === 'role') {
    this.ownedRoles.push(item._id);
  } else {
    this.ownedBackgrounds.push(item._id);
  }

  await this.save();
  return this;
};

module.exports = mongoose.model('User', userSchema);