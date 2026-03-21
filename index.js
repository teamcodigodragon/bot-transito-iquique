
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// --- CONFIGURACIÓN DE SEGURIDAD Y FILTROS ---
const PUNTEROS_ORIGEN = ["URBAN", "CONTROL", "PDI", "CARABINEROS", "RUTAS", "IQQ"];
const NOMBRE_DESTINO_FIJO = "Team Codigo Dragon";

app.get('/', (req, res) => res.send('🛡️ Sistema de Replicación Team Codigo Dragon: ACTIVO'));
app.listen(port, '0.0.0.0');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

client.on('ready', async () => {
    console.log('------------------------------------------------');
    console.log('✅ BOT CONECTADO Y ESCUCHANDO EN IQUIQUE');
    console.log('------------------------------------------------');
    
    // Forzamos una carga de todos los chats para que el bot "vea" el destino
    const chats = await client.getChats();
    const destinoEncontrado = chats.find(c => c.name && c.name.includes(NOMBRE_DESTINO_FIJO));
    
    if (destinoEncontrado) {
        console.log(`📍 DESTINO DETECTADO: ${destinoEncontrado.name}`);
        console.log(`🆔 ID DEL DESTINO: ${destinoEncontrado.id._serialized}`);
    } else {
        console.log('⚠️ ADVERTENCIA: No veo el grupo "Team Codigo Dragon" en la lista inicial.');
    }
});

client.on('message_create', async (msg) => {
    try {
        const chat = await msg.getChat();
        if (!chat.isGroup) return;

        const nombreGrupo = chat.name ? chat.name.toUpperCase() : "";
        const idGrupo = chat.id._serialized;

        // LOG DE CUALQUIER ACTIVIDAD (Para que veas los IDs en Railway)
        console.log(`[MOVIMIENTO] Grupo: "${chat.name}" | ID: ${idGrupo}`);

        // 1. Verificamos si el mensaje viene de un origen autorizado (Punteros)
        const esOrigenValido = PUNTEROS_ORIGEN.some(p => nombreGrupo.includes(p));

        // 2. Si es origen y NO es el destino, intentamos la copia
        if (esOrigenValido && !nombreGrupo.includes(NOMBRE_DESTINO_FIJO.toUpperCase())) {
            
            const todosLosChats = await client.getChats();
            const grupoDestino = todosLosChats.find(c => 
                c.name && c.name.trim().toUpperCase() === NOMBRE_DESTINO_FIJO.toUpperCase()
            );

            if (grupoDestino && msg.body) {
                const hora = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
                const reporte = `🚨 *REPORTE REENVIADO*\n🕒 ${hora}\n📍 *Fuente:* ${chat.name}\n\n${msg.body}`;
                
                await client.sendMessage(grupoDestino.id._serialized, reporte);
                console.log(`>>> ✅ COPIADO DESDE ${chat.name} HACIA EL DESTINO`);
            }
        }
    } catch (error) {
        console.log("Error en el motor de copia:", error);
    }
});

client.initialize();






