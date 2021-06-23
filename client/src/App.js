import './App.css'
import WebSocketProvider from './contexts/WebSocket.js'
import Game from './components/game.js'

function App() {
  return (
    <WebSocketProvider>
      <div className="App">
        <header className="App-header">
          <Game />
        </header>
      </div>
    </WebSocketProvider>
  );
}

export default App;
