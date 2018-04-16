const net = require('net')
const routes = {'GET': {}, 'POST': {}}

function createWebServer (requestHandler) {
  const server = net.createServer()
  server.on('connection', handleConnection)

  function handleConnection (socket) {
    // Set up a temporary buffer to read in chunks
    let reqBuffer = new Buffer('')
    socket.on('data', function (chunk) {
      console.log('request Buffer: ', reqBuffer)
      let reqHeader, body
      // Concatenate existing request buffer with new data
      reqBuffer = Buffer.concat([reqBuffer, chunk])

      // Check if we've reached \r\n\r\n, indicating end of header
      let marker = reqBuffer.indexOf('\r\n\r\n')
      if (marker >= 0) {
        console.log('received complete')
        console.log('Complete: ', reqBuffer.toString())
        console.log('end of header: ', marker)
        // If we reached \r\n\r\n, remaining data is the body
        body = reqBuffer.slice(marker + 4)
        // The header is everything we read, up to and not including \r\n\r\n
        reqHeader = reqBuffer.slice(0, marker).toString()
        console.log('remaining body: ', body.toString())
      } else if (marker === -1) {
        handleConnection(socket)
      }

      /* Request-related */
      // Start parsing the header
      const reqHeaders = reqHeader.split('\r\n')
      // First line is special
      const reqLine = reqHeaders.shift().split(' ')
      const request = {
        method: reqLine[0],
        url: reqLine[1],
        httpVersion: reqLine[2].split('/')[1]
      }
      // reqHeaders is one header per line, build an object out of it
      reqHeaders.forEach((ele, eleIndex) => {
        if (ele !== '') {
          let colonSeparator = ele.indexOf(':')
          let header = ele.slice(0, colonSeparator)
          let headerText = ele.slice(colonSeparator + 1)
          request[header] = headerText
        }
      })
      request.body = body.toString()

      // This object will be sent to the handleRequest callback.
      console.log('Request: ', request)

      /* Response-related */
      // Initial values
      let status = 200
      let statusText = 'OK'
      let headersSent = false
      let isChunked = false
      const responseHeaders = {
        server: 'my-web-server'
      }
      function setHeader (key, value) {
        responseHeaders[key.toLowerCase()] = value
      }
      function sendHeaders () {
        if (!headersSent) {
          headersSent = true
          // Add the date header
          setHeader('date', new Date().toGMTString())
          // Send the status line
          socket.write(`HTTP/1.1 ${status} ${statusText}\r\n`)
          // Send each following header
          Object.keys(responseHeaders).forEach(headerKey => {
            socket.write(`${headerKey}: ${responseHeaders[headerKey]}\r\n`)
          })
          // Add the final \r\n that delimits the response headers from body
          socket.write('\r\n')
        }
      }
      const response = {
        write (chunk) {
          if (!headersSent) {
            // If there's no content-length header, then specify Transfer-Encoding chunked
            if (!responseHeaders['content-length']) {
              isChunked = true
              setHeader('transfer-encoding', 'chunked')
            }
            sendHeaders()
          }
          if (isChunked) {
            const size = chunk.length.toString()
            socket.write(`${size}\r\n`)
            socket.write(chunk)
            socket.write('\r\n')
          } else {
            socket.write(chunk)
          }
        },
        end (chunk) {
          if (!headersSent) {
            if (!responseHeaders['content-length']) {
              // Assume that chunk is a buffer, not a string!
              setHeader('content-length', chunk ? chunk.length : 0)
            }
            sendHeaders()
          }
          if (isChunked) {
            if (chunk) {
              const size = (chunk.length).toString()

              socket.write(`${size}\r\n`)
              socket.write(chunk)
              socket.write('\r\n')
            }
            socket.end('0\r\n\r\n')
          } else {
            socket.end(chunk)
          }
        },
        setHeader,
        setStatus (newStatus, newStatusText) {
          status = newStatus
          statusText = newStatusText
        }
      }

      // Send the request & response to the handler
      requestHandler(request, response)
      if (routes[request.method][request.url]) {
        console.log('Request: ', request)
        routes[request.method][request.url](request, response)
      } else {
        response.setStatus(400, 'Page not Found')
        response.end('Page not Found')
      }
    })
  }

  return {
    listen: (port) => server.listen(port)
  }
}

const addRoutes = (method, path, callback) => {
  routes[method][path] = callback
}

const webServer = createWebServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  addRoutes('GET', '/', (req, res) => {
    res.setHeader('Content-Type', 'text/html')
    res.end(`<html>
  <head>
  <title>Login Page</title>
  </head>
  <body>
      <form action="/login" method="post">
          First name:<br>
          <input type="text" name="firstname" ><br>
          Last name:<br>
          <input type="text" name="lastname" ><br><br>
          <input type="submit" value="Submit">
        </form>
  </body>
  </html>`)
  })
  addRoutes('POST', '/login', (req, res) => {
    res.setHeader('Content-Type', 'text/plain')
    res.end(`Welcome`)
  })
  console.log(routes)
})

webServer.listen(3000)
