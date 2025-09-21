require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const Post = require('./models/Post');

const app = express();
const PORT = 3000;

const MONGO_URI = `mongodb+srv://lucilua81_db_user:${encodeURIComponent(process.env.PASSWORD)}@clusterblog.przjngv.mongodb.net/thelucilens?retryWrites=true&w=majority&appName=clusterblog`;

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB conectado!'))
    .catch(err => console.error(err));

const corsOptions = {
  origin: [
    "https://frontend-blogadmin.vercel.app",
    "https://blog.lucilua.com.br"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"], // se quiser limitar métodos
  allowedHeaders: ["Content-Type", "Authorization"] // headers que aceita
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.static('public'));

// Rotas API
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/posts/:slug', async (req, res) => {
    try {
        const post = await Post.findOne({ slug: req.params.slug });
        if (!post) return res.status(404).json({ error: 'Post não encontrado' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/posts', async (req, res) => {
    console.log("teste1")
    try {
        const newPost = new Post(req.body);
        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /api/posts/:id
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) {
            return res.status(404).json({ error: 'Post não encontrado' });
        }
        res.json({ message: 'Post deletado com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/config', (req, res) => {
    res.json({ API_URL: process.env.API_URL });
});


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
