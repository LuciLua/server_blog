const mongoose = require('mongoose');
const slugify = require('slugify');

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  capa: String,
  content: String,
  excerpt: String,
  slug: { type: String, unique: true }, // slug para URL bonita
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

// Middleware para gerar slug automaticamente do título
PostSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Se for updateOne / findByIdAndUpdate, forçamos updatedAt
PostSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Post', PostSchema);
