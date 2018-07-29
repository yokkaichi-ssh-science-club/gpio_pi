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
      gpio.reset().then(()=>{
        fn(true)
        session=socket.id
      })
    }
  })
  socket.on("endSession",fn=>{
    if (session!==socket.id) {
      return fn(false)
    }
    gpio.reset().then(()=>{
      session=null
      fn(true)
    })
  })
  socket.on("enableMagnet",fn=>{
    if (session!==socket.id) {
      return fn(false)
    }
    
    gpio.enableMagnet().then(()=>fn(true))
  })
  socket.on("startTime",fn=>{
    if (session!==socket.id) {
      return fn(false)
    }
    gpio.startTime().then(val=>fn(val))
  })
  socket.on('disconnect', (reason) => {
    if (session===socket.id) {
      gpio.reset().then(()=>{
        session=null
      })
    }
  });
  
});
