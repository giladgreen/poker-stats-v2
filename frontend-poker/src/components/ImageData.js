/* eslint-disable jsx-a11y/img-redundant-alt */

import React, { Component } from 'react';
import ShowErrorAlert from '../containers/ShowErrorAlert';
import ShowSuccessAlert from '../containers/ShowSuccessAlert';

class ImageData extends Component {

    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {

       const { image, group, uploadedBy, playerIds, gameIds, groupIds} = this.props;
       const game = group.games.find(g=>g.id === gameIds[0]);
       const gameDate = game ? game.date.AsGameName() : 'unknown';
       const players = group.players.filter(p => groupIds.includes(p.id)).map(p=>{
           return <ul> {p.name}</ul>
       })
       return (
            <div id="image-data">
                <div>
                    <img alt="image" id="image-data-preview" src={image}/>
                </div>
                <div>
                    Uploaded by: {uploadedBy}
                </div>

                <div>
                    <b><u>Tags:</u></b>
                    <div>
                        Group: {group.name}
                    </div>
                    <div>
                        Game: {gameDate}
                    </div>
                    <div>
                        Players:
                    </div>
                    <div>
                        {players}

                    </div>
                </div>


            </div>
        );

    }
}

export default ImageData;

