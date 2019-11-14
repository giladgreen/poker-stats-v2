import React, { Component } from 'react';

import createPlayer from "../actions/createPlayer";
import deletePlayer from "../actions/deletePlayer";

class Group extends Component {

    constructor() {
        super();
        this.state = { newPlayerName:'' };
    }

    handleNewPlayerNameChange = (event) =>{
        this.setState({newPlayerName: event.target.value});
    };

    deletePlayerById = async (playerId) => {
        try{
            await deletePlayer(this.props.group.id, playerId, this.props.provider, this.props.token);
            const groupClone = {...this.props.group};
            //console.log('deletePlayerById')
            groupClone.players = groupClone.players.filter(player => player.id !== playerId);
            this.props.updateGroup(groupClone);
        }catch(error){
            console.error('deletePlayerById error',error);
            this.props.onFailure(error);
        }
    };

    createNewPlayer = async () =>{
        try{
            const newPlayer = await createPlayer(this.props.group.id, this.state.newPlayerName, this.props.provider, this.props.token);
            const groupClone = {...this.props.group};
            groupClone.players.push(newPlayer);
            this.props.updateGroup(groupClone);
        }catch(error){
            console.error('createNewPlayer error',error);
            this.props.onFailure(error);
        }
    };

    getNewPlayerSection = () => {
        return (<div>
            <h1> Create a new player. </h1>
            Player name: <input type="text" id="newPlayerName" value={this.state.newPlayerName} onChange={this.handleNewPlayerNameChange}/>

            <button className="button" onClick={this.createNewPlayer}> Create </button>
            <br/> <hr/><br/>

        </div>);
    };

    getPlayers = (players, isAdmin)=>{


        return players.map(player=>{
            console.log('player',player);
            const deletePlayerButton = isAdmin ?  <button className="button" onClick={()=> this.deletePlayerById(player.id)}> Delete player   </button> : <span/>;

            const image = player.imageUrl ? <img alt={player.name} className="playersListImage" src={player.imageUrl}/> : <span/>;
            return (<div className="playersListItem" key={`player_${player.id}`}>
                <h3> * {player.name}{image}  {deletePlayerButton} </h3>
            </div>);
        })
    };

    render() {
        const {group} = this.props;
        const newPlayerSection = this.getNewPlayerSection();
        const players = this.getPlayers(group.players, group.isAdmin);
        return (
            <div className="groupPage">
                <div>
                    <button className="button" onClick={this.props.backToMainPage}> back to all groups</button>

                </div>
                <div>
                    <h1> Group: {group.name}</h1>
                </div>
                <div>
                    {newPlayerSection}
                    <h2>  {group.players.length} players</h2>
                    {players}
                </div>
                <div>
                    <hr/>
                </div>
                <div>
                    <h2>  {group.games.length} games</h2>
                </div>
            </div>);

    }
}

export default Group;

//<Group group={this.state.group} provider={this.state.provider} token={this.state.token} backToMainPage={this.backToMainPage} />
