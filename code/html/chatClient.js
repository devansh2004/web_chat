//connect to server and retain the socket
//connect to same host that served the document

//const socket = io('http://' + window.document.location.host)
const socket = io() //by default connects to same server that served the page


//recives the message from the server
socket.on('serverSays', function(data) {
  let msgDiv = document.createElement('div')
  let username = document.getElementById('userBox').value.trim()

  
  /*
  What is the distinction among the following options to set
  the content? That is, the difference among:
  .innerHTML, .innerText, .textContent
  */
  //msgDiv.innerHTML = message
  //msgDiv.innerText = message
  console.log(data)

  //adds the message to a div
  msgDiv.textContent = data.sender + ": " + data.message

  //checks for the type of message and sets its color
  if(data.type == true){
    console.log("private")
    msgDiv.id = "private"
  }
  else if(data.sender == 'server'){
    msgDiv.id = "server"
  }
  else if(username == data.sender){
    msgDiv.id = "self"
  }
  else{
    msgDiv.id = "other"
  }

  //adds the message to the html
  document.getElementById('messages').appendChild(msgDiv)
})

//recives the servers info on if the client username is valid or not
socket.on("validUser",function(data){
  console.log(data.message)

  //changes the inputs on the html if the username is valid
  if(data.chatAccess){
    document.getElementById('msgBox').disabled = false
    document.getElementById('send_button').disabled = false
    document.getElementById('userBox').disabled = true
    document.getElementById('user_button').disabled = true
  }
})


//function for when a person sends a message
function sendMessage() {
 
  //gets the username of the client
  let username = document.getElementById('userBox').value.trim()

  //gets the message of the client
  let userMessage = document.getElementById('msgBox').value.trim()

  //makes sure the message isnt empty
  if(userMessage === '') return

  //creates the message that will be sent to the server
  let message = {sender: username, message: userMessage}

  //checks if the message is general or if its a private or group
  if(userMessage.includes(":")){
    console.log(userMessage.split(':')[0])

    //checks if the message is a group message
    if(userMessage.split(':')[0].includes(",")){
      socket.emit('groupMessage', message)
    }
    else{
      socket.emit('privateMessage', message)
    }
    
  }
  else{
    socket.emit('clientSays', message)
  }
  
  //clears the message text area on the htlm
  document.getElementById('msgBox').value = ''
}

function handleKeyDown(event) {
  const ENTER_KEY = 13 //keycode for enter key
  if (event.keyCode === ENTER_KEY) {
    sendMessage()
    return false //don't propogate event
  }
}

//send user name to server
function addUser(){

  //gets the username from the html text box
  let username = document.getElementById('userBox').value.trim()

  //makes sure the username isnt empty
  if(username === '') return

  //send the username to the server to register the client
  socket.emit('addUser', username)
}

function clearMessages(){

  //clears all the code in the message div
  document.getElementById('messages').innerHTML = '';
}

//Add event listeners
document.addEventListener('DOMContentLoaded', function() {
  //This function is called after the browser has loaded the web page

  //add listener to buttons
  document.getElementById('send_button').addEventListener('click', sendMessage)

  document.getElementById('user_button').addEventListener('click', addUser)

  document.getElementById('clear_messages').addEventListener('click', clearMessages)

  //add keyboard handler for the document as a whole, not separate elements.
  document.addEventListener('keydown', handleKeyDown)
  //document.addEventListener('keyup', handleKeyUp)
})
