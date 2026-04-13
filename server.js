import 'dotenv/config';
import express from 'express';
import path from 'path';
import morgan from 'morgan';
import session from 'express-session';
import { fileURLToPath } from 'url';
import routes from './src/routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const ambiente = process.env.NODE_ENV || 'dev';

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(morgan(ambiente));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src', 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'segredo_everest',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 hora
}));

// Routes
app.use('/', routes);

// 404
app.use((req, res) => {
    res.status(404).render('pages/erro', { msg: 'Página não encontrada.' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render('pages/erro', { msg: 'Erro interno.'});
});

// iniciar servidor
(async () => {
    try {
        app.listen(port, () => {
            console.log(`Servidor rodando em http://localhost:${port}`);
            console.log(`Ambiente: ${process.env.NODE_ENV || 'dev'}`);
        });
    } catch (err) {
        console.error('Erro ao inicializar servidor:', err.message);
        process.exit(1);
    }
})();