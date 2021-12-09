# Trading Cards game built using Lightning Web Components

Trading Cards is a multi-player game where each player gets a set of trading cards containing acheivements of Salesforce MVPs as of 7th December 2021. Each round, every player deals a card, and the first player to deal the card decides the metric. The player whose card has the highest metric wins, and gets all the cards from the round. This continues till there is only 1 player remaining. 

## How to play?

1. Navigate to [this Heroku App](https://trading-cards-lwc.herokuapp.com/).
1. The host can click **Start a new game**. The host then has to share the game code with the participants
1. The participants can join the game by entering their name, game code, and by clicking **Join game**.
1. The first player whose turn it is to play, needs to select a metric and deals a card.
1. The remaining players can then deal their card. 
1. The host then reveals the metrics using the **Reveal Metrics** button. (Until the host reveals the metrics, only the player who selects the metric can see the metrics on the card). Once the metrics are revealed, the winner of the round is shown as well.
1. The host then clicks on **Next Turn** which gives the winner all the cards of the current round, and starts a new round. The winner of the previous round now gets to select a metric and deal the first card.
1. The host can see a table at the bottom with the list of players and the number of cards they hold.