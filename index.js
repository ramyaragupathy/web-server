const net = require('net')
const routes = {'GET': {}, 'POST': {}}

const requestParser = (request, socket) => {
  let reqArr = request.toString().split('\r\n')
  let reqObj = {}
  let startLine = reqArr[0].split(' ')
  reqObj.method = startLine[0]
  reqObj.path = startLine[1]
  reqObj.version = startLine[2].split('/')[1]

  reqArr.forEach((ele, eleIndex) => {
    if (eleIndex !== 0 && ele !== '') {
      let colonSeparator = ele.indexOf(':')
      let header = ele.slice(0, colonSeparator)
      let headerText = ele.slice(colonSeparator + 1)
      reqObj[header] = headerText
    }
  })

  reqObj.body = reqArr[reqArr.length - 1]
  return reqObj
}

const createServer = (port) => {
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
    // socket.on('end', function () {
    //   console.log('Server disconnected... 🐤')
    // })

    let requestBuffer = Buffer.from([])
    let bodyBuffer = Buffer.from([])
    let receivedPart = false
    let obj = {}
    socket.on('data', (data) => { // stream of data
      if (receivedPart) {
        bodyBuffer = Buffer.concat([bodyBuffer, data], bodyBuffer.length + data.length)
      }
      requestBuffer = Buffer.concat([requestBuffer, data], requestBuffer.length + data.length)
      if (requestBuffer.includes('\r\n\r\n')) {
        if (!receivedPart) {
          let [header, body] = getHeaderAndBody(requestBuffer)
          socket.write('HTTP/1.1 200 OK \r\nContent-type: text/plain \r\n\r\n Hello world!')
          // obj = parseRequest(header.toString())
          bodyBuffer = Buffer.from(body)
          receivedPart = true
        }
        if (obj.Headers['Content-Length'] === undefined || parseInt(obj.Headers['Content-Length']) !== bodyBuffer.length) {
          //handleRequest(obj, socket, bodyBuffer)
          requestBuffer = Buffer.from([])
          bodyBuffer = Buffer.from([])
          receivedPart = false
          obj = {}
        }
      }
    })
    // let reqArr = []
    // socket.on('data', function (request) { // readable stream

    // let requestObj = requestParser(request, socket)
    // // console.log('requestObj: ', JSON.stringify(requestObj))
    // // console.log('Data received from client: ', request.toString())
    // if (routes[requestObj.method].hasOwnProperty(requestObj.path)) {
    //   routes[requestObj.method][requestObj.path](requestObj, new Response())
    // } else {
    //   // 404 err
    // }
    // let responseObj = new Response()
    // console.log('Response: ', responseObj)
    // responseObj.headers['Content-type'] = 'text/plain'
    // // responseObj['body'] = JSON.stringify(requestObj)
    // let responseStr = responseObj.version + ' ' + responseObj.statusCode + ' ' +
    //               responseObj.statusMessage + ' \r\n' + responseObj.headers['Content-type'] +
    //               '\r\n\r\n'
    // socket.write(responseStr)
    // socket.write(`HTTP/1.1 200 OK \r\nContent-type: text/plain \r\n\r\n ${JSON.stringify(requestObj)}`) // writable stream
    // socket.end()
    // })
  })

  // Resticts the maximum number of concurrent connections
  server.maxConnections = 2

  /**
   * Listen could also emit events
   */
  server.listen(port, function () {
    console.log('server is listening... 👂👂👂 on port ', server.address().port)
    console.log('server bound address is: ' + JSON.stringify(server.address()))
  })
}
const statusInfo = {
  200: 'OK',
  404: 'Not Found',
  301: 'Moved Permanently'
}

function getHeaderAndBody (reqBuff) {
  let header = reqBuff.slice(0, reqBuff.indexOf('\r\n\r\n'))
  let body = reqBuff.slice(reqBuff.indexOf('\r\n\r\n') + 4)
  return [header, body]
}

class Response {
  constructor () {
    this.version = 'HTTP/1.1'
    this.statusCode = 200
    this.statusMessage = statusInfo[this.statusCode]
    this.headers = {}
  }
  setStatus (code) {
    this.statusCode = 200
    this.statusMessage = statusInfo[code]
  }
  send () {
    this.socket.write()
  }
}

const addRoutes = (method, path, callback) => {
  routes[method][path] = callback
}

module.exports = {createServer, addRoutes}
