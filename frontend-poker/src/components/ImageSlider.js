import React, { Component } from 'react';

class ImageSlider extends Component {
    constructor(props) {
        super(props);
        this.state = {index: 0};

        const {group, gameId, playerId} = props;
        const {images, games, players} = group;

        const relevantImages = images.filter(imageObject => {
            if (gameId) {
                return imageObject.gameIds.includes(gameId);
            }
            if (playerId) {
                return imageObject.playerIds.includes(playerId);
            }
            return true;
        });
        this.items = relevantImages.map(imageObject => {
            const taggedGame = games.find(game => imageObject.gameIds.includes(game.id));

            const date = taggedGame ? taggedGame.date.AsGameName() : '';

            const taggedPlayers = players.filter(player => imageObject.playerIds.includes(player.id)).map(player => player.name).join(',');
            return {
                original: imageObject.image,
                thumbnail: imageObject.image,
                date,
                sizes: "10vw",
                taggedPlayers
            }
        });


        this.ref = setInterval(() => {
            let index = this.state.index + 1;
            if (index >= relevantImages.length) {
                index = 0;
            }
            this.setState({index});
        }, 5000);
    }


    render() {
        const { gameId, playerId } = this.props;

        if (this.items.length === 0){
            console.log('no images found for this game/player');
            return <div/>
        }

        return (
            <div className="image-slider">
                {playerId && <div>player images</div>}
                {gameId && <div>game images</div>}

                <img src={this.items[this.state.index].original}/>
                <div>
                    { this.items[this.state.index].date  }
                </div>

                <div>
                    in the picture: { this.items[this.state.index].taggedPlayers }
                </div>
            </div>
        )
    }
}
export default ImageSlider;
