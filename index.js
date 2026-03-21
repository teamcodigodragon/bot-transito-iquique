const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// --- DEFINICIÓN DE PUNTEROS (FRACCIONES DE NOMBRES) ---
const PUNTEROS_FUENTES = [
    "URBAN", 
    "CONTROL - IQUIQUE", 
    "PDI Y CARABINEROS", 
    "RUTAS IQUIQUE", 
    "Controles iqq"
];

const DESTINO_PUNTERO = "Team Codigo Dragon";

app.get('/', (req, res) => res.send('Sistema de Punteros Activo'));
app.listen(port, '0.0.0.0');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

client.on('ready', () => {
    console.log('--- 🚀 PROTOCOLO DE PUNTEROS INICIADO ---');
});

client.on('message_create', async (msg) => {
    try {
        const chat = await msg.getChat();
        
        // Solo operamos si el dato proviene de un grupo
        if (chat.isGroup) {
            const datoNombre = chat.name ? chat.name.toUpperCase() : "";

            // LÓGICA DE COINCIDENCIA: ¿El puntero existe dentro del dato?
            const coincidencia = PUNTEROS_FUENTES.find(puntero => 
                datoNombre.includes(puntero.toUpperCase())
            );

            // Si hay coincidencia y NO es el grupo destino, procedemos
            if (coincidencia && chat.name !== DESTINO_PUNTERO) {
                
                const todosLosChats = await client.getChats();
                // Puntero directo al grupo destino
                const grupoDestino = todosLosChats.find(c => c.name === DESTINO_PUNTERO);

                if (grupoDestino && msg.body) {
                    const hora = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
                    
                    // Construcción del post replicado
                    const postReplicado = `🚨 *REPORTE DETECTADO*\n🕒 ${hora}\n📍 *Origen:* ${chat.name}\n\n${msg.body}`;
                    
                    await client.sendMessage(grupoDestino.id._serialized, postReplicado);
                    console.log(`✅ Puntero [${coincidencia}] encontró dato en: ${chat.name}`);
                }
            }
        }
    } catch (e) {
        // Error controlado
    }
});

client.initialize();





