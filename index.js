const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

const MI_GRUPO_DESTINO = "Team Codigo Dragon"; 

client.on('qr', qr => {
    // Esto dibuja el QR en los Logs de Railway
    qrcode.generate(qr, {small: true});
    console.log('--- ¡QR LISTO ABAJO! ---');
});

client.on('ready', () => {
    console.log('¡BOT ACTIVADO CON ÉXITO EN EL GRUPO!');
});

client.on('message', async msg => {
    try {
        const chat = await msg.getChat();
        if (chat.isGroup && chat.name !== MI_GRUPO_DESTINO) {
            const todosLosChats = await client.getChats();
            const miGrupo = todosLosChats.find(c => c.name === MI_GRUPO_DESTINO);
            if (miGrupo && msg.body) {
                const hora = new Date().toLocaleTimeString();
                const reporte = `🚨 *REPORTE EXTERNO*\n🕒 ${hora}\n👥 *De:* ${chat.name}\n\n${msg.body}`;
                await client.sendMessage(miGrupo.id._serialized, reporte);
            }
        }
    } catch (e) { console.log("Error al procesar: ", e); }
});

client.initialize();
