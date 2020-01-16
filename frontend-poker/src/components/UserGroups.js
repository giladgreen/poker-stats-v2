import React, { Component } from 'react';

class UserGroups extends Component {

    constructor() {
        super();
        this.imageIndex = 0;
        this.imagesCount = 5;
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
        console.log('groups',groups)
        const groupsItems = groups.map(group => {

            const style = {
                backgroundImage: `url(${group.imageUrl || this.getImage()})`,

            };
            return (<div key={group.id} className="group-item-div"  onClick={()=>this.props.showGroup(group)}>
                <div key={group.id} className="group-item-div-inner" style={style}>
                    <div><b>{group.name }</b></div>
                    <div className="group-description">{group.description }</div>
                    <br/>
                    <div className="my-group">{group.userInGroup ? "i'm in this group" : 'not in this group' }</div>
                </div>

                <div className="group-extra-data">
                    <div>
                    8 players

                    </div>
                    <div>
                    21 games

                    </div>
                </div>
            </div>);

        });


        return (<div id="user-groups" >
            <div className="row">
                <div className="col-xs-6">
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


