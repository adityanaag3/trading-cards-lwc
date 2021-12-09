import { LightningElement, api } from 'lwc';
import { peopleList } from './people';

export default class Card extends LightningElement {
    @api index;
    @api revealed = false;

    get person() {
        return peopleList[this.index];
    }
}
