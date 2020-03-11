/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable jsx-a11y/img-has-alt */

import React, { Component } from 'react';
import ShowErrorAlert from '../containers/ShowErrorAlert';
import ShowSuccessAlert from '../containers/ShowSuccessAlert';

class ImageUploader extends Component {

    constructor(props) {
        super(props);
        const initialState = {
            taggedPlayerId: null,
            image: null,
            playerIds: [],
            groupIds: [],
            gameIds: [],
            showError: null,
            showSuccess: null,
            uploading:false
        };

        if (props.group){
            initialState.groupIds = [props.group.id]
        }

        if (props.gameId){
            initialState.gameIds = [props.gameId]
        }
        if (props.group && props.gameId){
            const game = props.group.games.find(g => g.id === props.gameId);

            if (game && game.playersData && game.playersData.length >0){
                initialState.taggedPlayerId = game.playersData[0].playerId;
            }
        }

        this.state = initialState;
    }

    onReaderLoad = (e) => {
        this.setState({ image: e.target.result });
    }

    readURL = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = this.onReaderLoad;
            reader.readAsDataURL(e.target.files[0]);
        }
    }

    uploadImage = () =>{
        const { updateImage, uploadImage: remoteUploadImage, close } = this.props;
        const { image, playerIds, groupIds, gameIds } = this.state;
        const tags = {
            playerIds,
            groupIds,
            gameIds
        };
        this.setState({ uploading: true })
        remoteUploadImage(image, tags).then((imageObject)=>{
            this.setState({ showSuccess: true, uploading: false});
            updateImage(imageObject);
            setTimeout(()=>{

                close();
            },10)

        }).catch(()=>{

            this.setState({ showError: true, uploading: false});
            setTimeout(()=>{
                this.setState({ showError: null});
                close();
            },10)
        })

    };

    handleNewPlayerChange = (taggedPlayerId)=> {
        this.setState({taggedPlayerId});
    };

    removePlayerTag = (playerId) =>{
        const playerIds = [...this.state.playerIds].filter(id => id !== playerId);
        this.setState({playerIds});
    }

    tagPlayer = () =>{
        if (!this.state.taggedPlayerId){
            return;
        }
        const playerIds = [...this.state.playerIds];
        playerIds.push(this.state.taggedPlayerId);

        let taggedPlayerId = null;
        if (this.props.group){
            const availablePlayersToTag = this.props.group.players.filter(p=> !playerIds.includes(p.id));

            if (availablePlayersToTag.length > 0){
                taggedPlayerId = availablePlayersToTag[0].id;
            }
        }

        this.setState({taggedPlayerId, playerIds});
    };

    render() {

       const { showError, showSuccess, uploading} = this.state;

        const { group } = this.props;
        const { image, groupIds, gameIds, playerIds } = this.state;
        let groupName = '';
        let gameDate = '';
        let tagedPlayers = [];
        if (group && groupIds[0] === group.id) {
            groupName = group.name;
        }
        if (gameIds.length === 1){
            const game = group.games.find(g => g.id === gameIds[0]);
            gameDate = game ? game.date.AsGameName() : '';
        }
        if (group && playerIds.length > 0){
            tagedPlayers = group.players.filter(p=> playerIds.includes(p.id)).map(p=>{
                return <ul key={`_tag_${p.id}`}>{p.name} <button onClick={()=>this.removePlayerTag(p.id)} >remove tag</button></ul>
            });
        }

        let tagPlayers = <div/>;
        if (group && image) {
           const availablePlayersToTag = group.players.filter(p => !playerIds.includes(p.id)).map(p=> ({ id:p.id, name:p.name }));
           if (availablePlayersToTag.length >0) {
               if (!this.state.taggedPlayerId){
                  setImmediate(()=> this.setState({ taggedPlayerId: availablePlayersToTag[0].id }));
               }

               const comboVals = availablePlayersToTag.map(player =>
                   (
                       <option key={`_x_comboVals_${player.id}`} value={player.id}>
                           { player.name }
                       </option>
                   )
               );
               tagPlayers = (
                   <div>
                       <div>
                           add players tags:
                       </div>
                       <select name="player" value={this.state.taggedPlayerId || ''} onChange={(e)=>this.handleNewPlayerChange(e.target.value)}>
                           {comboVals}
                       </select>
                       <button className="button left-margin" disabled={!this.state.taggedPlayerId} onClick={this.tagPlayer}> Tag player</button>
               </div>);


           }



        }
        // eslint-disable-next-line
        return (
            <div id="image-uploader">

                <div>
                    <div>
                        choose image:
                    </div>
                    <div>
                        <input type="file" accept=".png,.jpg,.jpeg" id="imgInput" onChange={this.readURL}/>
                    </div>
                    <div>
                        {image && <img alt="image" id='image-uploader-preview' src={image}/>}
                    </div>
                    {!image &&  <div>
                       no image selected yet
                    </div> }
                </div>
                {groupIds.length > 0 && <div> Tagging the group ({groupName})</div>}
                {gameIds.length > 0 && <div> Tagging the game ({gameDate})</div>}
                {playerIds.length > 0 && <div> Tagging players:</div>}
                {tagedPlayers.length > 0 && <div> {tagedPlayers}</div>}
                <hr/>
                {tagPlayers}
                <div>
                    <button className="button" disabled={!image} onClick={this.uploadImage}> Upload </button>
                </div>

                <div>
                    <button className="button" onClick={this.props.close}> cancel </button>
                </div>
                { uploading && <div>please wait..</div>}
                { showError && <ShowErrorAlert message={"failed to upload image"}/>}
                { showSuccess && <ShowSuccessAlert message={"image uploaded successfully"}/>}
            </div>
        );

    }
}

export default ImageUploader;

