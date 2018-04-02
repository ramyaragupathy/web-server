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

  server.getConnections(function (count) {
    console.log('Number of established concurrent connections: ' + count)
  })

  // Event handlers.'on' is similar to addEventListener
  socket.on('end', function () {
    console.log('Server disconnected... 🐤')
  })
  socket.on('data', function (data) { // readable stream
    console.log('Data received from client: ', data)
    socket.write('Server says: ' + data) // writable stream
    // emit events
    socket.emit('error', new Error('Forcefully injected 🐞 '))
  })
  socket.on('error', function (error) {
    console.log(error + 'Something went wrong here...')
  })
})

// Resticts the maximum number of concurrent connections
server.maxConnections = 1

/**
 * Listen could also emit events
 */
server.listen(function () {
  console.log('server is listening... 👂👂👂 on port ', server.address().port)
  console.log('server bound address is: ' + JSON.stringify(server.address()))
})
