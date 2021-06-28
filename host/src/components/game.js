import { useState, useContext, useEffect } from "react"
import { WebSocketContext } from "../contexts/WebSocket.js"
import Home from "./home.js"
import Lobby from "./lobby.js"
import Playing from "./playing.js"

function Game() {

    const socketContext = useContext(WebSocketContext);
    
    const [gameState, setGameState] = useState({
        GameMode: "HOME",
        Players: [],
        PlayPhase: '',
        Timer: 0
    });

    useEffect(() => {
        updateGameStateFromContext()
    }, [socketContext.gameState]);

    function updateGameStateFromContext() {
        let gameModeSwitch = 'HOME';
        let players = [];

        if (socketContext.gameState.gameMode === "NOT_RUNNING") {
            gameModeSwitch = "HOME";
        } else if (socketContext.gameState.gameMode) {
            gameModeSwitch = socketContext.gameState.gameMode;
        }

        players = socketContext.gameState.players;
        setGameState({ ...gameState,
            GameMode: gameModeSwitch,
            Players: players,
            PlayPhase: socketContext.gameState.playPhase,
            Timer: socketContext.gameState.timer
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
                <ul>
                    {gameState.Players.map( player => {
                        return (<li key= {player.playerName}>{player.playerName}</li>);
                    })}
                </ul>
            </div>
        );
    } else if (gameState.GameMode === "PLAYING") {
        return (
            <div>
                <p>Time Remaining: {gameState.Timer}</p>
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