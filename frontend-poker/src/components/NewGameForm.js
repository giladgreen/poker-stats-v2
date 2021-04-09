import React, { Component } from 'react';
import ShowErrorAlert from '../containers/ShowErrorAlert';
import ShowSuccessAlert from '../containers/ShowSuccessAlert';
import GrayBubbleButton from '../containers/GrayBubbleButton';
import GreenBubbleButton from '../containers/GreenBubbleButton';

class NewGameForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            newGame: props.newGame,
            showError: null,
            showSuccess: null
        }
    }

    handleNewGameDateChange = (event) =>{
        const newGame = { ...this.state.newGame, date: event.target.value };
        this.setState({newGame});
    };

    handleNewGameDescriptionChange = (event) =>{
        const newGame = { ...this.state.newGame, description: event.target.value };
        this.setState({newGame});
    };

    createNewGame = () => {
        const { group, provider, token, remoteCreateGame, updateGroupGame } = this.props;
        const game = {
            date: `${this.state.newGame.date}T20:00:00.000Z`,
            description: this.state.newGame.description,
            playersData:[]
        };
        remoteCreateGame(group.id, game, provider, token).then((g)=>{
            updateGroupGame(g);
            console.log('create game was ok')
            this.setState({ showSuccess: true});
            setTimeout(()=>{
                this.setState({ showSuccess: null});
                this.props.close();
            },10)
        }).catch((e)=>{
            console.log('create game was NOT ok',e)
            this.setState({ showError: true});
            setTimeout(()=>{
                this.setState({ showError: null});
                this.props.close();
            },10)
        })
    }

    render(){
        const { showError, showSuccess} = this.state;
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

                <GrayBubbleButton className="left-margin"  onClick={this.props.close}> Cancel </GrayBubbleButton>
                <GreenBubbleButton className="left-margin"  onClick={this.createNewGame} disabled={!legal}> Create </GreenBubbleButton>
            </div>

            { showError && <ShowErrorAlert message={"failed to create new game"}/>}
            { showSuccess && <ShowSuccessAlert message={"game created successfully"}/>}
        </div>);
    }
}

export default NewGameForm;
