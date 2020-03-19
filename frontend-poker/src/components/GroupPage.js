/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable jsx-a11y/img-has-alt */
import React, { Component } from 'react';
import 'react-input-range/lib/css/index.css';
import getGame from '../actions/getGame';
import createGame from '../actions/createGame';
import updateGame from '../actions/updateGame';
import deleteGame from '../actions/deleteGame';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuIcon from '@material-ui/icons/Menu';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import GameData from './GameData';
import GameSummary from './GameSummary';
import ImagesTab from './ImagesTab';
import ImageUploader from './ImageUploader';
import GamesTab from './GamesTab';
import PlayersTab from "./PlayersTab";


class GroupPage extends Component {

    constructor(props) {
        super(props);
        this.imageIndex = 0;
        this.imagesCount = 7;
        this.backgroundImage = `url(${props.group.imageUrl ||  `poker.jpg`})`;
        this.clearGamesTabSelections = ()=>{};


        this.state = { tabKey: 'summary', existingPlayerId: null  }
    }

    logout = ()=>{
        this.setState({showMenu: false });
        this.props.logout();
    };

    goHome = ()=>{
        this.setState({showMenu: false });
        this.props.goHome();
    };

    onKeyChange = (tabKey)=>{
        this.clearGamesTabSelections();
        this.setState({tabKey });
    };

    handleNewPlayerChange = (existingPlayerId)=> {
        this.setState({existingPlayerId});
    };

    showImageUploaderForm = ({ gameId })=>{
        this.setState({ imageUploaderData: { gameId }});
    }

    hideImageUploaderForm = ()=>{
        this.setState({ imageUploaderData: null});
    }

    /***/

    getHeader = ()=>{

        const { group } = this.props;
        const {isAdmin} = group;

        const menuItems = [];


        if (isAdmin){
            menuItems.push(<MenuItem key="menuItem1" onClick={()=>this.props.editGroup(group)}>Edit Group</MenuItem>);
        }

        menuItems.push(<MenuItem key="menuItem5" onClick={this.goHome}>Home</MenuItem>);
        menuItems.push(<MenuItem key="menuItem6" onClick={this.logout}>Logout</MenuItem>);

        return  <div id="app-header" >
            <MenuIcon id="menuIcon" fontSize="inherit" className='menu-icon' onClick={()=>this.setState({showMenu: !this.state.showMenu})} />

            {this.state.showMenu &&
            <Menu
                id="simple-menu"
                anchorEl={ ()=>document.getElementById("menuIcon") }
                keepMounted
                open={true}
                onClose={()=>this.setState({showMenu: !this.state.showMenu})} >

                {menuItems}

            </Menu>}



            <span id="app-header-text"><img src="pokerStatsLogoWithSheep.png" className="sheep-logo"/>Group Page</span>
        </div>
    };

    getNewGameSection = () => {
        const legal = this.state.newGame.date && this.state.newGame.date.length === 10;

        return (<div id="new-game-form">
                    <h2> Create a new game. </h2>
                    <div className="new-game-section">
                        Game date:
                        <input  className="left-margin" type="date" id="newGameDate" min="2010-01-01" max="2050-01-01" value={this.state.newGame.date} onChange={this.handleNewGameDateChange}/>
                    </div>
                    <div className="new-game-section">
                       description:
                        <input  type="text" id="newGameExtra" className="bordered-input left-margin left-pad" value={this.state.newGame.description} onChange={this.handleNewGameDescriptionChange}/>
                    </div>
                    <div className="new-game-section">

                      <button className="button left-margin"  onClick={()=>this.setState({newGame: null})}> Cancel </button>
                        <button className="button left-margin"  onClick={this.createNewGame} disabled={!legal}> Create </button>
                    </div>


                 </div>);
    };

    getGamesSummary = () =>{
        return <GameSummary
            game={this.state.gameSummary}
            group={this.props.group}
            back={()=>this.setState({editGame:null, gameSummary:null})}
            edit={()=>this.onGameEditClick(this.state.gameSummary)}
            delete={this.deleteSelectedGame}
        />;
    }

    render() {

        const { group } = this.props;

        if (this.state.imageUploaderData){
            return <ImageUploader group={group} {...this.state.imageUploaderData} close={this.hideImageUploaderForm} uploadImage={this.uploadImage}/>
        }

        const isMobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

        const max = isMobile ? 7 : 8;

        const header = this.getHeader();

        const style = {
            backgroundImage: this.backgroundImage,
        };

        return (
            <div id="container" className="group-page">
                {header}

                <div id="group-image-title" className="group-image-title" style={style} >
                    <div className="row">
                        <div className="col-xs-8 event-page-title" >
                            <div>{group.name}</div>
                            <div  className="event-page-description">{group.description}</div>

                        </div>
                    </div>
                </div>


                <div id="group-page-data"  >
                    <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example" style={{fontSize: isMobile ? "0.8em" : "1em"}} activeKey={this.state.tabKey} onSelect={this.onKeyChange} variant="pills">
                        <Tab eventKey="summary" title="summary" >
                            <GameData group={group}
                                      playersCount={max}
                                      IsGroupSummary={true}/>
                        </Tab>
                        <Tab eventKey="games" title="Games" >
                            <div id="games-tab">
                                <GamesTab group={group}
                                          remoteCreateGame={createGame}
                                          remoteUpdateGame={updateGame}
                                          remoteDeleteGame={deleteGame}
                                          getGame={getGame}
                                          removeGroupGame={this.props.removeGame}
                                          updateGroupGame={this.props.updateGame}
                                          removeGame={this.props.removeGame}
                                          updateImage={this.props.updateImage}
                                          setClearAll={ (func)=> { this.clearGamesTabSelections = func }}
                                          user={this.props.user}
                                          provider={this.props.provider}
                                          token={this.props.token}/>
                            </div>

                        </Tab>
                        <Tab eventKey="players" title="Players" >
                            <div id="players-tab">
                                <PlayersTab
                                group={group}
                                updatePlayerData={this.props.updatePlayerData}
                                updatePlayerRemoved={this.props.updatePlayerRemoved}
                                user={this.props.user}
                                provider={this.props.provider}
                                token={this.props.token}/>

                            </div>
                        </Tab>

                        <Tab eventKey="images" title="Images"  >
                            <div id="images-tab">
                                <ImagesTab group={group}
                                           provider={this.props.provider}
                                           token={this.props.token}
                                           user={this.props.user}
                                           removeImage={this.props.removeImage}
                                           uploadImage={this.props.uploadImage}
                                           updateImage={this.props.updateImage}/>
                            </div>
                        </Tab>


                    </Tabs>
                </div>


            </div>
        );

    }
}

export default GroupPage;

