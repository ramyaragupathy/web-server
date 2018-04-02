const net = require('net')

/**
 * Creates a TCP server; It is an async model
 * Callback here is a connection listener that listens for any
 * connections form the client
 * TCP server is duplex streamed: read and write on the same socket
 * Write is usually on the client. It can also read from the client
 * 
*/

let server = net.createServer(function (socket) {
  console.log(socket)
  // Whenever a client makes a request this message is posted
  console.log('Connection established 🦁')

  // Event handlers.'on' is similar to addEventListener
  socket.on('end', function () {
    console.log('Server disconnected... 🐤')
  })
  socket.on('data', function (data) { // readable stream
    console.log('Data received ', data)
    socket.write('Server reply ' + data) // writable stream
  })
})

// console.log(net.createServer())

server.listen(9000, function () {
  console.log('server is listening')
  console.log('server bound address is: ' + JSON.stringify(server.address()))
})
