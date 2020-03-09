import React, { Component } from 'react';

class ImageUploader extends Component {

    constructor(props) {
        super(props);
        const initialState = {
            taggedPlayerId: null,
            image: null,
            playerIds: [],
            groupIds: [],
            gameIds: []
        };

        if (props.Group){
            initialState.groupIds = [props.Group.id]
        }

        if (props.gameId){
            initialState.gameIds = [props.gameId]
        }
        if (props.Group && props.gameId){
            const game = props.Group.games.find(g => g.id === props.gameId);

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
        const { image, playerIds, groupIds, gameIds } = this.state;
        const tags = {
            playerIds,
            groupIds,
            gameIds
        };

        this.props.uploadImage(image, tags);
        this.props.close();
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
        if (this.props.Group){
            const availablePlayersToTag = this.props.Group.players.filter(p=> !playerIds.includes(p.id));

            if (availablePlayersToTag.length > 0){
                taggedPlayerId = availablePlayersToTag[0].id;
            }
        }

        this.setState({taggedPlayerId, playerIds});
    };


    render() {
        const { Group } = this.props;
        const { image, groupIds, gameIds, playerIds } = this.state;
        let groupName = '';
        let gameDate = '';
        let tagedPlayers = [];
        if (Group && groupIds[0] === Group.id) {
            groupName = Group.name;
        }
        if (gameIds.length === 1){
            const game = Group.games.find(g => g.id === gameIds[0]);
            gameDate = game ? game.date.AsGameName() : '';
        }
        if (Group && playerIds.length > 0){
            tagedPlayers = Group.players.filter(p=> playerIds.includes(p.id)).map(p=>{
                return <ul>{p.name} <button onClick={()=>this.removePlayerTag(p.id)} >remove tag</button></ul>
            });
        }

        let tagPlayers = <div/>;
        if (Group && image) {
           const availablePlayersToTag = Group.players.filter(p => !playerIds.includes(p.id)).map(p=> ({ id:p.id, name:p.name }));
           if (availablePlayersToTag.length >0) {
               const comboVals = availablePlayersToTag.map(player =>
                   (
                       <option key={`__comboVals_${player.id}`} value={player.id}>
                           { player.name }
                       </option>
                   )
               );
               tagPlayers = (
                   <div>
                       <div>
                           add players tags:
                       </div>
                       <select name="player" value={this.state.taggedPlayerId} onChange={(e)=>this.handleNewPlayerChange(e.target.value)}>
                           {comboVals}
                       </select>
                       <button className="button left-margin" disabled={!this.state.taggedPlayerId} onClick={this.tagPlayer}> Tag player</button>
               </div>);


           }



        }

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
                        {image && <img id='image-uploader-preview' src={image} alt='preview image'/>}
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
            </div>
        );

    }
}

export default ImageUploader;

