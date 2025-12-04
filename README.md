
1\. ¿Qué es Socket.IO?
======================

Socket.IO es una librería que permite **comunicación en tiempo real** entre un servidor y múltiples clientes usando WebSockets.  
También incluye mecanismos de fallback (como long-polling) para asegurar la conexión aunque WebSockets no esté disponible.

### ✔ Características principales:

*   Comunicación **bidireccional** (cliente ↔ servidor).
*   **Eventos personalizados** (emit / on).
*   Soporte nativo para **salas** ("rooms").
*   Soporta **mensajes privados** entre sockets.
*   Reintentos automáticos de reconexión.
*   Funciona en navegadores, Node.js y móviles.

* * *

2\. Instalación
===============

### Servidor:

```bash
npm install socket.io
```

### Cliente:

```bash
npm install socket.io-client
```

* * *

3\. Conceptos clave
===================

✔ Socket
--------

Cada cliente conectado recibe un **socket**, con un `id` único:

```js
socket.id  // Ejemplo: "J93ajkhajs-9ajd"
```

Ese id cambia **cada vez que el cliente se reconecta**.

* * *

✔ Eventos (emit / on)
---------------------

### Cliente → Servidor

```js
socket.emit("nombre-evento", data);
```

### Servidor → Cliente

```js
socket.emit("respuesta", payload);
```

### Recibir un evento:

```js
socket.on("nombre-evento", (data) => { ... });
```

* * *

✔ Broadcast
-----------

Enviar un mensaje a todos **menos el emisor**:

```js
socket.broadcast.emit("evento", data);
```

* * *

✔ Salas (rooms)
---------------

Cada socket puede unirse a uno o más grupos llamados **salas**:

```js
socket.join("nombreSala");
io.to("nombreSala").emit("mensaje", data);
```

También se pueden abandonar:

```js
socket.leave("nombreSala");
```

* * *

✔ Mensajes privados
-------------------

En Socket.IO, enviar un mensaje privado es tan simple como:

```js
socket.to(socketIdDestino).emit("mensaje-privado", data);
```

* * *

📘 **EXPLICACIÓN DEL EJEMPLO COMPLETO**
=======================================

_(cliente + servidor)_

* * *

🔹 **1\. SERVIDOR (Node.js con Socket.IO)**
===========================================

✔ Conexión de un cliente
------------------------

```js
io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);
});
```

Esto corre cada vez que un cliente se conecta.  
`socket.id` identifica a ese cliente.

* * *

✔ Enviar mensaje general
========================

Cliente emite:

```ts
socket.emit("enviar-mensaje", payload);
```

Servidor escucha:

```js
socket.on("enviar-mensaje", (payload, callback) => {
    callback({ msg: "Mensaje recibido" });
    socket.broadcast.emit("recibir-mensaje", payload);
});
```

Explicación:

1.  El servidor recibe el mensaje.
2.  Responde SOLO al emisor con un callback.
3.  Luego hace broadcast a todos los demás clientes.

* * *

✔ Solicitar lista de clientes conectados
========================================

Cliente pide una lista:

```ts
socket.emit("solicitar-clientes", callback);
```

Servidor responde:

```js
const sockets = await io.fetchSockets();
const clientes = sockets.map(s => s.id);
callback(clientes);
```

Esto devuelve un array con todos los `socket.id`.

* * *

✔ Mensaje privado
=================

Cliente:

```ts
socket.emit("mensaje-privado", { destinatarioId, mensaje });
```

Servidor:

```js
socket.to(destinatarioId).emit("recibir-mensaje", {
    de: socket.id,
    mensaje,
    privado: true
});
```

`socket.to(id)` envía **solo a un socket concreto**.

* * *

✔ Cambiar de sala (solo una sala activa)
========================================

Cliente:

```ts
socket.emit("cambiar-sala", { salaAnterior, salaNueva });
```

Servidor:

```js
socket.leave(salaAnterior);
socket.join(salaNueva);
```

Esto asegura que **solo estás en una sala a la vez**.

* * *

✔ Mensajes a salas
==================

Cliente:

```ts
socket.emit("mensaje-sala", { sala, mensaje });
```

Servidor:

```js
io.to(sala).emit("recibir-mensaje", { mensaje, sala });
```

Esto envía el mensaje **solo a los clientes de la sala**.

* * *

* * *

🔹 **2\. CLIENTE (Navegador con socket.io-client)**
===================================================

✔ Conexión
----------

```ts
const socket = io("http://localhost:8090");
```

✔ Mostrar ID del cliente
------------------------

```ts
socket.on("connect", () => {
  clientId = socket.id;
});
```

* * *

✔ Enviar mensaje general
========================

```ts
socket.emit("enviar-mensaje", payload, (confirmacion) => {
  console.log(confirmacion);
});
```

Aquí se usa un **callback** para recibir confirmación del servidor.

* * *

✔ Enviar mensaje privado
========================

```ts
socket.emit("mensaje-privado", { destinatarioId, mensaje });
```

* * *

✔ Cambiar de sala
=================

```ts
socket.emit("cambiar-sala", { salaAnterior, salaNueva });
```

Esto actualiza la sala en la que el cliente está.

* * *

✔ Enviar mensaje a sala
=======================

```ts
socket.emit("mensaje-sala", { sala, mensaje });
```

* * *

✔ Recibir mensajes (general, privado o sala)
============================================

El cliente los diferencia:

```ts
socket.on("recibir-mensaje", (payload) => {
  if (payload.sala)         ⇒ mensaje de sala
  else if (payload.privado) ⇒ mensaje privado
  else                      ⇒ mensaje general
});
```

* * *

✔ Actualizar lista de clientes cada 5 segundos
==============================================

```ts
setInterval(actualizarClientes, 5000);
```

Actualiza el `<select>` donde se eligen usuarios para mensajes privados.

* * *

🎯 **Resumen visual**
=====================

| Tipo de mensaje | Cliente → Servidor | Servidor → Cliente |
| --- | --- | --- |
| General | enviar-mensaje | broadcast excepto emisor |
| Privado | mensaje-privado | solo destinatario |
| Sala | mensaje-sala | to(sala).emit |
| Cambiar sala | cambiar-sala | (callback confirm) |
| Lista clientes | solicitar-clientes | callback con array |

🎯 **Instancias**
==================

Cada vez que un cliente se conecta, Socket.IO crea un objeto Socket único para esa conexión.
Ese objeto contiene:

- socket.id (ID único por conexión)

- Salas en las que participa (socket.rooms)

- Información de handshake, IP, headers, etc.

-  Todos los listeners (socket.on(...)) que tú definas

- Métodos como .emit(), .join(), .leave(), .to(), etc.

Ese objeto vive mientras la conexión esté activa.
Cuando el cliente se desconecta, Socket.IO:

- elimina ese objeto,

- dispara el evento "disconnect",

- limpia salas, listeners, etc.

* * *