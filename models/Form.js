// models/Form.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: { 
    type: String, 
    required: true,
    enum: ['text', 'image', 'multiple_choice', 'single_choice', 'number'] 
  },
  options: [{ type: String }],
  required: { type: Boolean, default: true }
});

const formSchema = new mongoose.Schema({
  formName: { type: String, required: true, unique: true },
  description: { type: String },
  questions: [questionSchema],
  categoryId: { type: String, required: true },
  responseChannelId: { type: String, required: true },
  statusChannelId: { type: String, required: true },
  buttonLabel: { type: String, default: "Abrir Formulário" },
  buttonColor: { 
    type: String, 
    default: "Primary",
    enum: ["Primary", "Secondary", "Success", "Danger"] 
  },
  timeLimit: { type: Number, default: 600 },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Form', formSchema);