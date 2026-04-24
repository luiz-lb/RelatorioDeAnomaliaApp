import multer from 'multer';
import fs from 'fs';
const ano = new Date().getFullYear(); // Obter o ano atual
const mes = new Date().getMonth() + 1; // Obter o mês atual (0-11, por isso +1)
const dia = new Date().getDate(); // Obter o dia atual

const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        let nome = Date.now() + '-' + file.originalname;
        cb(null, nome);
    },
    destination: function (req, file, cb) {
        let path = `src/public/uploads/temp/${ano}/${mes}/${dia}`;
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }
        cb(null, path);
    }
});

const filtroDeArquivo = (req, file, cb) => {
    // Array com os 'mimetypes' de imagens permitidos
    const formatosPermitidos = ['image/jpeg', 'image/jpg', 'image/png'];

    // Se o arquivo que está chegando estiver nessa lista, aceita (true)
    if (formatosPermitidos.includes(file.mimetype)) {
        cb(null, true);
    } else {
        // Se não for imagem, rejeita (false) e envia um erro
        cb(new Error('Formato inválido. Por favor, envie apenas imagens (JPG, PNG, JPEG).'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: filtroDeArquivo, 
    

    // Aqui limitamos para 5 MB (5 * 1024 * 1024 bytes). Evita que enviem fotos de 50MB e lote o servidor.
    limits: {
        fileSize: 5 * 1024 * 1024 
    }
});

// Middleware reutilizável que processa o upload de um único arquivo e trata erros do Multer
export function handleUpload(fieldName) {
    return function (req, res, next) {
        upload.single(fieldName)(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ sucesso: false, mensagem: `Erro de upload: ${err.message}` });
            } else if (err) {
                return res.status(400).json({ sucesso: false, mensagem: err.message });
            }
            next();
        });
    };
}

export default upload;