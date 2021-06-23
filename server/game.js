import HostConnection from './hostConnection.js'
import PlayerConnection from './playerConnection.js'
import Deck from './deck.js'

class Game {
    isRunning;
    isPlaying;
    hostsConnected;
    playersConnected;
    gameMode;
    cardCzar;
    dealtBlackCard;
    blackDeck;
    whiteDeck;

    constructor() {
        this.isRunning = false;
        this.isPlaying = false;
        this.hostsConnected = [];
        this.playersConnected = [];
        this.gameMode = "NOT_RUNNING";
        this.cardCzar = {uuid: ''};
        this.dealtBlackCard = {};
        this.blackDeck = new Deck();
        this.whiteDeck = new Deck();
        this.blackDeck.loadBlackCardsFromJSON();
        this.whiteDeck.loadWhiteCardsFromJSON();
        this.blackDeck.shuffle();
        this.whiteDeck.shuffle();
    }

    newGame() {
        this.isRunning = true;
        this.hostsConnected = [];
        this.playersConnected = [];
        this.gameMode = "LOBBY";
        this.cardCzar = {uuid: ''};
        this.dealtBlackCard = {};
        this.blackDeck.loadBlackCardsFromJSON();
        this.whiteDeck.loadWhiteCardsFromJSON();
        this.blackDeck.shuffle();
        this.whiteDeck.shuffle();
    }

    quitGame() {
        this.isRunning = false;
        this.isPlaying = false;
        this.hostsConnected = [];
        this.playersConnected = [];
        this.gameMode = "NOT_RUNNING";
        this.cardCzar = {uuid: ''};
        this.dealtBlackCard = {};
    }

    beginPlaying() {
        this.gameMode = "PLAYING";
        this.isPlaying = true;
        this.dealTenCardsToEachPlayer();
        this.dealtBlackCard = this.blackDeck.pullTopCard();
        this.chooseCardCzar();
        this.updateGameStateForAllHosts();
        this.updateGameStateForAllPlayers();
    }

    chooseCardCzar() {
        let czarIndex;
        if (this.cardCzar.uuid === '') {
            czarIndex = Math.floor(Math.random() * this.playersConnected.length);
        } else {
            czarIndex = this.findPlayerIndexByUUID(cardCzar.uuid) % this.playersConnected.length;
            this.findPlayerByUUID(this.cardCzar.uuid).isCardCzar = false;
        }
        this.playersConnected[czarIndex].isCardCzar = true;
        this.cardCzar = this.playersConnected[czarIndex];
    }

    gameTick() {
        if (this.gameMode === "PLAYING") {

        }
    }

    registerNewHost(connection, uuid) {
        let shouldAdd = true;
        this.hostsConnected.forEach(host => {
            if (host.uuid === uuid) {
                host.connection = connection;
                shouldAdd = false;
            }
        })
        if (shouldAdd) {
            this.hostsConnected = [...this.hostsConnected, new HostConnection(uuid, connection)];
        }
        this.updateGameStateForAllHosts();
    }

    registerNewPlayer(connection, uuid, playerName) {
        let shouldAdd = true;
        let sameName = false;
        let newPlayer = {};
        this.playersConnected.forEach(player => {
            if (player.uuid === uuid) {
                player.connection = connection;
                newPlayer = player;
                shouldAdd = false;
            }
        })
        if (shouldAdd) {
            this.playersConnected.forEach(player => {
                if (player.playerName === playerName) {
                    sameName = true;
                }
            })
        }
        if (sameName) {
            return "SameName";
        } else if (shouldAdd) {
            newPlayer = new PlayerConnection(uuid, connection, playerName);
            this.playersConnected = [...this.playersConnected, newPlayer];
        }
        if (this.gameMode === "PLAYING") {
            this.whiteDeck.dealCardsToTen(player);
        }
        this.updateGameStateForAllHosts();
        this.updateGameStateForPlayer(newPlayer);
    }

    updateGameStateForAllHosts() {
        this.hostsConnected.forEach(host => {
            const payload = {
                senderType: "server",
                command: "UpdateHostStatus",
                data: this.generateGameStateForHost()
            };
            // readyState is an enum where 1 means OPEN
            if (host.connection.readyState === 1) {
                host.connection.send(JSON.stringify(payload));
            }
        })
    }

    updateGameStateForPlayer(player) {
        const payload = {
            senderType: "server",
            command: "UpdatePlayerStatus",
            data: this.generateGameStateForPlayer(player)
        };
        // readyState is an enum where 1 means OPEN
        if (player.connection.readyState === 1) {
            player.connection.send(JSON.stringify(payload));
        }
    }

    updateGameStateForAllPlayers() {
        this.playersConnected.forEach(player => {
            this.updateGameStateForPlayer(player)
        })
    }

    generateGameStateForHost() {
        let state = {
            gameMode: this.gameMode,
            cardCzarPlayerName: this.cardCzar.playerName,
            dealtBlackCard: this.dealtBlackCard,
            players: this.playersConnected
        };
        return state;
    }

    generateGameStateForPlayer(player) {
        let playerCopy = {...player};
        delete playerCopy.connection;

        // do something like this when it's choosing time vvvvvvvvvv
        // if playerCopy.uuid === this.cardCzar.uuid { playerCopy.czarChoices = submittedCards }

        // do something like above, but with isCzarWaiting = true while other players choose
        return playerCopy;
    }

    dealTenCardsToEachPlayer() {
        this.playersConnected.forEach(player => {
            this.whiteDeck.dealCardsToTen(player);
        })
    }

    findHostByUUID(uuid) {
        for (let i = 0; i < this.hostsConnected.length; i++) {
            if (this.hostsConnected[i].uuid === uuid) {
                return this.hostsConnected[i];
            }
        }
        return null;
    }

    findPlayerByUUID(uuid) {
        for (let i = 0; i < this.playersConnected.length; i++) {
            if (this.playersConnected[i].uuid === uuid) {
                return this.playersConnected[i];
            }
        }
        return null;
    }

    findPlayerIndexByUUID(uuid) {
        for (let i = 0; i < this.playersConnected.length; i++) {
            if (this.playersConnected[i].uuid === uuid) {
                return i;
            }
        }
        return null;
    }
}

export default Game