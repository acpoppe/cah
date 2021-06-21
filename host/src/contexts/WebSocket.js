import React, { createContext, useState, useEffect, useRef } from 'react'
import utf8 from 'utf8'

/***************************************************
 *  CONTEXT CREATION
 ****************************************************/
const WebSocketContext = createContext(null)

export { WebSocketContext }

/***************************************************
 * --------------------------------------
 *  CONTEXT CONTENTS FROM HERE TO END
 * --------------------------------------
 ****************************************************/
const WebSocketGoodies = ({ children }) => {
    let ws

/***************************************************
 *  CONNECTION STATE
 ****************************************************/
    const [state, setState] = useState({
        isSocketConnected: false,
        isRegisteredAsHost: false,
        uuidCounter: 0,
        uuid: ''
    })

    const socket = useRef({})
    const gameState = useRef({})


/***************************************************
 *  USE EFFECT HOOK
 ****************************************************/
    useEffect(() => {

        const incrementUUIDCounter = () => {
            if (state.uuidCounter === 9999) {
                setState({...state, uuidCounter: 0})
            } else {
                setState({...state, uuidCounter: state.uuidCounter + 1})
            }
        }
    
        const generateUUID = () => {
            if (localStorage.getItem('uuid')) {
                return localStorage.getItem('uuid')
            } else {
                incrementUUIDCounter();
                let newUUID = Date.now().toString(36) + Math.random().toString(36).substring(2) + state.uuidCounter.toString();
                localStorage.setItem('uuid', newUUID)
                return newUUID
            }
        }
        
        if (state.uuid === '' || !localStorage.getItem('uuid') ||
            (state.uuid !== localStorage.getItem('uuid'))) {
            setState({ ...state, uuid: generateUUID() })
        }
    }, [state]);


/***************************************************
 *  SOCKET BASIC OPERATIONS
 ****************************************************/
    const sendMessage = (commandToServer, message) => {
        const payload = {
            uuid: state.uuid,
            senderType: "host",
            command: commandToServer,
            data: message
        }
        if (socket.current.readyState !== WebSocket.CONNECTING) {
            socket.current.send(JSON.stringify(payload))
        }
    }

    const socketConnect = () => {
        let sock = new WebSocket('ws://192.168.1.11:9898')

        sock.onopen = function () {
            console.log("Host: Opened connection with server")
            setState({ ...state, isSocketConnected: true })
            sock.send(JSON.stringify({ uuid: state.uuid, senderType: "host", command: "NewOrConnectToGame", data: "" }))
            ws = {...ws, isSocketConnected: state.isSocketConnected}
        };

        sock.onerror = function (error) {
            console.log("Host: Websocket Error - " + error)
        }

        sock.onmessage = function (e) {
            console.log("Host: Received Message - " + e.data)
            const parsedMsg = JSON.parse(utf8.decode(e.data))
            receivedMessage(parsedMsg)
        }

        sock.onclose = function() {
            setState({...state, isSocketConnected: false})
            console.log("Host: Closed connection with server")
            ws = {...ws, isSocketConnected: state.isSocketConnected}
        }

        ws = {...ws, isSocketConnected: state.isSocketConnected}
        socket.current = sock
    }

    const socketClose = () => {
        socket.current.close()

        gameState.current = { ...gameState.current, GameMode: "NOT_RUNNING" }
        ws = {...ws, isSocketConnected: state.isSocketConnected, gameState: gameState.current}
        setState({ ...state })
    }


/***************************************************
 *  RECEIVED COMMAND ROUTING
 ****************************************************/
    const receivedMessage = (message) => {
        switch(message.command) {
            case "NewGameCreatedOrIsRunning":
                registerAsHost()
                break;
            case "SuccessfullyRegisteredAsHost":
                setState( {...state, isRegisteredAsHost: true} )
                break;
            case "UpdateHostStatus":
                gameState.current = message.data
                ws = {...ws, gameState: gameState.current}
                setState({ ...state })
                break;
            case "ServerEnding":
                socketClose()
                setState({ ...state, uuid: '' })
                localStorage.clear()
                break;
            default:
                // Do nothing and ignore it if we don't recognize
        }
    }


/***************************************************
 *  RECEIVED COMMAND HANDLING/API/WHATEVER
 ****************************************************/
    const registerAsHost = () => {
        sendMessage("RegisterAsHost", "")
    }

    const quitGame = () => {
        sendMessage("EndGame", "")
    }

/***************************************************
 *  PASSED DOWN DATA
 ****************************************************/
    ws = {
        isSocketConnected: state.isSocketConnected,
        gameState: gameState.current,
        socketConnect,
        socketClose,
        sendMessage,
        quitGame
    }


/***************************************************
 *  CONTEXT RETURN
 ****************************************************/
    return (
        <WebSocketContext.Provider value={ws}>
            {children}
        </WebSocketContext.Provider>
    )
}

export default WebSocketGoodies