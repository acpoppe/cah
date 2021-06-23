import { useState, useContext } from "react"
import { WebSocketContext } from "../contexts/WebSocket.js"
import Home from "./home.js"
import Lobby from "./lobby.js"
import Playing from "./playing.js"

function Game() {

    const socketContext = useContext(WebSocketContext)

    const [gameMode, setGameMode] = useState("Home")

    function updateGameModeFromContext() {
        if (gameMode === "Home") {
            if (socketContext.gameState.GameMode === "LOBBY") {
                setGameMode("Lobby")
            } else if (socketContext.gameState.GameMode === "PLAYING") {
                setGameMode("Playing")
            }
        }
        if (gameMode === "Lobby") {
            if (socketContext.gameState.GameMode === "NOT_RUNNING") {
                setGameMode("Home")
            } else if (socketContext.gameState.GameMode === "PLAYING") {
                setGameMode("Playing")
            }
        }
        if (gameMode === "Playing") {
            if (socketContext.gameState.GameMode === "LOBBY") {
                setGameMode("Lobby")
            } else if (socketContext.gameState.GameMode === "NOT_RUNNING") {
                setGameMode("Home")
            }
        }
    }

    updateGameModeFromContext()

    if (gameMode === "Home") {
        return (
            <div>
                <Home />
            </div>
        );
    } else if (gameMode === "Lobby") {
        return (
            <div>
                <Lobby />
            </div>
        );
    } else if (gameMode === "Playing") {
        return (
            <div>
                <Playing />
            </div>
        );
    }
}

export default Game