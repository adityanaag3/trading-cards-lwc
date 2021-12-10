import { LightningElement } from 'lwc';

export default class App extends LightningElement {
    currentStage = 'SPLASH';
    gameObj;
    isHost = false;

    get isSplash() {
        return this.currentStage === 'SPLASH';
    }

    get isWaiting() {
        return this.currentStage === 'WAITING';
    }

    get isGame() {
        return this.currentStage === 'GAME';
    }

    handleStageChange(event) {
        this.currentStage = event.detail.stage;
        if (event.detail.gameObj) {
            this.gameObj = event.detail.gameObj;
        }
        if (event.detail.host) {
            this.isHost = true;
        }
    }

    connectedCallback(){
        let player_name = sessionStorage.getItem('player_name');
        let sessionId = sessionStorage.getItem('session_id');
        if(player_name || sessionId){
            fetch('/api/getplayers')
                .then((response) => response.json())
                .then((data) => {
                    if (data) {
                        this.gameObj = data;
                        this.currentStage = 'GAME';
                        if(sessionId){
                            this.isHost = true;
                        }
                    }
                }).catch(() => {
                    // eslint-disable-next-line no-alert
                    alert('Unable to start game');
                });
        }

        

    }
}
