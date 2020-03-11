/* eslint-disable jsx-a11y/img-redundant-alt */

import React, { Component } from 'react';
import deleteImage from '../actions/deleteImage';
import ShowErrorAlert from '../containers/ShowErrorAlert';
import ShowSuccessAlert from '../containers/ShowSuccessAlert';


class ImageData extends Component {

    constructor(props) {
        super(props);

        this.state = { showErrorOnDeleteImage: null,showSuccessDeleteImage: null };
    }

    removeImage = ()=>{
        if (confirm("Are you sure?")){
            const { id: imageId, close, provider, token} = this.props;
            deleteImage(imageId, provider, token).then(()=>{
                this.setState({ showSuccessDeleteImage: true});
                setTimeout(()=>{
                    this.setState({ showSuccessDeleteImage: null});
                    close();
                },100)
            }).catch((e)=>{
                this.setState({ showErrorOnDeleteImage: true});
                setTimeout(()=>{
                    this.setState({ showErrorOnDeleteImage: null});
                    close();
                },100)
            })
        }
    }
    render() {
        const { showErrorOnDeleteImage,showSuccessDeleteImage } = this.state;
       const { image, group, uploadedBy, playerIds, gameIds} = this.props;
       const game = group.games.find(g=>g.id === gameIds[0]);
       const gameDate = game ? game.date.AsGameName() : 'unknown';

       let players = group.players.filter(p => playerIds.includes(p.id));
       players = players.map(p=>{
           return <li key={`taged_players_${p.id}`}> {p.name}</li>
       })
       return (
            <div id="image-data">
                <div className="image-data-item">
                    <div>
                        <img alt="image" id="image-data-preview" src={image}/>
                    </div>
                    <div>
                        Uploaded by: {uploadedBy}
                    </div>
                    <hr/>
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
                            <ul> {players} </ul>

                        </div>
                        <div>
                            <button className="close-button" onClick={this.props.close} >back</button>
                        </div>
                        <div>
                            <button className="delete-image-button" onClick={this.removeImage} >DELETE IMAGE</button>
                        </div>
                    </div>


                </div>
                { showErrorOnDeleteImage && <ShowErrorAlert message={"failed to remove image"}/>}

                { showSuccessDeleteImage && <ShowSuccessAlert message={"image was removed"}/>}
            </div>
        );

    }
}

export default ImageData;

