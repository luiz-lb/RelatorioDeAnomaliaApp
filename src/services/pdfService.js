import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatarData(data) {
    if (!data) return 'N/A';
    const d = new Date(data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

function fillRect(doc, x, y, w, h, color) {
    doc.save().rect(x, y, w, h).fill(color).restore();
}

function fillRoundedRect(doc, x, y, w, h, r, color) {
    doc.save().roundedRect(x, y, w, h, r).fill(color).restore();
}

function strokeRoundedRect(doc, x, y, w, h, r, color) {
    doc.save().roundedRect(x, y, w, h, r).strokeColor(color).stroke().restore();
}

function centeredText(doc, text, y, width, color = '#000000', fontSize = 10) {
    doc.fontSize(fontSize).fillColor(color).text(text, 0, y, { width, align: 'center' });
}

async function imagemBuffer(fotoPath) {
    try {
        const absPath = path.join(process.cwd(), 'src', 'public', fotoPath);
        if (!fs.existsSync(absPath)) return null;

        // Redimensiona para no máximo 900px de largura e comprime em JPEG 70%
        const buffer = await sharp(absPath)
            .rotate()
            .resize({ width: 900, withoutEnlargement: true })
            .jpeg({ quality: 70, progressive: true })
            .toBuffer();

        return buffer;
    } catch (_) {
        return null;
    }
}

function logoPath() {
    try {
        const absPath = path.join(process.cwd(), 'src', 'public', 'img', 'logotipoeverest.png');
        if (fs.existsSync(absPath)) return absPath;
    } catch (_) { }
    return null;
}

// ─── Constantes de layout ───────────────────────────────────────────────────

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 36;
const COL_W = PAGE_W - MARGIN * 2;

// Paleta de cores
const COR_PRIMARIA = '#8C2B2B'; // Bordô principal
const COR_ACCENT = '#F24949'; // Vermelho acento
const COR_ACCENT2 = '#BF3939'; // Vermelho médio
const COR_CIANO = '#5ED7F2'; // Ciano destaque
const COR_FUNDO = '#F2F2F2'; // Cinza claro fundo
const COR_LINHA = '#dee2e6';
const COR_TEXTO = '#212529';
const COR_TEXTO_LEVE = '#464646';
const COR_VERDE = '#1a7a2e'; // Verde para "Enviado"
const COR_VERDE_BG = '#d4edda';

// Raio padrão para bordas arredondadas
const RADIUS = 6;

// ─── Folha de Capa ──────────────────────────────────────────────────────────

function desenharCapa(doc, header, idRelatorio) {
    // Fundo superior bordô — ocupa 55% da altura
    const coverTopH = PAGE_H * 0.55;
    fillRect(doc, 0, 0, PAGE_W, coverTopH, COR_PRIMARIA);

    // Faixa de acento ciano no topo
    fillRect(doc, 0, 0, PAGE_W, 6, COR_CIANO);

    // Logo da Everest centralizado no topo da capa
    const logo = logoPath();
    const logoW = 140;
    const logoH = 180;
    const logoX = (PAGE_W - logoW) / 2;
    const logoY = 70;

    if (logo) {
        try {
            doc.image(logo, logoX, logoY, { width: logoW, height: logoH, fit: [logoW, logoH] });
        } catch (_) {
            doc.fontSize(16).fillColor('#ffffff').font('Helvetica-Bold')
                .text('EVEREST ENGENHARIA', 0, logoY + 20, { width: PAGE_W, align: 'center' });
            doc.font('Helvetica');
        }
    } else {
        doc.fontSize(16).fillColor('#ffffff').font('Helvetica-Bold')
            .text('EVEREST ENGENHARIA', 0, logoY + 20, { width: PAGE_W, align: 'center' });
        doc.font('Helvetica');
    }

    // Linha decorativa separadora
    const lineY = logoY + logoH + 10;
    doc.save()
        .moveTo(MARGIN * 2, lineY)
        .lineTo(PAGE_W - MARGIN * 2, lineY)
        .strokeColor(COR_CIANO)
        .lineWidth(1.5)
        .stroke()
        .restore();

    // Título do relatório
    doc.fontSize(24).fillColor('#ffffff').font('Helvetica-Bold')
        .text('RELATÓRIO DE ANOMALIAS', 0, lineY + 18, { width: PAGE_W, align: 'center' });
    doc.font('Helvetica');

    // Número do relatório
    doc.fontSize(11).fillColor(`#ffffff`).font('Helvetica')
        .text(`Nº ${idRelatorio}`, 0, lineY + 50, { width: PAGE_W, align: 'center' });


    // Fundo branco inferior (restante da página)
    fillRect(doc, 0, coverTopH, PAGE_W, PAGE_H - coverTopH, '#ffffff');


    // Card central com info do site
    const cardX = MARGIN + 20;
    const cardY = lineY + 280;
    const cardW = COL_W - 40;
    const cardH = 130;

    fillRoundedRect(doc, cardX, cardY, cardW, cardH, RADIUS, COR_FUNDO);
    strokeRoundedRect(doc, cardX, cardY, cardW, cardH, RADIUS, COR_FUNDO);

    const infoY = (offset) => cardY + 14 + offset;

    doc.fontSize(9).fillColor(COR_TEXTO_LEVE).font('Helvetica-Bold')
        .text('SITE ID', cardX + 16, infoY(0));
    doc.fontSize(15).fillColor(COR_TEXTO_LEVE)
        .text(header.site_id || 'N/A', cardX + 16, infoY(13));

    doc.fontSize(8).fillColor(COR_TEXTO_LEVE).font('Helvetica')
        .text(`${header.municipio || ''} — ${header.UF || ''}`, cardX + 16, infoY(33));
    doc.fontSize(8).fillColor(COR_TEXTO_LEVE)
        .text(header.endereco || '', cardX + 16, infoY(46), { width: cardW - 32 });
    doc.fontSize(8).fillColor(COR_TEXTO_LEVE)
        .text(`Tipo: ${header.tipo_estrutura || 'N/A'}   |   Altura: ${header.altura_torre ? header.altura_torre + 'm' : 'N/A'}`, cardX + 16, infoY(59));

    // Divider
    doc.save().moveTo(cardX + 16, infoY(72))
        .lineTo(cardX + cardW - 16, infoY(72))
        .strokeColor('rgba(255,255,255,0.2)').lineWidth(0.5).stroke().restore();

    doc.fontSize(8).fillColor(COR_TEXTO_LEVE)
        .text(`Criado em: ${header.created_at ? formatarData(header.created_at) : 'N/A'}`, cardX + 16, infoY(80));
    doc.fontSize(8).fillColor(COR_TEXTO_LEVE)
        .text(`Responsável: ${header.nome || 'N/A'}`, cardX + 16, infoY(93));
    doc.font('Helvetica');

    // Badge de status
    const status = (header.status || 'Pendente').toUpperCase();
    const isEnviado = header.status === 'Enviado' || header.status === 'Concluído';
    const isRascunho = header.status === 'Rascunho';
    const badgeBg = isEnviado ? COR_VERDE : isRascunho ? COR_TEXTO_LEVE : COR_ACCENT;
    const badgeW = 80;
    const badgeH = 15;
    const badgeX = cardX + cardW - badgeW - 14;
    const badgeY = infoY(80);

    fillRoundedRect(doc, badgeX, badgeY, badgeW, badgeH, 4, badgeBg);
    doc.fontSize(8).fillColor('#ffffff').font('Helvetica-Bold')
        .text(status, badgeX, badgeY + 4, { width: badgeW, align: 'center' });
    doc.font('Helvetica');

    // Faixa de acento ciano na transição
    fillRect(doc, 0, coverTopH, PAGE_W, 4, COR_CIANO);

    // Info footer da capa
    const footerY = coverTopH + 300;
    doc.fontSize(9).fillColor(COR_TEXTO_LEVE)
        .text('Documento emitido eletronicamente', 0, footerY,
            { width: PAGE_W, align: 'center' });
    doc.fontSize(8).fillColor(COR_TEXTO_LEVE)
        .text(`Data de emissão: ${new Date().toLocaleDateString('pt-BR')}`, 0, footerY + 18,
            { width: PAGE_W, align: 'center' });

    // Rodapé bordô com aviso
    fillRect(doc, 0, PAGE_H - 40, PAGE_W, 40, COR_PRIMARIA);
    fillRect(doc, 0, PAGE_H - 40, PAGE_W, 3, COR_CIANO);
}

// ─── Cabeçalho das páginas internas ─────────────────────────────────────────

function desenharCabecalho(doc, idRelatorio) {
    const y0 = MARGIN;
    const hH = 52;

    fillRoundedRect(doc, MARGIN, y0, COL_W, hH, RADIUS, COR_PRIMARIA);

    // Logo ao lado do título
    const logo = logoPath();
    const logoW = 36;
    const logoH = 28;
    const logoX = MARGIN + 10;
    const logoY = y0 + (hH - logoH) / 2;

    if (logo) {
        try {
            doc.image(logo, logoX, logoY, { width: logoW, height: logoH, fit: [logoW, logoH] });
        } catch (_) { }
    }

    const textX = logo ? logoX + logoW + 8 : MARGIN + 12;

    doc.fontSize(12).fillColor('#ffffff').font('Helvetica-Bold')
        .text('RELATÓRIO DE ANOMALIAS', textX, y0 + 12, { width: COL_W - 150 });
    doc.fontSize(7).fillColor('#ffffff').font('Helvetica')
        .text('Everest Engenharia', textX, y0 + 28);

    doc.fontSize(8).fillColor('#ffffff')
        .text(`Nº ${idRelatorio}`, PAGE_W - MARGIN - 110, y0 + 20, { width: 100, align: 'right' });

    return y0 + hH + 10;
}

// ─── Rodapé ─────────────────────────────────────────────────────────────────

function desenharRodape(doc, pagina, total) {
    const y = PAGE_H - MARGIN - 14;
    doc.save()
        .moveTo(MARGIN, y - 4).lineTo(PAGE_W - MARGIN, y - 4)
        .strokeColor(COR_LINHA).lineWidth(0.5).stroke()
        .restore();
    doc.fontSize(7).fillColor(COR_TEXTO_LEVE)
        .text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, MARGIN, y, { width: COL_W / 2 })
        .text(`Página ${pagina} de ${total}`, PAGE_W / 2, y, { width: COL_W / 2, align: 'right' });
}

// ─── Título de seção ────────────────────────────────────────────────────────

function tituloSecao(doc, titulo, y) {
    fillRoundedRect(doc, MARGIN, y, COL_W, 20, RADIUS, `#f2f2f2`);
    strokeRoundedRect(doc, MARGIN, y, COL_W, 20, RADIUS, COR_PRIMARIA);

    // Barra lateral ciano
    fillRect(doc, MARGIN, y + 4, 3, 12, COR_CIANO);

    doc.fontSize(8).fillColor(COR_PRIMARIA).font('Helvetica-Bold')
        .text(titulo.toUpperCase(), MARGIN + 12, y + 6, { width: COL_W - 20 });
    doc.font('Helvetica');
    return y + 20 + 8;
}

// ─── Linha de informação ─────────────────────────────────────────────────────

// Alinha verticalmente: label e valor centralizados na altura da linha (linhaH)
function linhaInfo(doc, label, valor, x, y, colLargura, linhaH = 16) {
    const textY = y + Math.floor((linhaH - 7) / 2); // centraliza texto de 7pt na linha
    doc.fontSize(7).fillColor(COR_TEXTO_LEVE)
        .font('Helvetica-Bold')
        .text(label, x + 6, textY, { width: colLargura * 0.40 - 8, lineBreak: false });
    doc.font('Helvetica').fillColor(COR_TEXTO)
        .text(valor || 'N/A', x + colLargura * 0.40, textY,
            { width: colLargura * 0.60 - 8, lineBreak: false });
}

function desenharChecklistSelecionado(doc, checklist, y, idRelatorio) {
    if (y > PAGE_H - MARGIN - 140) {
        doc.addPage({ size: 'A4', margin: 0 });
        y = desenharCabecalho(doc, idRelatorio);
    }

    y = tituloSecao(doc, 'Checklist', y);

    if (!Array.isArray(checklist) || checklist.length === 0) {
        const boxHeight = 38;
        fillRoundedRect(doc, MARGIN, y, COL_W, boxHeight, RADIUS, COR_FUNDO);
        strokeRoundedRect(doc, MARGIN, y, COL_W, boxHeight, RADIUS, COR_LINHA);
        doc.fontSize(8).fillColor(COR_TEXTO_LEVE)
            .text('Nenhum item de checklist selecionado.', MARGIN + 12, y + 12, { width: COL_W - 24 });
        return y + boxHeight + 12;
    }

    let itemY = y + 10;
    const itemHeight = 22;
    const markerSize = 16;
    let itemIndex = 1;

    for (const item of checklist) {
        if (itemY + itemHeight > PAGE_H - MARGIN - 30) {
            doc.addPage({ size: 'A4', margin: 0 });
            y = desenharCabecalho(doc, idRelatorio);
            y = tituloSecao(doc, 'Checklist (continuação)', y);
            itemY = y + 10;
        }

        const markerX = MARGIN + 12;
        const markerY = itemY + 2;
        fillRoundedRect(doc, markerX, markerY, markerSize, markerSize, 3, COR_ACCENT);
        doc.fontSize(8).fillColor('#ffffff').font('Helvetica-Bold')
            .text(`${itemIndex}`, markerX, markerY + (markerSize / 2) - 4, { width: markerSize, align: 'center' });
        doc.font('Helvetica');

        doc.fontSize(8).fillColor(COR_TEXTO)
            .text(item.descricao, markerX + markerSize + 8, markerY + (markerSize / 2) - 4, { width: COL_W - markerSize - 36 });

        itemY += itemHeight;
        itemIndex += 1;
    }

    return itemY + 12;
}

// ─── Gerador principal ──────────────────────────────────────────────────────

export async function gerarRelatorioPDF(header, body, idRelatorio, checklistSelecionado = []) {
    // Coleta os chunks do stream em uma Promise separada e aguarda no final
    const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });

    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));

    const streamFinalizado = new Promise((resolve, reject) => {
        doc.on('end', resolve);
        doc.on('error', reject);
    });

    // ── Página 0: Capa ──────────────────────────────────────────────
    desenharCapa(doc, header, idRelatorio);

    // ── Página 1+: Relatório ────────────────────────────────────────
    doc.addPage({ size: 'A4', margin: 0 });
    let y = desenharCabecalho(doc, idRelatorio);

    // Faixa de identificação rápida
    fillRoundedRect(doc, MARGIN, y, COL_W, 34, RADIUS, COR_FUNDO);
    strokeRoundedRect(doc, MARGIN, y, COL_W, 34, RADIUS, COR_LINHA);

    doc.fontSize(10).fillColor(COR_PRIMARIA).font('Helvetica-Bold')
        .text(header.site_id || 'Site ID N/A', MARGIN + 12, y + 7);
    doc.fontSize(8).fillColor(COR_TEXTO_LEVE).font('Helvetica')
        .text(
            `${header.municipio || ''} — ${header.UF || ''}  |  ${header.tipo_estrutura || ''}  |  ${header.altura_torre || '?'}m`,
            MARGIN + 12, y + 21
        );

    // Badge de status
    const status = (header.status || 'Pendente').toUpperCase();
    const isEnviado = header.status === 'Enviado' || header.status === 'Concluído';
    const isRasc = header.status === 'Rascunho';
    const badgeBg = isEnviado ? COR_VERDE : isRasc ? COR_TEXTO_LEVE : COR_ACCENT;
    const badgeW = 76;
    const badgeH = 15;
    const badgeX = PAGE_W - MARGIN - badgeW - 10;
    const badgeY = y + 8;

    fillRoundedRect(doc, badgeX, badgeY, badgeW, badgeH, 4, badgeBg);
    doc.fontSize(8).fillColor('#ffffff').font('Helvetica-Bold')
        .text(status, badgeX, badgeY + 4, { width: badgeW + 0.5, align: 'center' });
    doc.font('Helvetica');
    y += 34 + 14;

    // ── Seção: Identificação ────────────────────────────────────────
    y = tituloSecao(doc, 'Identificação do Site', y);

    const campos = [
        ['Site ID', header.site_id],
        ['Município / UF', `${header.municipio || ''} / ${header.UF || ''}`],
        ['Endereço', header.endereco],
        ['CEP', header.CEP],
        ['Tipo de Estrutura', header.tipo_estrutura],
        ['Altura da Torre', header.altura_torre ? `${header.altura_torre}m` : null],
        ['Tipo do Cadeado', header.tipo_cadeado],
        ['Status', header.status],
        ['Criado em', header.created_at ? formatarData(header.created_at) : null],
        ['Criado por', header.usuario_id],
    ];

    const metade = Math.ceil(campos.length / 2);
    const colW2 = COL_W / 2 - 2;
    const linhaH = 18;
    const tableH = metade * linhaH;

    fillRoundedRect(doc, MARGIN, y, COL_W, tableH, RADIUS, '#ffffff');
    strokeRoundedRect(doc, MARGIN, y, COL_W, tableH, RADIUS, COR_LINHA);

    for (let i = 0; i < metade; i++) {
        if (i % 2 === 0) {
            doc.save()
                .roundedRect(MARGIN, y, COL_W, tableH, RADIUS).clip()
                .rect(MARGIN, y + i * linhaH, COL_W, linhaH).fill(COR_FUNDO)
                .restore();
        }
    }

    doc.save()
        .moveTo(MARGIN + colW2 + 2, y + 4)
        .lineTo(MARGIN + colW2 + 2, y + tableH - 4)
        .strokeColor(COR_LINHA).lineWidth(0.5).stroke()
        .restore();

    for (let i = 1; i < metade; i++) {
        doc.save()
            .moveTo(MARGIN + 4, y + i * linhaH)
            .lineTo(PAGE_W - MARGIN - 4, y + i * linhaH)
            .strokeColor(COR_LINHA).lineWidth(0.3).stroke()
            .restore();
    }

    for (let i = 0; i < campos.length; i++) {
        const col = i < metade ? 0 : 1;
        const row = i < metade ? i : i - metade;
        linhaInfo(doc, campos[i][0], campos[i][1],
            MARGIN + col * (colW2 + 4), y + row * linhaH, colW2, linhaH);
    }
    y += tableH + 18;

    // ── Seção: Checklist selecionado ───────────────────────────────
    y = desenharChecklistSelecionado(doc, checklistSelecionado, y, idRelatorio);

    // ── Seção: Fotos ────────────────────────────────────────────────
    if (body.some(nc => nc.caminhoDaImagem)) {
        if (y > PAGE_H - MARGIN - 80) {
            doc.addPage({ size: 'A4', margin: 0 });
            y = desenharCabecalho(doc, idRelatorio);
        }
        y = tituloSecao(doc, 'Registros Fotográficos', y);

        const imgW = (COL_W - 12) / 2;
        const imgH = 140;
        const lblH = 30;
        const cardH = imgH + lblH + 10;
        let col = 0;

        for (const nc of body) {
            if (!nc.caminhoDaImagem) continue;

            if (y + cardH > PAGE_H - MARGIN - 30) {
                doc.addPage({ size: 'A4', margin: 0 });
                y = desenharCabecalho(doc, idRelatorio);
                y = tituloSecao(doc, 'Registros Fotográficos (continuação)', y);
                col = 0;
            }

            const x = MARGIN + col * (imgW + 12);
            fillRoundedRect(doc, x, y, imgW, cardH, RADIUS, COR_FUNDO);
            strokeRoundedRect(doc, x, y, imgW, cardH, RADIUS, COR_LINHA);

            const imgBuffer = await imagemBuffer(nc.caminhoDaImagem);
            if (imgBuffer) {
                try {
                    doc.image(imgBuffer, x + 5, y + 5, {
                        fit: [imgW - 10, imgH - 10], align: 'center', valign: 'center',
                    });
                } catch (_) {
                    fillRect(doc, x + 5, y + 5, imgW - 10, imgH - 10, '#e9ecef');
                    centeredText(doc, '[Imagem indisponível]', y + imgH / 2, imgW, COR_TEXTO_LEVE, 7);
                }
            } else {
                fillRect(doc, x + 5, y + 5, imgW - 10, imgH - 10, '#e9ecef');
                centeredText(doc, '[Imagem indisponível]', y + imgH / 2, imgW, COR_TEXTO_LEVE, 7);
            }

            fillRoundedRect(doc, x + 6, y + 6, 20, 14, 3, COR_ACCENT);
            doc.fontSize(7).fillColor('#ffffff').font('Helvetica-Bold')
                .text(`${body.indexOf(nc) + 1}`, x + 6, y + 10, { width: 20, align: 'center' });
            doc.font('Helvetica');

            doc.save()
                .moveTo(x + 6, y + imgH + 2).lineTo(x + imgW - 6, y + imgH + 2)
                .strokeColor(COR_LINHA).lineWidth(0.5).stroke()
                .restore();

            doc.fontSize(7).fillColor(COR_TEXTO)
                .text(nc.descricao || '', x + 6, y + imgH + 7,
                    { width: imgW - 12, height: lblH - 8, ellipsis: true });

            col++;
            if (col === 2) { col = 0; y += cardH + 12; }
        }
        if (col === 1) y += cardH + 12;
    }

    // ── Numerar páginas ─────────────────────────────────────────────
    const totalPaginas = doc.bufferedPageRange().count;
    for (let i = 1; i < totalPaginas; i++) {
        doc.switchToPage(i);
        desenharRodape(doc, i, totalPaginas - 1);
    }

    doc.end();

    // Aguarda o stream terminar e retorna o buffer completo
    await streamFinalizado;
    return Buffer.concat(chunks);
}

