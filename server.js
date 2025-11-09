require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const Post = require('./models/Post');

const app = express();
const PORT = process.env.PORT;

const MONGO_URI = `mongodb+srv://lucilua81_db_user:${encodeURIComponent(process.env.PASSWORD)}@clusterblog.przjngv.mongodb.net/thelucilens?retryWrites=true&w=majority&appName=clusterblog`;

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB conectado!'))
    .catch(err => console.error(err));

var origins = [
    "https://frontend-blogadmin.vercel.app",
    "https://blog.lucilua.com.br"
]

if (process.env.NODE_ENV != 'production') {
    origins.push('http://localhost:3000')
    console.log('dev mode')
} else {
    console.log('prod mode')
}


// Middleware de autenticação
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']; // lê o header Authorization

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    if (token !== `Bearer ${process.env.API_TOKEN}`) {
        return res.status(403).json({ error: 'Token inválido' });
    }

    console.log('ok')
    next(); // continua se o token estiver correto
}

function queryVerify(req, res, next) {
    const passCorreta = process.env.PASS;

    // pega ?pass=...
    const passRecebida = req.query.pass;

    if (passRecebida === passCorreta) {
        next(); // autorizado -> continua
    } else {
        console.log('ERRO');
        return res.status(403).json({ error: "Acesso não autorizado" });
    }
}


const corsOptions = {
    origin: origins,
    methods: ["GET", "POST", "PUT", "DELETE"], // se quiser limitar métodos
    allowedHeaders: ["Content-Type", "Authorization"] // headers que aceita
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(authenticateToken)
app.use(queryVerify)

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


// GET /api/posts/:id (buscar por ID)
app.get('/api/posts/id/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post não encontrado' });
        }
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// PUT /api/posts/:id (atualizar post)
app.put('/api/posts/:id', async (req, res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() }, // força updatedAt
            { new: true, runValidators: true }
        );

        if (!updatedPost) {
            return res.status(404).json({ error: 'Post não encontrado' });
        }

        res.json(updatedPost);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
