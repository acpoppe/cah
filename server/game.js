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
    playPhase;
    displayWhiteCardsStartingAtIndex;
    submittedCards;
    roundWinnerName;
    gameWinnerName;

    gameTicks;
    timer;
    timerRunning;

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
        this.playPhase = '';
        this.gameTicks = 0;
        this.timer = 45;
        this.displayWhiteCardsStartingAtIndex = 0;
        this.submittedCards = [];
        this.roundWinnerName = '';
        this.gameWinnerName = '';
        this.timerRunning = false;
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
        this.playPhase = '';
        this.gameTicks = 0;
        this.timer = 45;
        this.displayWhiteCardsStartingAtIndex = 0;
        this.submittedCards = [];
        this.roundWinnerName = '';
        this.gameWinnerName = '';
        this.timerRunning = true;
    }

    quitGame() {
        this.isRunning = false;
        this.isPlaying = false;
        this.hostsConnected = [];
        this.playersConnected = [];
        this.gameMode = "NOT_RUNNING";
        this.cardCzar = {uuid: ''};
        this.dealtBlackCard = {};
        this.playPhase = '';
        this.gameTicks = 0;
        this.timer = 45;
        this.displayWhiteCardsStartingAtIndex = 0;
        this.submittedCards = [];
        this.roundWinnerName = '';
        this.gameWinnerName = '';
        this.timerRunning = false;
    }

    beginPlaying() {
        this.gameMode = "PLAYING";
        this.isPlaying = true;
        this.dealTenCardsToEachPlayer();
        this.dealtBlackCard = this.blackDeck.pullTopCard();
        this.chooseCardCzar();
        this.playPhase = "ANNOUNCE_CZAR";
        
        this.updateGameStateForAllHosts();
        this.updateGameStateForAllPlayers();
    }

    chooseCardCzar() {
        let czarIndex;
        if (this.cardCzar.uuid === '') {
            czarIndex = Math.floor(Math.random() * this.playersConnected.length);
        } else {
            czarIndex = (this.findPlayerIndexByUUID(this.cardCzar.uuid) + 1) % this.playersConnected.length;
            this.findPlayerByUUID(this.cardCzar.uuid).isCardCzar = false;
        }
        this.playersConnected[czarIndex].isCardCzar = true;
        this.cardCzar = this.playersConnected[czarIndex];
    }

    gameTick() {
        if (this.gameMode === "PLAYING" && this.timerRunning) {
            this.gameTicks++;
            if (this.gameTicks % 20 === 0) {
                this.gameTicks = 0;
                this.timer--;
                if (this.timer === -1) {
                    //this.timer = 45;
                    this.timeRanOut();
                }
                this.updateGameStateForAllHosts();
            }
        }
    }

    timeRanOut() {
        const payload = {
            senderType: "server",
            command: "ServerEnding",
            data: ""
        }
        this.hostsConnected.forEach(host => {
            host.connection.send(JSON.stringify(payload))
        })
        this.playersConnected.forEach(player => {
            player.connection.send(JSON.stringify(payload))
        })
        this.quitGame();
    }

    advancePlayPhase() {
        this.gameTicks = 0;
        this.timer = 45;
        if (this.playPhase === "ANNOUNCE_CZAR") {
            this.playPhase = "CHOOSE_CARDS";
        } else if (this.playPhase === "CHOOSE_CARDS") {
            this.timer = 90;
            this.randomizeWhiteDisplayCards();
            this.playPhase = "CHOOSE_WINNER";
        } else if (this.playPhase === "CHOOSE_WINNER") {
            this.chooseCardCzar();
            this.playPhase = "SHOW_SCORE_WITH_ANNOUNCE_CZAR";
        } else if (this.playPhase === "SHOW_SCORE_WITH_ANNOUNCE_CZAR") {
            this.playPhase = "CHOOSE_CARDS";
        }
        this.updateGameStateForAllHosts();
        this.updateGameStateForAllPlayers();
    }

    randomizeWhiteDisplayCards() {
        this.playersConnected.forEach(player => {
            if (!player.isCardCzar) {
                for (let i = 0; i < player.submittedCards.length; i++) {
                    this.submittedCards.push(player.submittedCards[i]);
                }
            }
        });

        let pick = this.dealtBlackCard.pick;
        for (let i = ((this.submittedCards.length/pick) - 1); i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            for (let k = 0; k < pick; k++) {
                [this.submittedCards[(i*pick)+k], this.submittedCards[(j*pick)+k]] = [this.submittedCards[(j*pick)+k], this.submittedCards[(i*pick)+k]];
            }
        }
    }

    nextWhiteDisplayCards() {
        this.displayWhiteCardsStartingAtIndex = (this.displayWhiteCardsStartingAtIndex + this.dealtBlackCard.pick) % this.submittedCards.length;
    }

    previousWhiteDisplayCards() {
        if (this.displayWhiteCardsStartingAtIndex === 0) {
            this.displayWhiteCardsStartingAtIndex = this.submittedCards.length - this.dealtBlackCard.pick;
        } else {
            this.displayWhiteCardsStartingAtIndex = (this.displayWhiteCardsStartingAtIndex - this.dealtBlackCard.pick) % this.submittedCards.length;
        }
    }

    cardCzarChoose() {
        let cardText = this.submittedCards[this.displayWhiteCardsStartingAtIndex];

        this.playersConnected.forEach(player => {
            if (player.submittedCards.includes(cardText)) {
                player.score = player.score + 1;
                if (player.score === 10) {
                    this.gameWinnerName = player.playerName;
                    this.showFinalScore();
                    return;
                }
                this.roundWinnerName = player.playerName;
            }
            player.submittedCards = [];
        });

        this.submittedCards = [];
        this.dealTenCardsToEachPlayer();
        this.dealtBlackCard = this.blackDeck.pullTopCard();
        this.advancePlayPhase();
    }

    showFinalScore() {
        this.playPhase = "SHOW_SCORE";
        this.timerRunning = false;
        this.gameTicks = 0;
        this.timer = 0;
        this.updateGameStateForAllHosts();
        this.updateGameStateForAllPlayers();
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
            console.log(payload);
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
            players: this.playersConnected,
            playPhase: this.playPhase,
            timer: this.timer,
            submittedCards: this.submittedCards,
            whiteCardStartingIndex: this.displayWhiteCardsStartingAtIndex,
            roundWinnerName: this.roundWinnerName,
            gameWinnerName: this.gameWinnerName
        };
        return state;
    }

    generateGameStateForPlayer(player) {
        let playerCopy = {...player};
        delete playerCopy.connection;

        // do something like this when it's choosing time vvvvvvvvvv
        // if playerCopy.uuid === this.cardCzar.uuid { playerCopy.czarChoices = submittedCards }

        // do something like above, but with isCzarWaiting = true while other players choose
        return {
            player: playerCopy,
            gameMode: this.gameMode,
            playPhase: this.playPhase,
            dealtBlackCard: this.dealtBlackCard
        };
    }

    dealTenCardsToEachPlayer() {
        this.playersConnected.forEach(player => {
            this.whiteDeck.dealCardsToTen(player);
        })
    }

    playerChoseCard(playerUUID, cardText) {
        let player = this.findPlayerByUUID(playerUUID);
        player.hand = player.hand.filter(e => e !== cardText);
        player.submittedCards.push(cardText);
        let allPlayersPicked = this.checkIfAllPlayersHavePicked();
        if (!allPlayersPicked) {
            this.updateGameStateForAllPlayers();
        } else {
            this.advancePlayPhase();
        }
    }

    checkIfAllPlayersHavePicked() {
        for (let i = 0; i < this.playersConnected.length; i++) {
            if (this.playersConnected[i].submittedCards.length !== this.dealtBlackCard.pick &&
                !this.playersConnected[i].isCardCzar) {
                return false;
            }
        }
        return true;
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