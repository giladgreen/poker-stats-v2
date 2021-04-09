/* eslint-disable no-lone-blocks */
import React, { Component } from 'react';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuIcon from '@material-ui/icons/Menu';
import GrayBubbleButton from '../containers/GrayBubbleButton';
import GreenBubbleButton from '../containers/GreenBubbleButton';
import RedBubbleButton from '../containers/RedBubbleButton';


class NewGroupForm extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showMenu:false,
            error: null,
            group:props.group || {
                name: '',
                description: ''
            },
            update: props.isUpdate
        };
    }

    handleGroupItemChange = (attributeName, newValue) => {
        const group = { ...this.state.group, [attributeName]: newValue };
        this.setState({ group });
    };

    cancel = () => {
        this.setState({showMenu: false});
        this.props.onCancel();
    };
    logout = () => {
        this.setState({showMenu: false});
        this.props.logout();
    };

    delete = () => {
        this.setState({showMenu: false});
        this.props.delete(this.state.group.id)
    };

    // eslint-disable-next-line
    getHeader = ()=>{

        const menuItems = [];

        menuItems.push(<MenuItem key="menuItem1" onClick={this.cancel}>Cancel</MenuItem>)
        if (this.state.update){
            menuItems.push(<MenuItem key="menuItem3" onClick={this.delete} >Delete</MenuItem>)
        }

        menuItems.push(<MenuItem key="menuItem5" onClick={this.logout}>Logout</MenuItem>)


        const menuIcon =  <MenuIcon id="menuIcon" fontSize="inherit" className='menu-icon' onClick={()=>this.setState({showMenu: !this.state.showMenu})} />;
        return  <div id="app-header">
            {menuIcon}

            {this.state.showMenu &&
            <Menu
                id="simple-menu"
                anchorEl={ ()=>document.getElementById("menuIcon") }
                keepMounted
                open={true}
                onClose={()=>this.setState({showMenu: !this.state.showMenu})}
            >

                {menuItems}

            </Menu>}

            <span id="app-header-text">{this.state.update ? 'Update': 'Create'} Group</span>
        </div>
    };

    render() {
        const header = this.getHeader();
        const isLegalGroup = this.state.group.name.length > 0;

        return (
            <div id="create-group-form container">
                {header}
                <div id="create-group-form-wrapper">
                    <div className="row">
                        <span className="new-group-form-item-label">Name*</span>
                    </div>
                    <div className="row">
                        <input type="text" placeholder="Enter group name" id="newGroupTitle" className="formTextInput-full-width" value={this.state.group.name} onChange={(e) => this.handleGroupItemChange('name', e.target.value)} />
                    </div>
                    <div className="row">
                        <span className="new-group-form-item-label">Description</span>
                    </div>
                    <div className="row">
                        <input type="text" placeholder="Enter description" id="newGroupDescription" className="formTextInput-full-width" value={this.state.group.description} onChange={(e) => this.handleGroupItemChange('description', e.target.value)} />
                    </div>

                    <div className="row top-margin">
                        <GrayBubbleButton className="button left-pad"  onClick={this.props.onCancel}> Cancel </GrayBubbleButton>

                        <GreenBubbleButton className="button left-pad left-margin" onClick={()=>this.props.saveGroup(this.state.group)} disabled={!isLegalGroup}>{this.state.update ? 'update' : 'save'}</GreenBubbleButton>
                        { this.state.update && <RedBubbleButton className="button left-pad left-margin" onClick={()=>this.props.deleteGroup(this.state.group.id)} disabled={!isLegalGroup}> delete</RedBubbleButton>}
                    </div>


                </div>
            </div>
        );

    }
}

export default NewGroupForm;

