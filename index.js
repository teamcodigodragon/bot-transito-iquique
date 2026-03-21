
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Servidor básico para que Railway no apague el bot
app.get('/', (req, res) => res.send('🛡️ Estado del Bot: Buscando Conexión y Generando IDs...'));
app.listen(port, '0.0.0.0');

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

// EVENTO 1: CONFIRMACIÓN DE CONEXIÓN
client.on('ready', () => {
    console.log('------------------------------------------------');
    console.log('✅ ¡CONEXIÓN EXITOSA! EL BOT ESTÁ ESCUCHANDO');
    console.log('------------------------------------------------');
});

// EVENTO 2: CAPTURA DE TODO MOVIMIENTO (PARA OBTENER EL @g.us)
client.on('message_create', async (msg) => {
    try {
        const chat = await msg.getChat();
        
        // ESTO APARECERÁ EN TUS LOGS DE RAILWAY CADA VEZ QUE PASE ALGO
        console.log(`📩 NUEVO DATO -> Grupo: "${chat.name}" | ID: ${chat.id._serialized}`);

        // COMANDO DE RESCATE: Si escribes LISTA en cualquier chat
        if (msg.body.toUpperCase() === 'LISTA') {
            const chats = await client.getChats();
            const grupos = chats.filter(c => c.isGroup);
            
            let txt = "📋 *TUS GRUPOS Y SUS IDs:*\n\n";
            grupos.forEach(g => {
                txt += `👥 *Nombre:* ${g.name}\n🆔 *ID:* ${g.id._serialized}\n\n`;
            });

            await client.sendMessage(msg.from, txt);
            console.log("✅ Lista enviada exitosamente a WhatsApp.");
        }
    } catch (err) {
        console.log("Error en el motor de escucha:", err);
    }
});

client.initialize();






