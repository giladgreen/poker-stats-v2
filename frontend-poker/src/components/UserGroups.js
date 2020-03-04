import React, { Component } from 'react';
const introJs = require('intro.js');

class UserGroups extends Component {

    constructor() {
        super();
        this.imageIndex = 0;
        this.imagesCount = 7;
    }


    startIntro=()=>{
        introJs().start();
    }
    getImage=()=>{

        this.imageIndex++;

        if (this.imageIndex > this.imagesCount) {
            this.imageIndex = 1;
        }
        return `backgroundImage${this.imageIndex}.jpg`;
    }
    getUserGroupsDiv=()=>{
        const groups = this.props.groups || [];

        const groupsItems = groups.map((group, index) => {

            const style = {
                backgroundImage: `url(${group.imageUrl || this.getImage()})`,
                borderRadiusTop: '50px',
            };
            const introData = index === 0 ? {
                "data-position":"right",
                "data-intro":"enter group data if you already belong to it, or request to be invited to group",
                "data-step":2
            } : {};


            return (<div key={group.id} {...introData} className={`group-item-div ${group.isAdmin ? 'group-item-div-admin' : ''}`}  onClick={()=>this.props.showGroup(group)}>
                <div key={group.id} className="group-item-div-inner" style={style}>
                    <div><b>{group.name }</b></div>
                    <div className="group-description">{group.userInGroup ? group.description : 'not in this group' }</div>

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


        return (<div id="user-groups" >
            <div className="row">
                <div className="">
                    <div className="group-item-div plus-sign"
                         data-position="right" data-intro="add a new group here" data-step={1}
                         onClick={this.props.createGroup}>
                        +
                    </div>
                </div>
                {groupsItems}

                <div className="info-icon"  onClick={this.startIntro} >
                    <img src="https://img.icons8.com/flat_round/64/000000/info.png"/>
                </div>


            </div>
        </div>)


    }



    render() {

        return this.getUserGroupsDiv();
    }
}

export default UserGroups;


