import { LightningElement, track, api } from 'lwc';

export default class Waiting extends LightningElement {
    socket;
    @track players = [];
    @api isHost;

    es;

    connectedCallback() {
        this.es = new EventSource('/api/stream');

        this.es.onmessage = (ev) => {
            let event = JSON.parse(ev.data);
            if (event.type === 'newplayer') {
                this.players.push(event.value);
            } else if (event.type === 'game' && !this.isHost) {
                const e = new CustomEvent('stagechange', {
                    detail: { stage: 'GAME', gameObj: event.value }
                });
                this.dispatchEvent(e);
            }
        };
    }

    disconnectedCallback() {
        this.es.close();
    }

    beginGame() {
        fetch('/api/startgame')
            .then((response) => response.json())
            .then((data) => {
                if (data) {
                    const ev = new CustomEvent('stagechange', {
                        detail: { stage: 'GAME', gameObj: data }
                    });
                    this.dispatchEvent(ev);
                }
            }).catch(() => {
                // eslint-disable-next-line no-alert
                alert('Unable to start game');
            });
    }

    get sessionid() {
        return sessionStorage.getItem('session_id');
    }
}
