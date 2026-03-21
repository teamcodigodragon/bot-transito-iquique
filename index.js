const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const app = express();

// --- SERVIDOR PARA MANTENER RAILWAY VIVO ---
app.get('/', (req, res) => res.send('🚀 Sistema Team Codigo Dragon: OPERATIVO'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './sesion_bot' }),
    puppeteer: { 
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] 
    }
});

// --- VARIABLES DE GRUPOS ---
const t = "Team Codigo Dragon"; // Destino

client.on('ready', () => {
    console.log('✅ BOT CONECTADO: Escaneando rutas de Iquique...');
});

client.on('message_create', async (msg) => {
    try {
        const chat = await msg.getChat();
        if (!chat.isGroup) return;

        // "N" es el nombre que el bot lee del grupo
        const N = chat.name;
        
        // NORMALIZACIÓN: Quitamos emojis y convertimos a mayúsculas para comparar fácil
        const nLimpio = N.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
        
        let idAsignado = "";

        // --- LÓGICA DE COMPARATIVAS (Nomenclatura U1-C5) ---
        if (nLimpio.includes("URBAN")) { idAsignado = "U1"; }
        else if (nLimpio.includes("CONTROL") && nLimpio.includes("IQUIQUE")) { idAsignado = "C2"; }
        else if (nLimpio.includes("PDI") || nLimpio.includes("CARABINEROS")) { idAsignado = "C3"; }
        else if (nLimpio.includes("RUTAS")) { idAsignado = "R4"; }
        else if (nLimpio.includes("CONTROLES IQQ")) { idAsignado = "C5"; }

        // --- LA MAGIA: Si hay coincidencia y no es el grupo de destino ---
        if (idAsignado !== "" && !nLimpio.includes(t.toUpperCase())) {
            
            const todosLosChats = await client.getChats();
            const grupoT = todosLosChats.find(c => c.name && c.name.includes(t));

            if (grupoT && msg.body) {
                const hora = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
                
                const reporte = `🚨 *REPORTE [${idAsignado}]*\n🕒 *Hora:* ${hora}\n📍 *Origen:* ${N}\n\n${msg.body}`;
                
                await client.sendMessage(grupoT.id._serialized, reporte);
                console.log(`✨ Magia: Replicado de ${idAsignado} a ${t}`);
            }
        }

        // --- COMANDO DE RESCATE (Solo para ti) ---
        if (msg.body.toUpperCase() === 'LISTA') {
            await client.sendMessage(msg.from, `🤖 Estoy activo. Leyendo: "${N}"`);
        }

    } catch (e) {
        console.log("Error en el escaneo:", e);
    }
});

client.initialize();









