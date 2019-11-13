import { URL_PREFIX } from '../../../config';
import React, { Component } from 'react';
import request from 'request';

class Groups extends Component {


    constructor() {
        super();
        this.state = { newGroupName:'' };
    }

    onGetInventionsRequestsClicked = (groupId) =>{

        const options = {
            method: 'POST',
            url: `${URL_PREFIX}/inventions-requests/`,
            headers:{
                provider: 'google',
                "x-auth-token": this.state.token,
                "Content-Type":'application/json'
            },
            body: JSON.stringify({
                groupId
            })
        };


        request(options, (error, response, body) =>{
            if (response.statusCode>=400){
                const bodyObj = JSON.parse(body) ;
                return this.props.onFailure(bodyObj.title);

            }else{
                try {
                    const {status} = JSON.parse(body);
                    const groupsClone = [...this.props.groups];
                    const group = Object.values(groupsClone).find(g=>g.id === groupId);

                    if (group && status){
                        group.invitationRequested = true;
                        group.invitationStatus = status;
                        this.props.updateGroups(groupsClone);
                    }
                } catch (e) {
                    console.log(e.message);
                    return this.props.onFailure('error while asking for invitation');
                }
            }



        });
    };

    handleNewGameNameChange = (event) =>{
        this.setState({error:null,newGroupName: event.target.value});
    };



    onGroupClicked = (group) => {
        this.setState({group, loading:true, error:null});

        const playersOptions = {
            method: 'GET',
            url: `${URL_PREFIX}/groups/${group.id}/players/`,
            headers:{
                provider: this.state.provider,
                "x-auth-token": this.state.token,
                "Content-Type":'application/json'
            }
        };
        const gamesOptions = {
            method: 'GET',
            url: `${URL_PREFIX}/groups/${group.id}/games/`,
            headers:{
                provider: this.state.provider,
                "x-auth-token": this.state.token,
                "Content-Type":'application/json'
            }
        };
        let players;
        let games;
        request(playersOptions, (error, response, body) =>{
            if (response.statusCode>=400){
                const bodyObj = JSON.parse(body) ;
                console.log('error', bodyObj);
                this.setState({error: bodyObj.title});
            }else{
                players = JSON.parse(body).results;
                const group = { ...this.state.group, players};
                this.setState({group, loading:!players || !games, error:null});
            }


        });
        request(gamesOptions, (error, response, body) =>{
            if (response.statusCode>=400){
                const bodyObj = JSON.parse(body) ;
                console.log('error', bodyObj);
                this.setState({error: bodyObj.title});
            }else{
                games = JSON.parse(body).results;
                const group = { ...this.state.group, games};
                this.setState({group, loading:!players || !games, error:null});
            }

        });
    };

    getNewGroupSection = () => {
        return (<div>
            <h1> Create a new group. </h1>
            Group name: <input type="text" id="newGroupName" value={this.state.newGroupName} onChange={this.handleNewGameNameChange}/>

            <button className="button" onClick={()=>this.props.createNewGroup(this.state.newGroupName)}> Create </button>
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
            return (<div key={`userInGroup_${group.id}`}>
                -  <button className="button" onClick={()=> this.props.onGroupClicked(group)}>{group.name}   </button>  {group.isAdmin ? ' (you are a group admin.)' : ''}
                <br/><br/>
            </div>);
        });

        const nonUserGroups = groups.filter(group => !group.userInGroup).map(group =>{
            const { invitationRequested, invitationStatus } = group;
            const button =  <button className="button" onClick={()=> this.onGetInventionsRequestsClicked(group.id)}> ask invitation to this group</button>;
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

