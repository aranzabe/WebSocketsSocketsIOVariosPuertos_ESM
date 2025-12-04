import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { socketController } from '../controllers/websocket-controller.js';
import {router as userRoutes} from '../routes/userRoutes.js'
import { createServer } from 'http';
import { Server } from 'socket.io';
import kleur from 'kleur';
dotenv.config();

class MiServer {

    constructor() {
        this.app = express();
        this.usuariosPath = '/api/usuarios';

        //Para websockets.
        // this.server = require('http').createServer(this.app); //Este 'http' ya viene con Node. Será el server que tenemos que levantar para los websockets. Tenemos que pasarle el 'this.app'.
        // this.io = require('socket.io')(this.server); //Sirve par enviar información de los clientes conectados. Como parámetro: 'this.server'.

        this.serverExpress = createServer(this.app);
        this.serverWebSocket = createServer(this.app);
        //this.io = new Server(this.server);    //Sirve par enviar información de los clientes conectados. Como parámetro: 'this.server'.  
        this.io = new Server(this.serverWebSocket, {
            cors: {
                // origin: ['http://127.0.0.1:8090', 'http://localhost:8090'], //Permitimos el acceso a estos dominios.
                origin: '*',    //Permitimos el acceso a todos los dominios.
                methods: ['GET', 'POST'],   //Permitimos los métodos GET y POST.
                // allowedHeaders: ['Content-Type'],   //Permitimos el header 'Content-Type
                // credentials: true   //Permitimos las credenciales.
            }
        });

        
        //Middlewares
        this.middlewares();

        //Rutas API.
        this.routes();

        //Websockets.
        this.sockets();
        
    }

    middlewares() {
        this.app.use(cors());
        this.app.use(express.json());

        //Directorio públco: http://localhost:9090/  --> Habilitamos esto para ver como se cargaría una imagen desde el cliente.
        //this.app.use(express.static('public'));
    }

    routes(){
        this.app.use(this.usuariosPath , userRoutes);
    }

    sockets(){
        //this.io.on('connection', socketController);
        // Pasamos `io` al controlador
        this.io.on('connection', socket => socketController(socket, this.io));
    }

    listen() {
        this.serverExpress.listen(process.env.PORT, () => {
            console.log(kleur.green().bold(`🟢 Servidor Express escuchando en: ${process.env.PORT}`));
            });

        this.serverWebSocket.listen(process.env.WEBSOCKETPORT, () => {
            console.log(kleur.blue().bold(`🔵 Servidor de WebSockets escuchando en: ${process.env.WEBSOCKETPORT}`));
        });
    }
}

export {MiServer};