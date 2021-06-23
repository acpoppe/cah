class PlayerConnection {
    uuid = ''
    connection = null
    playerName = ''
    hand = []
    score = 0
    submittedCards = []
    isCardCzar = false

    constructor(uuid, connection, playerName) {
        this.uuid = uuid
        this.connection = connection
        this.playerName = playerName
    }
}

export default PlayerConnection