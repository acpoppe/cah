import { useContext } from "react"
import { WebSocketContext } from "../contexts/WebSocket.js"

function Lobby() {

    const socketContext = useContext(WebSocketContext)

    function quitGame() {
        socketContext.quitGame()
    }

    function beginGame() {
        socketContext.beginPlaying()
    }
  
    return (
        <div>
            <button onClick={quitGame}>Quit Game</button>
            <p>Lobby</p>
            <button onClick={beginGame}>Begin Game</button>
        </div>
    );
  }

  export default Lobby