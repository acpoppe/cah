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
        isRegisteredAsPlayer: false,
        uuidCounter: 0,
        uuid: ''
    })

    const socket = useRef({})
    const isGameRunning = useRef(false)
    const isNameTaken = useRef(false)
    const gameState = useRef({})
    const playerNameRef = useRef('Anonymous Player')


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
            senderType: "client",
            command: commandToServer,
            data: message
        }
        if (socket.current.readyState !== WebSocket.CONNECTING) {
            socket.current.send(JSON.stringify(payload))
        }
    }

    const socketConnect = () => {
        let sock = new WebSocket('ws://192.168.1.11:9898')
        isNameTaken.current = false
        ws = { ...ws, isNameTaken: isNameTaken.current }
        setState({ ...state })

        sock.onopen = function () {
            console.log("Client: Opened connection with server")
            setState({ ...state, isSocketConnected: true })
            sock.send(JSON.stringify({ uuid: state.uuid, senderType: "client", command: "ConnectToGame", data: "" }))
            ws = {...ws, isSocketConnected: state.isSocketConnected}
        };

        sock.onerror = function (error) {
            console.log("Client: Websocket Error - " + error)
        }

        sock.onmessage = function (e) {
            console.log("Client: Received Message - " + e.data)
            const parsedMsg = JSON.parse(e.data)
            // const parsedMsg = JSON.parse(utf8.decode(e.data))
            receivedMessage(parsedMsg)
        }

        sock.onclose = function() {
            setState({...state, isSocketConnected: false})
            console.log("Client: Closed connection with server")
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
                registerAsClient()
                isGameRunning.current = true
                ws = { ...ws, isGameRunning: isGameRunning.current }
                setState({ ...state })
                break;
            case "NoGameRunning":
                isGameRunning.current = false
                ws = { ...ws, isGameRunning: isGameRunning.current }
                setState({ ...state })
                socketClose()
                break;
            case "SuccessfullyRegisteredAsClient":
                setState( {...state, isRegisteredAsPlayer: true} )
                break;
            case "NameTaken":
                isNameTaken.current = true
                ws = { ...ws, isNameTaken: isNameTaken.current }
                setState({ ...state })
                socketClose()
                break;
            case "UpdatePlayerStatus":
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
    const registerAsClient = () => {
        sendMessage("RegisterAsPlayer", {playerName: playerNameRef.current})
    }

    const quitGame = () => {
        sendMessage("EndGame", "")
    }

    const updatePlayerName = (playerName) => {
        playerNameRef.current = playerName
    }

/***************************************************
 *  PASSED DOWN DATA
 ****************************************************/
    ws = {
        isSocketConnected: state.isSocketConnected,
        gameState: gameState.current,
        isGameRunning: isGameRunning.current,
        socketConnect,
        socketClose,
        sendMessage,
        quitGame,
        updatePlayerName
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