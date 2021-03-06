import { useState, useContext, useEffect } from "react"
import { WebSocketContext } from "../contexts/WebSocket.js"

function Playing() {

    const [playingState, setPlayingState] = useState('');
    const [cardCzarPlayerName, setCardCzarPlayerName] = useState('');

    const socketContext = useContext(WebSocketContext);

    useEffect(() => {
        updateGameStateFromContext();
    }, [socketContext.gameState]);

    function updateGameStateFromContext() {
        setPlayingState(socketContext.gameState.playPhase);
        setCardCzarPlayerName(socketContext.gameState.cardCzarPlayerName);
    }

    function quitGame() {
        socketContext.quitGame();
    }

    let renderContents = <div><p>We got an issue</p></div>;
    
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
    if (playingState === "CHOOSE_WINNER") {
        renderContents = (<div>
            <button onClick={quitGame}>Quit Game</button>
            <p>Pick {socketContext.gameState.dealtBlackCard.pick}</p>
            <h1>{socketContext.gameState.dealtBlackCard.text.split('\\n').map(str => <p>{str}</p>)}</h1>
            {socketContext.gameState.submittedCards.map( (card, index) => {
                if (index === socketContext.gameState.whiteCardStartingIndex ||
                    (index < socketContext.gameState.whiteCardStartingIndex + socketContext.gameState.dealtBlackCard.pick &&
                    index > socketContext.gameState.whiteCardStartingIndex)) {
                        return (<div key={index}>
                            {card.replace('<br/>', "\n")}
                            <br/>
                            </div>);
                } else {
                    return null;
                }
            })}
        </div>);
    }

    if (playingState === "SHOW_SCORE_WITH_ANNOUNCE_CZAR") {
        renderContents = (<div>
            <button onClick={quitGame}>Quit Game</button>
            <h1>{socketContext.gameState.roundWinnerName} Wins the Round!</h1>
            <h1>{socketContext.gameState.cardCzarPlayerName} is the next Czar</h1>
            <table>
                <th>Player</th>
                <th>Score</th>
                {socketContext.gameState.players.map(player => {
                    return (<tr>
                        <td>{player.playerName}</td>
                        <td>{player.score}</td>
                    </tr>)
                })}
            </table>
        </div>);
    }

    if (playingState === "SHOW_SCORE") {
        renderContents = (<div>
            <button onClick={quitGame}>Quit Game</button>
            <h1>{socketContext.gameState.gameWinnerName} Wins the Game!</h1>
            <h1>Congratulations!</h1>
            <table>
                <th>Player</th>
                <th>Score</th>
                {socketContext.gameState.players.map(player => {
                    return (<tr>
                        <td>{player.playerName}</td>
                        <td>{player.score}</td>
                    </tr>)
                })}
            </table>
        </div>);
    }

    return (
        renderContents
    );
}

export default Playing