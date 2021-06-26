import { useState, useContext, useEffect } from "react"
import { WebSocketContext } from "../contexts/WebSocket.js"
import Home from "./home.js"
import Lobby from "./lobby.js"
import Playing from "./playing.js"

function Game() {

    const socketContext = useContext(WebSocketContext);

    const [gameState, setGameState] = useState({
        GameMode: "HOME",
        PlayPhase: ''
    });

    useEffect(() => {
        updateGameStateFromContext()
    }, [socketContext.gameState]);

    function updateGameStateFromContext() {
        let gameModeSwitch = 'HOME';

        if (socketContext.gameState.gameMode === "NOT_RUNNING") {
            gameModeSwitch = "HOME";
        } else if (socketContext.gameState.gameMode) {
            gameModeSwitch = socketContext.gameState.gameMode;
        }

        setGameState({ ...gameState,
            GameMode: gameModeSwitch,
            PlayPhase: socketContext.gameState.playPhase
        });
    };

    if (gameState.GameMode === "HOME") {
        return (
            <div>
                <Home />
            </div>
        );
    } else if (gameState.GameMode === "LOBBY") {
        return (
            <div>
                <Lobby />
            </div>
        );
    } else if (gameState.GameMode === "PLAYING") {
        return (
            <div>
                <Playing />
            </div>
        );
    } else {
        return (
            <div>
                <p>Error: No game mode exists</p>
            </div>
        )
    }
}

export default Game