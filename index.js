const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// --- CONFIGURACIÓN ---
const NUMERO_BOT = "56 9 4044 0806"; // Ej: 56912345678 (sin el +)
const GRUPOS_PERMITIDOS = ["REPORTES RUTA A-16", "CONTROL IQUIQUE", "Zello Iquique Oficial", "Avisos de Carabineros"];
const MI_GRUPO_DESTINO = "Team Codigo Dragon";

let codigoVinculacion = "Generando código...";

app.get('/', (req, res) => {
    res.send(`<html><body style="background:#000;color:white;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;">
        <h1>Código de Vinculación WhatsApp</h1>
        <div style="background:#222;padding:20px;border-radius:10px;font-size:3em;letter-spacing:10px;color:#25D366;border:2px solid #25D366;">${codigoVinculacion}</div>
        <p style="margin-top:20px;">Pon este código en tu celular (Dispositivos vinculados > Vincular con número)</p>
    </body></html>`);
});

app.listen(port, '0.0.0.0', () => { console.log(`Servidor en puerto ${port}`); });

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36']
    }
});

// ESTA PARTE GENERA EL CÓDIGO DE 8 DÍGITOS
client.on('qr', async () => {
    try {
        const code = await client.requestPairingCode(NUMERO_BOT);
        codigoVinculacion = code;
        console.log('CÓDIGO DE VINCULACIÓN:', code);
    } catch (err) { console.log("Error generando código:", err); }
});

client.on('ready', () => {
    codigoVinculacion = "¡CONECTADO!";
    console.log('¡BOT ONLINE!');
});

client.on('message', async msg => {
    try {
        const chat = await msg.getChat();
        if (chat.isGroup && GRUPOS_PERMITIDOS.includes(chat.name)) {
            const todosLosChats = await client.getChats();
            const miGrupo = todosLosChats.find(c => c.name === MI_GRUPO_DESTINO);
            if (miGrupo && msg.body) {
                const reporte = `🚨 *REPORTE REENVIADO*\n📍 *Fuente:* ${chat.name}\n\n${msg.body}`;
                await client.sendMessage(miGrupo.id._serialized, reporte);
            }
        }
    } catch (e) { console.log("Error:", e); }
});

client.initialize();



