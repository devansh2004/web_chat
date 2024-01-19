# INSTALL INSTRUCTIONS:
	Make sure you have Node.js and npm installed.
	Then go to the server.js directory in the terminal
	Type "npm install socket.io" and hit enter

# LAUNCH INSTRUCTIONS:
	To launch the chat server go to the server.js directory in the terminal and type "node server.js"


# TESTING INSTRUCTIONS:
	To test the chat server use this link on a browser:
		http://localhost:3000/chatClient.html

	Then type a username in the username box and hit the username button

	With multiple tabs you will be able to chat with each client

	If you just type a message that message will be sent to all clients

	If you do "username": "message" a private message wil be sent to the client with the same username

	If you do "username1, username2, ...": "message" a gruop message wil be sent to the client with the same usernames
