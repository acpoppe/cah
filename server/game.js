import HostConnection from './hostConnection.js'
import PlayerConnection from './playerConnection.js'

class Game {
    isRunning
    hostsConnected
    playersConnected
    gameMode
    cardCzar
    dealtBlackCard

    constructor() {
        this.isRunning = false
        this.hostsConnected = []
        this.playersConnected = []
        this.gameMode = "NOT_RUNNING"
        this.cardCzar = {uuid: ''}
        this.dealtBlackCard = {}
    }

    newGame() {
        this.isRunning = true
        this.hostsConnected = []
        this.playersConnected = []
        this.gameMode = "LOBBY"
        this.cardCzar = {uuid: ''}
        this.dealtBlackCard = {}
    }

    quitGame() {
        this.isRunning = false
        this.hostsConnected = []
        this.playersConnected = []
        this.gameMode = "NOT_RUNNING"
        this.cardCzar = {uuid: ''}
        this.dealtBlackCard = {}
    }

    gameTick() {
        //Advance whatever needs to be ticked
    }

    registerNewHost(connection, uuid) {
        let shouldAdd = true
        this.hostsConnected.forEach(host => {
            if (host.uuid === uuid) {
                host.connection = connection
                shouldAdd = false
            }
        })
        if (shouldAdd) {
            this.hostsConnected = [...this.hostsConnected, new HostConnection(uuid, connection)]
        }
        this.updateGameStateForAllHosts()
    }

    updateGameStateForAllHosts() {
        this.hostsConnected.forEach(host => {
            const payload = {
                senderType: "server",
                command: "UpdateHostStatus",
                data: this.generateGameStateForHost()
            }
            host.connection.send(JSON.stringify(payload))
        })
    }

    generateGameStateForHost() {
        let state = {
            GameMode: this.gameMode,
            cardCzarUUID: this.cardCzar.uuid,
            dealtBlackCard: this.dealtBlackCard,
            players: this.playersConnected
        }
        return state
    }

    generateGameStateForPlayer(player) {
        return ''
    }
}

export default Game