class PlayerConnection {
    uuid = ''
    connection = null
    hand = []
    score = 0
    submittedCards = []

    constructor(uuid, connection) {
        this.uuid = uuid
        this.connection = connection
        // Deal hand
    }
}

export default PlayerConnection