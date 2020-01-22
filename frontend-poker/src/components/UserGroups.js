import React, { Component } from 'react';

class UserGroups extends Component {

    constructor() {
        super();
        this.imageIndex = 0;
        this.imagesCount = 7;
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

        const groupsItems = groups.map(group => {

            const style = {
                backgroundImage: `url(${group.imageUrl || this.getImage()})`,
                borderRadiusTop: '50px',
            };

            return (<div key={group.id} className={`group-item-div ${group.isAdmin ? 'group-item-div-admin' : ''}`}  onClick={()=>this.props.showGroup(group)}>
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
                    <div className="group-item-div plus-sign" onClick={this.props.createGroup}>
                        +
                    </div>
                </div>

                {groupsItems}

            </div>
        </div>)


    }



    render() {

        return this.getUserGroupsDiv();
    }
}

export default UserGroups;


