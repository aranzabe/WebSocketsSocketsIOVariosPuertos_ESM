import kleur from 'kleur';

export const socketController = (socket,io) => {
    //Con este bloque probamos a cargar la url en un navegador: http://localhost:9090/
    console.log(kleur.yellow().bold("Cliente conectado:"), socket.id);


    // io.on("connection", (socket) => {
    // socket.emit("mensaje-bienvenida", {
    //     msg: "Bienvenido!",
    //     id: socket.id,
    //     fecha: Date.now()
    //     });
    // });

    // ----------------- Desconexión -----------------
    socket.on("disconnect", () => {
        console.log(kleur.yellow().bold("Cliente desconectado", socket.id));
    });

    // ----------------- Mensaje general -----------------
    socket.on("enviar-mensaje", (payload, callback) => {
        console.log("Payload recibido:", payload);
        callback({ msg: "Mensaje recibido", id: payload.id, fecha: new Date().getTime() });

        // Broadcast a todos los clientes excepto el que envió
        socket.broadcast.emit("recibir-mensaje", payload);
    });

    // ----------------- Solicitar lista de clientes -----------------
    socket.on("solicitar-clientes", async (callback) => {
        try {
            // Obtenemos todos los sockets conectados
            const sockets = await io.fetchSockets();

            // Solo enviamos los socket.id, puedes enviar más info si quieres
            const clientes = sockets.map(s => s.id);

            callback(clientes); // enviamos la lista al cliente que la pidió
        } catch (err) {
            console.error(err);
            callback([]);
        }
    });

    // ----------------- Mensaje privado sin necesidad de salas adicionales -----------------
    socket.on("mensaje-privado", ({ destinatarioId, mensaje }) => {
        socket.to(destinatarioId).emit("recibir-mensaje", {
            de: socket.id,
            mensaje,
            fecha: new Date().getTime(),
            privado: true,
            toId: destinatarioId
        });
    });

    // ----------------- Unirse a sala -----------------
    // socket.on("unirse-sala", (nombreSala, callback) => {
    //     socket.join(nombreSala);
    //     callback(`Te has unido a la sala ${nombreSala}`);
    // });

    // ----------------- Mensaje a sala -----------------
    socket.on("mensaje-sala", ({ sala, mensaje }) => {
        io.to(sala).emit("recibir-mensaje", {
        de: socket.id,
        mensaje,
        fecha: new Date().getTime(),
        sala: sala, // indicamos la sala
        });
    });


     // ----------------- Cambiar de sala (una sala a la vez) -----------------
    socket.on("cambiar-sala", ({ salaAnterior, salaNueva }, callback) => {

        // Abandonar sala anterior
        if (salaAnterior) {
            socket.leave(salaAnterior);
            console.log(`Socket ${socket.id} salió de ${salaAnterior}`);
        }

        // Unirse a nueva sala
        socket.join(salaNueva);
        console.log(`Socket ${socket.id} se unió a ${salaNueva}`);

        callback(`Ahora estás en la sala ${salaNueva}`);
    });

}


/*
   socket.to(destinatarioId).emit('mensaje-privado', {
        de: socket.id,
        mensaje
    });
*/