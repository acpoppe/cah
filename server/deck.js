import fs from 'fs'

class Deck {

    cards;

    constructor() {
        this.cards = [];
    }

    loadBlackCardsFromJSON() {
        this.cards = JSON.parse(fs.readFileSync('decks/geekperiodredbluegreen.json', 'utf8')).black;
    }

    loadWhiteCardsFromJSON() {
        this.cards = JSON.parse(fs.readFileSync('decks/geekperiodredbluegreen.json', 'utf8')).white;
    }

    pullTopCard() {
        return this.cards.shift();
    }

    dealCards(toPlayer, numOfCards=1) {
        toPlayer.hand.push(this.cards.shift());
    }
    
    dealCardsToTen(toPlayer) {
        if (toPlayer.hand.length < 10) {
            this.dealCards(toPlayer);
            this.dealCardsToTen(toPlayer);
        }
    }

    addCardToBottomOfDeck(card) {
        this.cards.push(card);
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
}

export default Deck