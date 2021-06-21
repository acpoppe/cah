import ip from 'ip'
import WebSocket from 'ws'
import utf8 from 'utf8'

import Game from './game.js'
import HostConnection from './hostConnection.js'

const WSPORT = 9898
const WSHOST = '0.0.0.0'
const FRAMERATE = 20

var game = new Game()

var previousTick = Date.now()

console.log("IP Address: " + ip.address())

/***************************************************
 *  CONNECTION HANDLERS
 ****************************************************/

const wsServer = new WebSocket.Server({
    port: WSPORT,
    host: WSHOST
});

wsServer.on('connection', function connection(ws, request) {
    // Log that we got a new connection
    console.log("Connection opened");

    // All messages should be a JSON string with a command property,
    // so route our next action based on what that is
    ws.on('message', (message) => {
        console.log('received: %s', message)
        const parsedMsg = JSON.parse(utf8.decode(message))
        console.log(parsedMsg)
        switch (parsedMsg.command) {
            case "NewOrConnectToGame":
                console.log("New or Connect to Game")
                game.newGame()
                sendMessage(ws, "NewGameCreatedOrIsRunning", "")
                break;
            case "RegisterAsHost":
                console.log("Received New HostRegistration")
                game.registerNewHost(ws, parsedMsg.uuid)
                break;
            case "EndGame":
                endGame()
                break;
            // If we don't recognize the command, we'll ignore it
            default:
                return;
        }
    });

    ws.on('close', function closing() {
        console.log("Connection closed");
    });
});

/***************************************************
 *  OTHER STUFF
 ****************************************************/

function sendMessage(socketToSendTo, commandToSend, message) {
    const payload = {
        senderType: "server",
        command: commandToSend,
        data: message
    }
    socketToSendTo.send(JSON.stringify(payload))
}

function endGame() {
    const payload = {
        senderType: "server",
        command: "ServerEnding",
        data: ""
    }
    game.hostsConnected.forEach(host => {
        host.connection.send(JSON.stringify(payload))
    })
    game.playersConnected.forEach(player => {
        player.connection.send(JSON.stringify(payload))
    })
    game.quitGame()
}


/***************************************************
 *  GAME LOOP AND HELPERS FOR IT
 ****************************************************/


// Don't want to use a while loop in the traditional sense for fear of blocking I/O
// so this offers the best balance between the lack of precision in timer setting and
// the CPU load from setImmediate(callback)
function gameLoop() {
    // If it's time to run game logic...
    if (previousTick + (1000 / FRAMERATE) < Date.now()) {
        previousTick = Date.now()
        if (game.isRunning) {
            game.gameTick()
        }
    }
    
    // if we are more than 16 milliseconds away from the next tick
    if (Date.now() - previousTick < (1000 / FRAMERATE) - 16) {
        setTimeout(gameLoop) // Sloppy timer, schedules to call again in 1 ms
    } else {
        setImmediate(gameLoop) // Call again immediately after finishing the loop
    }
}

// Start the game loop
gameLoop()