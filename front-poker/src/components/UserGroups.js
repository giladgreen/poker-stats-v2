
import React, { Component } from 'react';
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
const introJs = require('intro.js');



class UserGroups extends Component {

    constructor() {
        super();
        this.imageIndex = 0;
        this.imagesCount = 7;
        this.clearGamesTabSelections = ()=>{};


        this.state = { tabKey: 'myGroups' }
    }


    startIntro(){
        introJs().start();
    }
    getImage=()=>{

        this.imageIndex++;

        if (this.imageIndex > this.imagesCount) {
            this.imageIndex = 1;
        }
        return `backgroundImage${this.imageIndex}.jpg`;
    }

    getGroupsDiv=({ groups, showAddGroupItem})=>{

        const groupsItems = groups.map((group) => {
            const style = {
                backgroundImage: `url(${group.imageUrl || this.getImage()})`,
                borderRadiusTop: '50px',
            };

            return (<div key={group.id}  className={`group-item-div ${group.isAdmin ? 'group-item-div-admin' : ''}`}  onClick={()=>this.props.showGroup(group)}>
                        <div key={group.id} className="group-item-div-inner" style={style}>
                            <div><b  className="text-shadow">{group.name }</b></div>
                            <div className="group-description text-shadow">{group.userInGroup ? group.description : 'not in this group' }</div>

                            <div className="my-group">{group.userInGroup ? '' : (group.invitationRequested ? 'invitation was requested': 'click to ask for an invitation') }</div>

                        </div>

                        <div className="group-extra-data">
                            <div>
                                {group.playersCount} players

                            </div>
                            <div>
                                {group.gamesCount} games

                            </div>
                        </div>
                    </div>);

        });


        return (<div id="user-groups" className="row">
            { showAddGroupItem && (
                <div className="row">
                    <div className="">
                        <div className="group-item-div" onClick={this.props.createGroup}>
                            <img src="plus.png" className="group-item-div-plus-sign"/>
                        </div>
                    </div>
                </div>)}
                {groupsItems}
        </div>);


    }

    getUserGroupsDiv=()=>{
        const groups = this.props.groups || [];
        const myGroups = groups.filter(group => group.userInGroup);
        return this.getGroupsDiv({ groups: myGroups, showAddGroupItem:true});
    }


    getOtherGroupsDiv = ()=>{
        const groups = this.props.groups || [];
        const otherGroups = groups.filter(group => !group.userInGroup);
        return this.getGroupsDiv({ groups: otherGroups, showAddGroupItem:false});
    }


    onKeyChange = (tabKey) =>{
        console.log('### tabKey',tabKey)
       // this.clearGamesTabSelections();
        this.setState({tabKey });
    };
    render() {
        const isMobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));


        return  <div id="groups-page"  >
                    <Tabs defaultActiveKey="myGroups" id="uncontrolled-tab-example" style={{fontSize: isMobile ? "0.8em" : "1em"}} activeKey={this.state.tabKey} onSelect={this.onKeyChange} variant="pills">
                        <Tab eventKey="myGroups" title="My Groups" >
                            {this.getUserGroupsDiv()}
                        </Tab>
                        <Tab eventKey="otherGroups" title="Other Groups" >
                            {this.getOtherGroupsDiv()}
                        </Tab>
                    </Tabs>
                </div>;
    }
}

export default UserGroups;


