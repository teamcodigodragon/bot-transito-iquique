const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    }
});

// ESCRIBE AQUÍ EL NOMBRE EXACTO DE TU GRUPO
const MI_GRUPO_DESTINO = "Team Codigo Dragon"; 

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
    console.log('--- COPIA ESTE QR ---');
});

client.on('ready', () => {
    console.log('¡Bot conectado con éxito!');
});

client.on('message', async msg => {
    const chat = await msg.getChat();
    
    // Si viene de un grupo y no es el tuyo, lo copia
    if (chat.isGroup && chat.name !== MI_GRUPO_DESTINO) {
        const todosLosChats = await client.getChats();
        const miGrupo = todosLosChats.find(c => c.name === MI_GRUPO_DESTINO);
        
        if (miGrupo && msg.body) {
            const hora = new Date().toLocaleTimeString();
            const reporte = `🚨 *REPORTE EXTERNO*\n🕒 ${hora}\n👥 *De:* ${chat.name}\n\n${msg.body}`;
            await client.sendMessage(miGrupo.id._serialized, reporte);
        }
    }
});

client.initialize();
