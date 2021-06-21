import { useContext } from "react"
import { WebSocketContext } from "../contexts/WebSocket.js"

function Home() {

    const socketContext = useContext(WebSocketContext)
    
    function newGame() {
      socketContext.socketConnect()
    }

    return (
        <div>
            <button onClick={newGame}>
                Start or Connect to Game
            </button>
        </div>
    );
}

export default Home