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
        const updatedGroup = await getGroupData(group,this.props.provider, this.props.token)
        this.props.updateGroup(updatedGroup);
    };

    deleteGroupById = async (groupId) => {
        if (confirm("Are you sure?")){
            try{
                await deleteGroup(groupId, this.props.provider, this.props.token);
                const groupsClone = [...this.props.groups].filter(group => group.id !== groupId);
                this.props.updateGroups(groupsClone);
            }catch(error){
                console.error('createNewGroup error',error);
                this.props.onFailure(error);
            }
        }

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
            const deleteGroupButton = group.isAdmin ?  <button className="button" onClick={()=> this.deleteGroupById(group.id)}> Delete group   </button> : <span/>;
            return (<div key={`userInGroup_${group.id}`}>
                -  <button className="button" onClick={()=> this.onGroupClicked(group)}>{group.name}   </button>  {group.isAdmin ? ' (you are a group admin.)' : ''}{deleteGroupButton}
                <br/><br/>
            </div>);
        });

        const nonUserGroups = groups.filter(group => !group.userInGroup).map(group =>{
            const { invitationRequested, invitationStatus } = group;
            const button =  <button className="button" onClick={()=> this.onGetInvitationRequestsClicked(group.id)}> ask invitation to this group</button>;
            return (<div key={`userNotInGroup_${group.id}`}>
                - Group: <b> {group.name} </b>.  { invitationRequested ? (<span>Status: <b> {invitationStatus}</b></span>) : button }
                <br/><br/>
            </div>);
        });
        return (
            <div>
                {this.getNewGroupSection()}
                <div>
                    <b><u> You belong to {userGroups.length} groups:</u></b>
                    <br/><br/>
                    {userGroups}
                    <br/><br/>
                </div>
                <div>
                    <hr/>
                </div>
                <div>
                    <b><u> there are {nonUserGroups.length} groups you do not belong to:</u></b>
                    <br/><br/>
                    {nonUserGroups}
                    <br/><br/><br/><br/>
                </div>
            </div> );



    }
}

export default Groups;

