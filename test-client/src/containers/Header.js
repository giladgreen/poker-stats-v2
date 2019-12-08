import React, { Component } from 'react';

class Header extends Component {
    render() {
        return (
            <div>
                <div className="logged-in-header">
                    <img alt="" src={this.props.user.imageUrl}  className="user-image" />
                    <span className="logged-in-header-text">Welcome <span className="blue-text"> {this.props.user.firstName} {this.props.user.familyName} </span> </span>
                    <button className="button logout" onClick={this.props.logout}> Log out </button>
                </div>
                 <hr/>
            </div>);

    }
}

export default Header;

