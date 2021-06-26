import { useContext, useState } from "react"
import { WebSocketContext } from "../contexts/WebSocket.js"

function Home() {

    const socketContext = useContext(WebSocketContext);

    const [playerName, setPlayerName] = useState('');
    
    function newGame() {
        if (playerName !== '') {
            socketContext.updatePlayerName(playerName);
            socketContext.socketConnect();
        }
    };

    return (
        <div>
            <input placeholder="Enter the name you want" onInput={e => setPlayerName(e.target.value)}/>
            <br />
            <button onClick={newGame}>
                Start or Connect to Game
            </button>
        </div>
    );
}

export default Home