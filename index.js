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
  // Whenever a client makes a request this message is posted
  console.log('Connection established 🦁')

  server.getConnections(function (error, count) {
    console.log('Number of established concurrent connections: ' + count)
  })

  // Event handlers.'on' is similar to addEventListener
  socket.on('end', function () {
    console.log('Server disconnected... 🐤')
  })
  socket.on('data', function (data) { // readable stream
    console.log('Data received from client: ', data.toString())
    socket.write(`HTTP/1.1 200 OK \r\nContent-type: text/plain \r\n\r\n ${data.toString()}`) // writable stream
    socket.end()
  })

})

// Resticts the maximum number of concurrent connections
server.maxConnections = 2

/**
 * Listen could also emit events
 */
server.listen(8111, function () {
  console.log('server is listening... 👂👂👂 on port ', server.address().port)
  console.log('server bound address is: ' + JSON.stringify(server.address()))
})
