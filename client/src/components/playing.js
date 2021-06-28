import { useState, useContext, useEffect } from "react"
import { WebSocketContext } from "../contexts/WebSocket.js"

function Playing() {

    const [playingPhase, setPlayingPhase] = useState('');

    const socketContext = useContext(WebSocketContext);

    useEffect(() => {
        updateGameStateFromContext()
    }, [socketContext.gameState]);

    function updateGameStateFromContext() {
        setPlayingPhase(socketContext.gameState.playPhase);
    }

    function advanceGamePhase() {
        socketContext.advancePlayPhase();
    }

    let renderContents;

    if (playingPhase === '') {
        renderContents = <div><p>No play phase found</p></div>
    }
    if (playingPhase === "ANNOUNCE_CZAR" && socketContext.gameState.player.isCardCzar) {
        renderContents = (<div>
            <p>You are the Card Czar</p>
            <button onClick={advanceGamePhase}>Continue</button>
            </div>);
    } else if (playingPhase === "ANNOUNCE_CZAR" && !socketContext.gameState.player.isCardCzar) {
        renderContents = (<div>
            <p>Waiting for the Card Czar to continue...</p>
            </div>);
    }
    if (playingPhase === "CHOOSE_CARDS" && socketContext.gameState.dealtBlackCard.pick === 1) {
        renderContents = (<div>
            <p>Choose a card</p>
            {socketContext.gameState.player.hand.map( card => {
                return (<div key={card}>
                <button>
                    {card.replace('<br/>', "\n")}
                </button></div>);
            })}
        </div>);
    } else if (playingPhase === "CHOOSE_CARDS" && socketContext.gameState.dealtBlackCard.pick > 1) {
        renderContents = (<div>
            <p>Choose {socketContext.gameState.dealtBlackCard.pick} cards</p>
            {socketContext.gameState.player.hand.map( card => {
                return (<div key={card}>
                <button>
                    {card.replace('<br/>', "\n")}
                </button></div>);
            })}
        </div>);
    }

    return (
        renderContents
    );
}

export default Playing