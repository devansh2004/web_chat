/*
(c) 2023 Louis D. Nel
Based on:
https://socket.io
see in particular:
https://socket.io/docs/
https://socket.io/get-started/chat/

Before you run this app first execute
>npm install
to install npm modules dependencies listed in package.json file
Then launch this server:
>node server.js

To test open several browsers to: http://localhost:3000/chatClient.html

*/

let clients = []

const server = require('http').createServer(handler)
const io = require('socket.io')(server) //wrap server app in socket io capability
const fs = require('fs') //file system to server static files
const url = require('url'); //to parse url strings
const PORT = process.argv[2] || process.env.PORT || 3000 //useful if you want to specify port through environment variable
                                                         //or command-line arguments

const ROOT_DIR = 'html' //dir to serve static files from

const MIME_TYPES = {
  'css': 'text/css',
  'gif': 'image/gif',
  'htm': 'text/html',
  'html': 'text/html',
  'ico': 'image/x-icon',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'js': 'application/javascript',
  'json': 'application/json',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'txt': 'text/plain'
}

function get_mime(filename) {
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES['txt']
}

server.listen(PORT) //start http server listening on PORT

function handler(request, response) {
  //handler for http server requests including static files
  let urlObj = url.parse(request.url, true, false)
  console.log('\n============================')
  console.log("PATHNAME: " + urlObj.pathname)
  console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
  console.log("METHOD: " + request.method)

  let filePath = ROOT_DIR + urlObj.pathname
  if (urlObj.pathname === '/') filePath = ROOT_DIR + '/index.html'

  fs.readFile(filePath, function(err, data) {
    if (err) {
      //report error to console
      console.log('ERROR: ' + JSON.stringify(err))
      //respond with not found 404 to client
      response.writeHead(404);
      response.end(JSON.stringify(err))
      return
    }
    response.writeHead(200, {
      'Content-Type': get_mime(filePath)
    })
    response.end(data)
  })

}

//Socket Server
io.on('connection', function(socket) {
  console.log('client connected')
  //console.dir(socket)

  //send a signle to tell the client they are connected to the sever
  socket.emit('serverSays', {sender: "server" , message: 'You are connected to CHAT SERVER'})

  //function to send normal message
  socket.on('clientSays', function(data) {
    console.log('RECEIVED: ' + data.message)
    //to broadcast message to everyone including sender:
    io.to('registeredUser').emit('serverSays', data) //broadcast to everyone that is registered user
    //alternatively to broadcast to everyone except the sender
    //socket.broadcast.emit('serverSays', data)
  })

  //runs when a client adds their user name
  socket.on('addUser',function(user){

    //string for what a valid name can be
    let validName = /^[a-zA-Z][a-zA-Z0-9]*$/
    //checks to make sure the username is unique and valid to the constraints
    if(!([user] in clients) && user.match(validName)){

      //adds the username to a dictionary
      clients[user] = socket.id

      //tells the client that they have a valid username and gives them chat access
      io.to(socket.id).emit("validUser", {chatAccess: true, message: "Conected"})

      //send the client a message that says theya registered
      io.to(socket.id).emit('serverSays', {sender: "server" , message: 'You are registered to CHAT SERVER'})

      //adds the client to a room with all registered users
      socket.join('registeredUser')
    }
    else{

      //send the client a message that the name is invalid
      io.to(socket.id).emit("validUser", {chatAccess: false, message: "name is invalid"})
      io.to(socket.id).emit('serverSays', {sender: "server" , message: 'name is invalid'})

    }

    //lets the server see all clients
    console.log(Object.keys(clients))
    
  })

  //called when a client sends a private message
  socket.on('privateMessage',function(message){

    console.log("private message")

    //gets the username of client that will recive the message
    let toUser = message.message.split(':')[0]

    //adds only the message to the message property
    message.message = message.message.split(':')[1]

    //adds a propery to show that the message is private
    message.type = true

    //sends the message to the specific client
    io.to(clients[toUser]).emit('serverSays', message)

    //sends the same message to the sender client
    io.to(socket.id).emit('serverSays', message)

  })

  //called when a client sends a group message
  socket.on('groupMessage',function(message){
    console.log("group message")

    //seperates the users and the message
    let toUser = message.message.split(':')[0].split(",").map(user => user.trim());

    //adds only the message to the message property
    message.message = message.message.split(':')[1]

    //makes the message type true to show its a group message
    message.type = true

    //loop to send the message to each diffrent client
    for(let i = 0; i < toUser.length; i++){
      console.log(toUser[i])

      //sends message to a specific client
      io.to(clients[toUser[i]]).emit('serverSays', message)
    }
    
    //sends the message to the sender client
    io.to(socket.id).emit('serverSays', message)

  })

  socket.on('disconnect', function(data) {
    //event emitted when a client disconnects
    console.log('client: ' + String(getObjectKey(clients, socket.id)) + ' disconnected')
    delete clients[String(getObjectKey(clients, socket.id))]
  })


  socket.on("turnSignal",function(data){
    console.log("recived turn signal")
    io.emit("shootingAreaColor",data)
  })

})

function getObjectKey(obj, value) {
  return Object.keys(obj).find((key) => obj[key] === value);
}

console.log(`Server Running at port ${PORT}  CNTL-C to quit`)
console.log(`To Test:`)
console.log(`Open several browsers to: http://localhost:${PORT}/chatClient.html`)
