import { LightningElement, api, track } from 'lwc';
import { peopleList } from '../card/people';

export default class Game extends LightningElement {
    @api isHost;

    @api get gameObj() {
        return this.allCards;
    }

    set gameObj(val) {
        this.allCards = val;
    }

    player_name;
    es;

    allCards = [];
    @track dealtCards = [];
    metric;
    mycards = [];

    metricList = [
        {
            key: 'yrs',
            value: 'Years in Ecosystem'
        },
        {
            key: 'certs',
            value: 'Certifications'
        },
        {
            key: 'badges',
            value: 'Trailhead Badges'
        },
        {
            key: 'points',
            value: 'Trailhead Points'
        },
        {
            key: 'superbadges',
            value: 'Trailhead Superbadges'
        },
        {
            key: 'followers',
            value: 'Twitter Followers'
        }
    ];

    revealed = false;
    myturn = false;

    dealDisabled = false;

    connectedCallback() {
        this.player_name = sessionStorage.getItem('player_name');

        this.es = new EventSource('/api/stream');

        this.es.onmessage = (ev) => {
            let event = JSON.parse(ev.data);
            if (event.type === 'carddealt') {
                if (event.value.metric) {
                    this.metric = event.value.metric;
                }
                this.dealtCards.push({
                    player_name: event.value.player_name,
                    card: event.value.card,
                    class: 'slds-col',
                    metric: peopleList[event.value.card][this.metric]
                });
            }
            if (event.type === 'revealmetrics') {
                this.revealed = true;
                let winnerIndex = this.dealtCards.findIndex(
                    (x) => x.player_name === event.winner.player_name
                );
                this.dealtCards[winnerIndex].class = 'slds-col winner';
            }
            if (event.type === 'nextturn') {
                this.revealed = false;
                this.myturn = false;
                this.dealtCards = [];
                this.metric = undefined;
                this.dealDisabled = false;
                this.allCards = event.value;
                this.createObjects();
            }
        };

        this.createObjects();
    }

    createObjects() {
        if (!this.isHost) {
            const mygameobj = this.gameObj.find(
                (obj) => obj.player_name === this.player_name
            );
            this.mycards = mygameobj.cards;
            this.myturn = mygameobj.turn;
        }
    }

    get numberOfCardsLeft() {
        return this.mycards ? this.mycards.length : 0;
    }

    get cardsLeft() {
        return this.mycards?.length > 0 ? true : false;
    }

    get myCurrentCard() {
        return this.mycards?.length > 0 ? this.mycards[0] : -1;
    }

    get myCurrentCardRevealed() {
        return this.myturn || this.revealed;
    }

    get canplayerdeal() {
        return this.myturn || (this.metric && !this.myturn);
    }

    disconnectedCallback() {
        this.es.close();
    }

    dealCard() {
        this.dealDisabled = true;
        let fetchUrl =
            '/api/dealcard?player_name=' +
            encodeURIComponent(this.player_name) +
            '&card=' +
            this.myCurrentCard;
        if (this.myturn) {
            const selectedMetric = this.template.querySelector('.metric').value;
            fetchUrl += '&metric=' + encodeURIComponent(selectedMetric);
        }
        fetch(fetchUrl)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
            });
    }

    reveal() {
        fetch(
            '/api/reveal?dealt_cards=' +
                encodeURIComponent(JSON.stringify(this.dealtCards)) +
                '&metric=' +
                encodeURIComponent(this.metric)
        )
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
            });
    }

    nextturn() {
        fetch('/api/nextturn')
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
            });
    }

    get gameClass() {
        return this.isHost ? 'slds-col' : 'slds-col slds-size_3-of-4';
    }

    get zoomClass() {
        return this.isHost ? 'slds-grid' : 'slds-grid cards-dealt';
    }

    get detailedMetric() {
        return this.metric
            ? this.metricList.find((x) => x.key === this.metric).value
            : '';
    }
}
