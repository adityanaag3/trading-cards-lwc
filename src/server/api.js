// Simple Express server setup to serve for local testing/dev API server
const compression = require('compression');
const helmet = require('helmet');
const express = require('express');
const path = require('path');

const app = express();
app.use(helmet());
app.use(compression());

const SSE = require('express-sse');

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3002;

let gameCode;
let players = [];
let winner;

let sse = new SSE();

const TOTAL_CARDS = 16;

function randomString() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const DIST_DIR = './dist';
app.use(express.static(DIST_DIR));
app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.resolve(DIST_DIR, 'index.html'));
});

app.get('/api/stream', sse.init);

// Keep SSE Connection Alive
const HEARTBEAT_INTERVAL = process.env.HEARTBEAT_INTERVAL || 30 * 1000; // 30 seconds
const heartBeat = () => sse.send(':ping');
setInterval(heartBeat, HEARTBEAT_INTERVAL);

app.get('/api/createsession', (req, res) => {
    players = [];
    gameCode = randomString();
    res.json({ sessionId: gameCode });
});

app.get('/api/joinsession', (req, res) => {
    const { id, player_name } = req.query;

    if (gameCode === id && !players.includes(player_name)) {
        players.push({ player_name });
        sse.send({ type: 'newplayer', value: player_name });
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.get('/api/startgame', (req, res) => {
    let cardsPerPerson =
        players.length > 0 ? Math.round(TOTAL_CARDS / players.length) : 1;
    let cardNumbers = Array(TOTAL_CARDS)
        .fill()
        .map((x, i) => i);

    for (let i = 0; i < players.length; i++) {
        const selectedCards = [];
        for (let j = 0; j < cardsPerPerson; ) {
            const random = Math.floor(Math.random() * cardNumbers.length);
            if (selectedCards.indexOf(cardNumbers[random]) !== -1) {
                continue;
            }
            selectedCards.push(cardNumbers[random]);
            cardNumbers.splice(random, 1);
            j++;
        }
        players[i].cards = selectedCards;
        players[i].cardCount = players[i].cards.length;
    }

    players[0].turn = true;

    sse.send({ type: 'game', value: players });
    res.json(players);
});

app.get('/api/dealcard', (req, res) => {
    sse.send({ type: 'carddealt', value: req.query });
    res.json({ success: true });
});

app.get('/api/reveal', (req, res) => {
    let { dealt_cards } = req.query;
    let dealt_cards_json = JSON.parse(dealt_cards);

    winner = dealt_cards_json.reduce(function (a, b) {
        return a.metric >= b.metric ? a : b;
    }, 1);

    players.forEach((element) => {
        if (element.player_name === winner.player_name) {
            dealt_cards_json.forEach((el) => {
                if (el.player_name !== winner.player_name) {
                    element.cards.push(el.card);
                }
            });
            element.cards.push(element.cards.shift());
            element.cardCount = element.cards.length;
        } else {
            element.cards.shift();
            element.cardCount = element.cards.length;
        }
    });

    sse.send({ type: 'revealmetrics', value: players, winner });
    res.json(players);
});

app.get('/api/nextturn', (req, res) => {
    players.forEach((element) => {
        // eslint-disable-next-line eqeqeq
        if (element.player_name == winner.player_name) {
            element.turn = true;
        } else {
            element.turn = false;
        }
    });

    sse.send({ type: 'nextturn', value: players });
    res.json(players);
});

app.get('/api/getplayers', (req, res) => {
    res.json(players);
});

app.listen(PORT, () =>
    console.log(
        `✅  API Server started: http://${HOST}:${PORT}/api/v1/endpoint`
    )
);
