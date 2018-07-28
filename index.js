const finalhandler = require('finalhandler')
const http = require('http')
const serveStatic = require('serve-static')
const gpio=require("./gpio")

// Serve up public/ftp folder
const serve = serveStatic('public/ftp', {'index': ['index.html']})
 
// Create server
const server = http.createServer(function onRequest (req, res) {
  serve(req, res, finalhandler(req, res))
})

const io= require("socket.io")(server)
// Listen
server.listen(5000)

gpio.io=io

let session

io.on('connection', function (socket) {
  socket.on("claimSession",fn=>{
    if (session) {
      fn(false)
    }else{
      fn(true)
      session=socket.id
    }
  })
  socket.on("endSession",fn=>{
    if (session!==socket.id) {
      return fn(false)
    }
    session=null
    fn(true)
  })
  socket.on("enableMagnet",fn=>{
    if (session!==socket.id) {
      return fn(false)
    }
    
    setTimeout(()=>fn(true),500)
  })
  socket.on("startTime",fn=>{
    if (session!==socket.id) {
      return fn(false)
    }
    gpio.startTime().then(val=>fn(val))
  })
  socket.on('disconnect', (reason) => {
    if (session===socket.id) {
      session=null
    }
  });
  
});
