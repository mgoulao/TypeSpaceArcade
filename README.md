# TypeSpaceArcade

A multiplayer P2P space arcade game where you fire against the enemies by typing words.

## Communication Protocol

The communication between peers is very basic and unreliable. Basically, peers are connected in a mesh net and in game when a peer performs an action he sends a message to the other peers saying that he just performed that same action. This means that every single peer has a different game state and major communication delays can be catastrophic. Example: Some peer dodges a rock by moving left and the some of the other peers only received the message, saying that he moved left, after the sender ship collide against the rock.

I would like to change this communication protocol but don't have time and I need refactor the project first, especially the ```p2p.js```.

## Built With

* [Phaser3](https://phaser.io/)
* [Peerjs](https://peerjs.com/)
* [Webpack](https://webpack.js.org/)
* [an-array-of-english-words](https://github.com/words/an-array-of-english-words)

## Contributions

Every contribution is welcome 🙂