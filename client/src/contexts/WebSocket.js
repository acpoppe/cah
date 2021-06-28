import React, { createContext, useState, useEffect, useRef } from 'react'

/***************************************************
 *  CONTEXT CREATION
 ****************************************************/
const WebSocketContext = createContext(null);

export { WebSocketContext }

/***************************************************
 * --------------------------------------
 *  CONTEXT CONTENTS FROM HERE TO END
 * --------------------------------------
 ****************************************************/
const WebSocketGoodies = ({ children }) => {
    let ws;

/***************************************************
 *  CONNECTION STATE
 ****************************************************/
    const [state, setState] = useState({
        uuidCounter: 0,
        uuid: ''
    });

    const socket = useRef({});
    const isGameRunning = useRef(false);
    const isNameTaken = useRef(false);
    const gameState = useRef({});
    const playerNameRef = useRef('Anonymous Player');
    const isSocketConnected = useRef(false);
    const isRegisteredAsClient = useRef(false);


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
        let sock = new WebSocket('ws://192.168.1.11:9898');

        sock.onopen = function () {
            console.log("Client: Opened connection with server")
            isSocketConnected.current = true;
            setState({ ...state })
            sock.send(JSON.stringify({ uuid: state.uuid, senderType: "client", command: "ConnectToGame", data: "" }))
            ws = {...ws, isSocketConnected: isSocketConnected.current}
        };

        sock.onerror = function (error) {
            console.log("Client: Websocket Error - " + error)
        };

        sock.onmessage = function (e) {
            console.log("Client: Received Message - " + e.data)
            const parsedMsg = JSON.parse(e.data)
            receivedMessage(parsedMsg)
        };

        sock.onclose = function() {
            console.log("Client: Closed connection with server");
            connectionIsClosingOrClosed();
        };

        ws = {...ws, isSocketConnected: isSocketConnected.current};
        socket.current = sock;
    };

    const socketClose = () => {
        socket.current.close();
        connectionIsClosingOrClosed();
    };


/***************************************************
 *  RECEIVED COMMAND ROUTING
 ****************************************************/
    const receivedMessage = (message) => {
        switch(message.command) {
            case "NewGameCreatedOrIsRunning":
                registerAsClient();
                break;
            case "NoGameRunning":
                socketClose();
                break;
            case "SuccessfullyRegisteredAsClient":
                isRegisteredAsClient.current = true;
                setState({ ...state });
                break;
            case "NameTaken":
                isNameTaken.current = true
                ws = { ...ws, isNameTaken: isNameTaken.current }
                setState({ ...state })
                socketClose()
                break;
            case "UpdatePlayerStatus":
                gameState.current = message.data
                ws = {...ws, gameState: gameState.current};
                setState({ ...state });
                break;
            case "ServerEnding":
                socketClose();
                break;
            default:
                // Do nothing and ignore it if we don't recognize
        }
    };


/***************************************************
 *  RECEIVED COMMAND HANDLING/API/WHATEVER
 ****************************************************/
    const connectionIsClosingOrClosed = () => {
        gameState.current = { ...gameState.current, gameMode: "NOT_RUNNING", players: [] };
        isSocketConnected.current = false;
        isRegisteredAsClient.current = false;
        ws = { ...ws, isSocketConnected: false, gameState: gameState.current};
        localStorage.clear();
        setState({ ...state, uuid: ''});
    }

    const registerAsClient = () => {
        sendMessage("RegisterAsPlayer", {playerName: playerNameRef.current});
    }

    const updatePlayerName = (playerName) => {
        playerNameRef.current = playerName;
    }

    const advancePlayPhase = () => {
        sendMessage("AdvanceGamePhase", "");
    }

/***************************************************
 *  PASSED DOWN DATA
 ****************************************************/
    ws = {
        isSocketConnected: isSocketConnected.current,
        gameState: gameState.current,
        isGameRunning: isGameRunning.current,
        socketConnect,
        socketClose,
        sendMessage,
        updatePlayerName,
        advancePlayPhase
    };


/***************************************************
 *  CONTEXT RETURN
 ****************************************************/
    return (
        <WebSocketContext.Provider value={ws}>
            {children}
        </WebSocketContext.Provider>
    );
}

export default WebSocketGoodies