/* ── Seçãoo antiga que listava todas as não conformidades primeiro no PDF sem as fotos, removida pois o usuário preferiu a nova abordagem colocando o 
        checklist primeiro────────────────────────────────────────

    const FOOTER_SAFE = PAGE_H - MARGIN - 30;
    const rowH = 16;
    const headerH = 16;

    if (body.length === 0) {
        y = tituloSecao(doc, 'Resumo de Não Conformidades', y);
        fillRoundedRect(doc, MARGIN, y, COL_W, 28, RADIUS, COR_FUNDO);
        strokeRoundedRect(doc, MARGIN, y, COL_W, 28, RADIUS, COR_LINHA);
        doc.fontSize(9).fillColor(COR_TEXTO_LEVE)
            .text('Nenhuma não conformidade registrada.', MARGIN, y + 10,
                { width: COL_W, align: 'center' });
        y += 28 + 12;
    } else {
        const novaSecaoPagina = (continuacao = true) => {
            doc.addPage({ size: 'A4', margin: 0 });
            let ny = desenharCabecalho(doc, idRelatorio);
            ny = tituloSecao(doc,
                continuacao
                    ? 'Resumo de Não Conformidades (continuação)'
                    : 'Resumo de Não Conformidades',
                ny);
            return ny;
        };

        if (y + 28 + headerH + rowH > FOOTER_SAFE) {
            y = novaSecaoPagina(false);
        } else {
            y = tituloSecao(doc, 'Resumo de Não Conformidades', y);
        }

        const desenharHeaderTabela = (startY) => {
            fillRoundedRect(doc, MARGIN, startY, COL_W, headerH, RADIUS, COR_PRIMARIA);
            doc.fontSize(7).fillColor('#ffffff').font('Helvetica-Bold')
                .text('#', MARGIN + 6, startY + 5, { width: 20, lineBreak: false })
                .text('Descrição da Não Conformidade', MARGIN + 30, startY + 5,
                    { width: COL_W - 38, lineBreak: false });
            doc.font('Helvetica');
            return startY + headerH;
        };

        let rowY = desenharHeaderTabela(y);
        let globalIdx = 0;

        for (const nc of body) {
            if (rowY + rowH > FOOTER_SAFE) {
                strokeRoundedRect(doc, MARGIN, y, COL_W, rowY - y, RADIUS, COR_LINHA);
                y = novaSecaoPagina(true);
                rowY = desenharHeaderTabela(y);
                globalIdx = 0;
            }

            if (globalIdx % 2 === 0) {
                doc.save().rect(MARGIN, rowY, COL_W, rowH).fill(COR_FUNDO).restore();
            }
            if (globalIdx > 0) {
                doc.save()
                    .moveTo(MARGIN + 4, rowY).lineTo(PAGE_W - MARGIN - 4, rowY)
                    .strokeColor(COR_LINHA).lineWidth(0.3).stroke()
                    .restore();
            }

            const textRowY = rowY + Math.floor((rowH - 7) / 2);
            doc.fontSize(7).fillColor(COR_ACCENT2).font('Helvetica-Bold')
                .text(`${body.indexOf(nc) + 1}`, MARGIN + 6, textRowY,
                    { width: 20, lineBreak: false });
            doc.font('Helvetica').fillColor(COR_TEXTO)
                .text(nc.descricao || '', MARGIN + 30, textRowY,
                    { width: COL_W - 38, ellipsis: true, lineBreak: false });

            rowY += rowH;
            globalIdx++;
        }

        strokeRoundedRect(doc, MARGIN, y, COL_W, rowY - y, RADIUS, COR_LINHA);
        y = rowY + 18;
    } */