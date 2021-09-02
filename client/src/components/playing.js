import { useState, useContext, useEffect, createRef } from "react"
import { WebSocketContext } from "../contexts/WebSocket.js"

function Playing() {

    const [playingPhase, setPlayingPhase] = useState('');

    const socketContext = useContext(WebSocketContext);

    const cardButton = createRef();

    useEffect(() => {
        updateGameStateFromContext()
    }, [socketContext.gameState]);

    function updateGameStateFromContext() {
        setPlayingPhase(socketContext.gameState.playPhase);
    }

    function advanceGamePhase() {
        socketContext.advancePlayPhase();
    }

    function sendCardChoice(event) {
        socketContext.sendCardChoice(event.target.innerText);
    }

    function nextWhiteDisplayCards() {
        socketContext.nextWhiteDisplayCards();
    }

    function previousWhiteDisplayCards() {
        socketContext.previousWhiteDisplayCards();
    }

    function cardCzarChoose() {
        socketContext.cardCzarChoose();
    }

    let renderContents = <div><p>We got an issue</p></div>;

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

    if (playingPhase === "CHOOSE_CARDS" && socketContext.gameState.player.isCardCzar) {
        renderContents = (<div>
            <h1>You are the Card Czar</h1>
            <h1>Waiting for other players to choose...</h1>
        </div>);
    } else if (playingPhase === "CHOOSE_CARDS" && socketContext.gameState.dealtBlackCard.pick === socketContext.gameState.player.submittedCards.length) {
        renderContents = (<div>
            <h1>Waiting for other players to choose...</h1>
        </div>);
    } else if (playingPhase === "CHOOSE_CARDS" && socketContext.gameState.dealtBlackCard.pick === 1) {
        renderContents = (<div>
            <p>Choose a card</p>
            {socketContext.gameState.player.hand.map( card => {
                return (<div key={card}>
                <button ref={cardButton} onClick={sendCardChoice}>
                    {card.replace('<br/>', "\n")}
                </button></div>);
            })}
        </div>);
    } else if (playingPhase === "CHOOSE_CARDS" && socketContext.gameState.dealtBlackCard.pick > 1) {
        renderContents = (<div>
            <p>Choose {socketContext.gameState.dealtBlackCard.pick} cards</p>
            {socketContext.gameState.player.hand.map( card => {
                return (<div key={card}>
                <button ref={cardButton} onClick={sendCardChoice}>
                    {card.replace('<br/>', "\n")}
                </button></div>);
            })}
        </div>);
    }

    if (playingPhase === "CHOOSE_WINNER" && !socketContext.gameState.player.isCardCzar) {
        renderContents = (<div>
            <h1>Waiting for Czar to choose a winner...</h1>
        </div>);
    } else if (playingPhase === "CHOOSE_WINNER" && socketContext.gameState.player.isCardCzar) {
        renderContents = (<div>
            <h1>Choose your favorite!</h1>
            <button onClick={previousWhiteDisplayCards}>Previous Card</button>
            <button onClick={nextWhiteDisplayCards}>Next Card</button>
            <br/>
            <button onClick={cardCzarChoose}>Choose This Card!</button>
        </div>);
    }

    if (playingPhase === "SHOW_SCORE_WITH_ANNOUNCE_CZAR" && socketContext.gameState.player.isCardCzar) {
        renderContents = (<div>
            <p>You are the Card Czar</p>
            <button onClick={advanceGamePhase}>Continue</button>
            </div>);
    } else if (playingPhase === "SHOW_SCORE_WITH_ANNOUNCE_CZAR" && !socketContext.gameState.player.isCardCzar) {
        renderContents = (<div>
            <p>Waiting for the Card Czar to continue...</p>
            </div>);
    }

    if (playingPhase === "SHOW_SCORE") {
        renderContents = (<div>
            <h1>Game Over!</h1>
            <p>Well played!</p>
            </div>);
    }

    return (
        renderContents
    );
}

export default Playing