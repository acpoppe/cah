import { useContext } from "react"
import { WebSocketContext } from "../contexts/WebSocket.js"

function Lobby() {

    const socketContext = useContext(WebSocketContext)

    function closeConnection() {
        socketContext.quitGame()
    }
  
    return (
        <div>
            <button onClick={closeConnection}>Quit Game</button>
            <p>Lobby</p>
        </div>
    );
  }

  export default Lobby