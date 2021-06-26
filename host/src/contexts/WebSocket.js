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
    const gameState = useRef({});
    const isSocketConnected = useRef(false);
    const isRegisteredAsHost = useRef(false);


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
        let sock = new WebSocket('ws://192.168.1.11:9898');

        sock.onopen = function () {
            console.log("Host: Opened connection with server");
            isSocketConnected.current = true;
            setState({ ...state });
            sock.send(JSON.stringify({ uuid: state.uuid, senderType: "host", command: "NewOrConnectToGame", data: "" }));
            ws = {...ws, isSocketConnected: isSocketConnected.current};
        };

        sock.onerror = function (error) {
            console.log("Host: Websocket Error - " + error);
        };

        sock.onmessage = function (e) {
            console.log("Host: Received Message - " + e.data);
            const parsedMsg = JSON.parse(e.data);
            receivedMessage(parsedMsg);
        };

        sock.onclose = function() {
            console.log("Host: Closed connection with server");
            connectionIsClosingOrClosed();
        };

        ws = {...ws, isSocketConnected: isSocketConnected.current};
        socket.current = sock;
    };

    const socketClose = () => {
        socket.current.close();
        connectionIsClosingOrClosed();
    }


/***************************************************
 *  RECEIVED COMMAND ROUTING
 ****************************************************/
    const receivedMessage = (message) => {
        switch(message.command) {
            case "NewGameCreatedOrIsRunning":
                registerAsHost();
                break;
            case "SuccessfullyRegisteredAsHost":
                isRegisteredAsHost.current = true;
                setState( {...state} );
                break;
            case "UpdateHostStatus":
                gameState.current = message.data;
                ws = {...ws, gameState: gameState.current};
                setState({ ...state });
                break;
            case "ServerEnding":
                socketClose();
                break;
            default:
                // Do nothing and ignore it if we don't recognize
        }
    }


/***************************************************
 *  RECEIVED COMMAND HANDLING/API/WHATEVER
 ****************************************************/
    const connectionIsClosingOrClosed = () => {
        gameState.current = { ...gameState.current, gameMode: "NOT_RUNNING", players: [] };
        isSocketConnected.current = false;
        isRegisteredAsHost.current = false;
        ws = { ...ws, isSocketConnected: false, gameState: gameState.current};
        localStorage.clear();
        setState({ ...state, uuid: ''});
    }

    const registerAsHost = () => {
        sendMessage("RegisterAsHost", "")
    }

    const beginPlaying = () => {
        sendMessage("BeginPlaying", "")
    }

    const quitGame = () => {
        sendMessage("EndGame", "")
    }

/***************************************************
 *  PASSED DOWN DATA
 ****************************************************/
    ws = {
        isSocketConnected: isSocketConnected.current,
        gameState: gameState.current,
        socketConnect,
        socketClose,
        sendMessage,
        beginPlaying,
        quitGame
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