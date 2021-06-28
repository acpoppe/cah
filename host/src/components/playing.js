import { useState, useContext, useEffect } from "react"
import { WebSocketContext } from "../contexts/WebSocket.js"

function Playing() {

    const [playingState, setPlayingState] = useState('');
    const [cardCzarPlayerName, setCardCzarPlayerName] = useState('');

    const socketContext = useContext(WebSocketContext);

    useEffect(() => {
        updateGameStateFromContext()
    }, [socketContext.gameState]);

    function updateGameStateFromContext() {
        setPlayingState(socketContext.gameState.playPhase);
        setCardCzarPlayerName(socketContext.gameState.cardCzarPlayerName);
    }

    function quitGame() {
        socketContext.quitGame();
    }

    let renderContents;
    if (playingState === '') {
        renderContents = <div><p>No play phase found</p></div>
    }
    if (playingState === "ANNOUNCE_CZAR") {
        renderContents = (<div>
            <button onClick={quitGame}>Quit Game</button>
            <p>{cardCzarPlayerName} is the next card Czar</p>
            <p>Waiting for {cardCzarPlayerName} to continue</p>
            </div>);
    }
    if (playingState === "CHOOSE_CARDS") {
        renderContents = (<div>
            <button onClick={quitGame}>Quit Game</button>
            <p>Pick {socketContext.gameState.dealtBlackCard.pick}</p>
            <h1>{socketContext.gameState.dealtBlackCard.text.split('\\n').map(str => <p>{str}</p>)}</h1>
        </div>);
    }

    return (
        renderContents
    );
}

export default Playing