/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable jsx-a11y/img-has-alt */
import React, { Component } from 'react';
import createPlayer from "../actions/createPlayer";
import updatePlayer from "../actions/updatePlayer";
import deletePlayer from "../actions/deletePlayer";
import PlayerSummary from "./PlayerSummary";

import CONSTS from '../CONSTS';

const { ANON_URL } = CONSTS;

const baseUrl = window.location.origin === 'http://localhost:3000' ? 'http://www.poker-stats.com' : window.location.origin;
const FULL_ANON_URL = `${baseUrl}/${ANON_URL}`;

class PlayersTab extends Component {

    constructor(props) {
        super(props);
        const {players} = props.group;

        this.PLAYERS = (players || []).sort((a,b)=> a.gamesCount > b.gamesCount ? -1 : 1).map((player,index) => {
            const style = {
                backgroundImage: `url(${player.imageUrl || FULL_ANON_URL})`,
                borderRadiusTop: '50px',
            };

            return (
                <div key={`${index}_${player.id}`} className={`player-item-div`}  onClick={()=>this.showPlayerData(player)}>
                    <div className="player-item-div-inner" style={style}>
                        <div><b>{player.name}</b></div>
                        {  player.gamesCount ?
                            (<div>
                                <div>  {player.gamesCount} games</div>
                                <div>  {player.balance}₪ </div>
                            </div>) :
                            <div>no games yet</div> }
                    </div>
                </div>
            );

        });


        this.state = { newPlayer: null, editPlayer: null, playerSummary: null };
    }

    showPlayerData = (player) =>{
        this.setState({ playerSummary: player })
    }

    showCreatePlayer = () =>{
        this.setState({ newPlayer: {  name: '', email: ''} });
    }

    onPlayerEditClick = (editPlayer) =>{
        this.setState({ editPlayer });
    }

    onPlayerDeleteClick = async(playerId) =>{
        if (confirm("Are you sure?")){
            try{
                await deletePlayer(this.props.group.id, playerId, this.props.provider, this.props.token);
                this.props.updatePlayerRemoved(playerId);
                this.setState({playerSummary:null})
            }catch(error){
                console.error('deletePlayerById error',error);
            }
        }
    }

    createNewPlayer = () => {
        const { group, provider, token, updatePlayerData } = this.props;
        const player = {
            name: this.state.newPlayer.name,
            email: this.state.newPlayer.email,
        }
        console.log('calling create player with body:', player);
        createPlayer(group.id, player, provider, token).then((player)=>{
            this.setState({ newPlayer: null, editPlayer: null,playerSummary:null});
            updatePlayerData(player);
        });
    }

    getNewPlayerSection = () => {
        const legal = this.state.newPlayer.name && this.state.newPlayer.name.length > 0;

        return (<div id="new-player-form">
            <h2> Create a new player. </h2>

            <div className="new-player-section">
                name:
                <input  type="text" id="newGameExtra" className="bordered-input left-margin left-pad" value={this.state.newPlayer.name} onChange={(event)=>{
                    const newPlayer = {...this.state.newPlayer};
                    newPlayer.name = event.target.value;
                    this.setState({newPlayer})
                }}/>
            </div>
            <div className="new-player-section">
                email:
                <input  type="text" id="newGameExtra" className="bordered-input left-margin left-pad" value={this.state.newPlayer.email}onChange={(event)=>{
                    const newPlayer = {...this.state.newPlayer};
                    newPlayer.email = event.target.value;
                    this.setState({newPlayer})
                }}/>
            </div>
            <div className="new-player-section">

                <button className="button left-margin"  onClick={()=>this.setState({newPlayer: null})}> Cancel </button>
                <button className="button left-margin"  onClick={this.createNewPlayer} disabled={!legal}> Create </button>
            </div>


        </div>);
    };

    saveEditedPlayer = () =>{
        const { group, provider, token, updatePlayerData } = this.props;
        const player = {
            id: this.state.editPlayer.id,
            name: this.state.editPlayer.name,
            email: this.state.editPlayer.email,
            imageUrl: this.state.editPlayer.imageUrl,
        }
        console.log('saveEditedPlayer player', player)
        updatePlayer(group.id, player.id, player, provider, token).then((p)=>{
            this.setState({ newPlayer: null, editPlayer: null,playerSummary:null});
            updatePlayerData(p);
        });
    }

    getPlayerEdit = () =>{
        return (
            <div className="playerEditForm">
                <div className="playerSummaryHeader">
                    <div>
                        name: {this.state.editPlayer.name}
                        <input  type="text" id="playerName" className="bordered-input left-margin left-pad" value={this.state.editPlayer.name} onChange={(event)=>{
                            const editPlayer = {...this.state.editPlayer};
                            editPlayer.name = event.target.value || '';
                            this.setState({editPlayer});
                        }}/>

                    </div>
                    <div>
                        email:
                        <input  type="text" id="playerEmail" className="bordered-input left-margin left-pad" value={this.state.editPlayer.email} onChange={(event)=>{
                            const editPlayer = {...this.state.editPlayer};
                            editPlayer.email = event.target.value || '';
                            this.setState({editPlayer});
                        }}/>
                    </div>
                    <div>
                        image:
                        <input  type="text" id="playerImage" className="bordered-input left-margin left-pad" value={this.state.editPlayer.imageUrl||''} onChange={(event)=>{
                            const editPlayer = {...this.state.editPlayer};
                            editPlayer.imageUrl = event.target.value || '';
                            this.setState({editPlayer});
                        }}/>
                    </div>

                    {this.state.editPlayer.imageUrl && this.state.editPlayer.imageUrl.length >0 && <img alt="" className="playerPageImage" src={this.state.editPlayer.imageUrl}/>}
                </div>

                <div className="buttons-section">
                    <button onClick={()=>this.setState({editPlayer:null})}>Back</button>
                    <button onClick={this.saveEditedPlayer} className="left-margin">Save</button>

                </div>


            </div>
        );

    }


    render() {
        if (this.state.newPlayer){
            return this.getNewPlayerSection()
        }
        if (this.state.editPlayer){
            return this.getPlayerEdit();
        }

        if (this.state.playerSummary){
            return <PlayerSummary
                player={this.state.playerSummary}
                group={this.props.group}
                back={()=>this.setState({playerSummary: null})}
                edit={()=>this.onPlayerEditClick(this.state.playerSummary)}
                delete={()=>this.onPlayerDeleteClick(this.state.playerSummary.id)}
            />
        }

        return (<div id="all-games-div" >
            <div className="row">
                <div className="col-xs-6">
                    <div className="player-item-div"
                         onClick={this.showCreatePlayer}>
                        <img src="plus.png" className="player-item-div-plus-sign"/>

                    </div>
                </div>

                {this.PLAYERS}

            </div>
        </div>)


    }
}

export default PlayersTab;

