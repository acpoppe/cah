import { useContext } from "react"
import { WebSocketContext } from "../contexts/WebSocket.js"

function Playing() {

    const socketContext = useContext(WebSocketContext)

    function quitGame() {
        socketContext.quitGame()
    }

    return (
        <div>
            <button onClick={quitGame}>Quit Game</button>
            <p>Playing</p>
            <p>Pick {socketContext.gameState.dealtBlackCard.pick}</p>
            <p>{socketContext.gameState.dealtBlackCard.text}</p>
        </div>
    );
}

export default Playing