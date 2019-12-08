import React, { Component } from 'react';
import createGroup from "../actions/createGroup";
import deleteGroup from "../actions/deleteGroup";
import requestInvitation from "../actions/requestInvitation";
import getGroupData from '../actions/getGroupData';

class Groups extends Component {

    constructor() {
        super();
        this.state = { newGroupName:'' };
    }

    onGetInvitationRequestsClicked = async (groupId) => {
        try {
            const {status} = await requestInvitation(groupId, this.props.provider, this.props.token);
            const groupsClone = [...this.props.groups];
            const group = Object.values(groupsClone).find(g => g.id === groupId);

            if (group && status) {
                group.invitationRequested = true;
                group.invitationStatus = status;
                this.props.updateGroups(groupsClone);
            }
        } catch (error) {
            console.error('requestInvitation error', error);
            this.props.onFailure(error);
        }
    }

    handleNewGameNameChange = (event) =>{
        this.setState({newGroupName: event.target.value});
    };

    onGroupClicked = async (group) => {
        const updatedGroup = await getGroupData(group,this.props.provider, this.props.token);

        updatedGroup.players = updatedGroup.players.map(player=>{
            let balance = 0;
            const playersGames = updatedGroup.games.filter(game=> {
                const play = game.playersData.find(data => data.playerId === player.id);
                if (play){
                    balance += play.cashOut;
                    balance -= play.buyIn;
                }
                return play;
            });
            const gamesCount = playersGames.length;

            return {...player, gamesCount, balance};
        }).sort((a,b)=>  a.gamesCount === b.gamesCount ? ((a.balance > b.balance ? -1 : 1)) : (a.gamesCount > b.gamesCount ? -1 : 1));
        this.props.updateGroup(updatedGroup);
    };



    createNewGroup = async () =>{
        try{
            const newGroup = await createGroup(this.state.newGroupName, this.props.provider, this.props.token);
            newGroup.userInGroup = true;
            const groupsClone = [...this.props.groups];
            groupsClone.push(newGroup);
            this.props.updateGroups(groupsClone);
        }catch(error){
            console.error('createNewGroup error',error);
            this.props.onFailure(error);
        }
    };

    getNewGroupSection = () => {
        return (<div>
            <h1> Create a new group. </h1>
            Group name: <input type="text" id="newGroupName" value={this.state.newGroupName} onChange={this.handleNewGameNameChange}/>

            <button className="button" onClick={this.createNewGroup}> Create </button>
            <br/><br/> <hr/><br/><br/>

        </div>);
    };

    render() {
        const {groups} = this.props;
        if (!groups || groups.length === 0){
            return (<div>
                <b><u>No groups. </u></b> <br/><br/> <br/><br/>
                {this.getNewGroupSection()}
            </div>);
        }
        const userGroups = groups.filter(group => group.userInGroup).map(group =>{
            return (<div className="col-xs-3 groupBox" key={`userInGroup_${group.id}`} onClick={()=> this.onGroupClicked(group)}>
                <h1> <b> {group.name} </b>    </h1>
                <h2> {group.description} </h2>
                <h3>{group.isAdmin ? ' (you are a group admin.)' : ''}</h3>


                <br/><br/>
            </div>);
        });

        const nonUserGroups = groups.filter(group => !group.userInGroup).map(group =>{
            const { invitationRequested, invitationStatus } = group;
            const button =  <button className="button" onClick={()=> this.onGetInvitationRequestsClicked(group.id)}> ask invitation to this group</button>;
            return (<div className="col-xs-3 groupBox nonGroupBox" key={`userNotInGroup_${group.id}`}>
                <h1> <b> {group.name} </b></h1>
                <h2> {group.description}</h2>
                { invitationRequested ? (<span>Status: <b> {invitationStatus}</b></span>) : button }
                <br/><br/>
            </div>);
        });
        const youBelongToText = userGroups.length === 0 ? 'You are not in any group yet.' : (userGroups.length === 1 ? 'You belong to one group:':`You belong to ${ userGroups.length} groups:`);
        const youDoNotBelongToText = nonUserGroups.length === 0 ? '' : (userGroups.length === 1 ? 'There is one group you do not belong to:':`there are ${ nonUserGroups.length} groups you do not belong to:`);
        return (
            <div>
                <div className="col-xs-12">
                    <b><u> {youBelongToText}</u></b>
                    <br/>
                </div>
                <div className="row" id="user-groups">
                    {userGroups}
                </div>
                <div>

                    <hr/>
                </div>
                <div>
                    <b><u> {youDoNotBelongToText}</u></b>
                </div>
                <div className="row" id="user-non-groups">

                    {nonUserGroups}

                </div>
                <div>
                    <br/>
                    <hr/>
                </div>
                {this.getNewGroupSection()}
            </div> );



    }
}

export default Groups;

