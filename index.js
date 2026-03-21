const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('🚀 Bot de Reenvío: CONECTADO'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    }
});

// PUNTEROS DE GRUPOS ORIGEN
const FUENTES = ["URBAN", "CONTROL", "PDI", "CARABINEROS", "RUTAS", "IQQ"];
const DESTINO_NOMBRE = "Team Codigo Dragon";

client.on('ready', async () => {
    console.log('✅ CONEXIÓN EXITOSA');
    // Te envía un mensaje a ti mismo para avisar que despertó
    await client.sendMessage(client.info.wid._serialized, "🤖 *Bot Activado:* Estoy listo para filtrar mensajes.");
});

client.on('message_create', async (msg) => {
    try {
        const chat = await msg.getChat();
        
        if (chat.isGroup) {
            const nombreUpper = chat.name.toUpperCase();
            
            // 1. ¿Viene de un grupo autorizado?
            const esFuente = FUENTES.some(f => nombreUpper.includes(f));
            
            // 2. ¿Es el destino? (Para no reenviarse a sí mismo)
            const esDestino = nombreUpper.includes(DESTINO_NOMBRE.toUpperCase());

            if (esFuente && !esDestino) {
                const chats = await client.getChats();
                const grupoDestino = chats.find(c => c.name && c.name.includes(DESTINO_NOMBRE));

                if (grupoDestino && msg.body) {
                    const hora = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
                    const texto = `🚨 *NUEVO REPORTE*\n🕒 ${hora}\n📍 *Origen:* ${chat.name}\n\n${msg.body}`;
                    
                    await client.sendMessage(grupoDestino.id._serialized, texto);
                    console.log(`✅ Copiado de ${chat.name} a ${DESTINO_NOMBRE}`);
                }
            }
        }

        // COMANDO DE AUXILIO
        if (msg.fromMe && msg.body.toUpperCase() === 'LISTA') {
            const chats = await client.getChats();
            let lista = "*IDs de tus grupos:*\n\n";
            chats.filter(c => c.isGroup).forEach(g => {
                lista += `• ${g.name}: ${g.id._serialized}\n`;
            });
            await client.sendMessage(msg.to, lista);
        }

    } catch (e) {
        console.log("Error:", e);
    }
});

client.initialize();







