const net = require('net')

// Creates a TCP server; It is an async model
let server = net.createServer(function (socket) {
  console.log('Connection established 🦁')
  socket.on('end', function () {
    console.log('Server disconnected... 🐤')
  })
  socket.on('data', function (data) {
    console.log('Data received ', data)
    socket.write('Server reply ' + data)
  })
})

server.listen(9000, function () {
  console.log('server is listening')
  console.log('server bound address is: ' + JSON.stringify(server.address()))
})
