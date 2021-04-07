/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable jsx-a11y/img-has-alt */
import React, { Component } from 'react';
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css';
import CONSTS from '../CONSTS';
import postImage from "../actions/postImage";
import ImageUploader from "./ImageUploader";
import ShowErrorAlert from '../containers/ShowErrorAlert';
import ShowSuccessAlert from '../containers/ShowSuccessAlert';

const { ANON_URL } = CONSTS;

class EditGameForm extends Component {

    constructor(props) {
        super(props);
        const existingPlayerId = this.findPlayerNotInGame(props.editGame);
        this.state = {
            editGame: props.editGame,
            existingPlayerId,
            gameSummary: null,
            editPlayerInGame: null,
            imageUploaderData: null,
            showError: null,
            showSuccess: null,
        }
    }

    updateSelectedGamePlayerData = ()=>{
        const editGame = {...this.state.editGame};
        const { playerId, cashOut, buyIn } = this.state.editPlayerInGame;

        editGame.playersData = editGame.playersData.map(pd => {
            if (pd.playerId !== playerId) return pd;
            return {...pd, cashOut, buyIn };
        });
        console.log('updateSelectedGamePlayerData', editGame)
        this.setState({editGame,editPlayerInGame:null});
    }

    getEditPlayerInGame = ()=>{
        const game = this.state.editGame;
        const { playerId, buyIn } = this.state.editPlayerInGame;
        const player = this.props.group.players.find(p=>p.id===playerId);

        const onImageError = (ev)=>{
            if (!ev.target.secondTry){
                ev.target.secondTry = true;
                ev.target.src= player.imageUrl;
            }else{
                ev.target.src=ANON_URL;
            }
        };

        const image = <img alt={player.name} className="playersListImageBig" src={player.imageUrl || ANON_URL}  onError={onImageError} /> ;
        const currentPlayerBuyIn = buyIn;
        const maxBuyInRange = currentPlayerBuyIn+100;
        const totalBuyIn = game.playersData.map(data=> data.buyIn).reduce((all,item)=>(all+item),0);

        const maxCashOutRange = (totalBuyIn);

        return (<div className="edit-player-in-game">
            <div>
                <h1>{image}{player.name}</h1>
            </div>
            <hr/>
            <div>
                buy-in:   <input className="editPlayerInput" type="number"  id="buyIn"
                                 value={this.state.editPlayerInGame.buyIn}
                                 onChange={(event)=>{
                                     const editPlayerInGame = {...this.state.editPlayerInGame};
                                     editPlayerInGame.buyIn=parseInt(event.target.value, 10);
                                     this.setState({ editPlayerInGame });
                                 }}/>

                <button className="button left-margin" onClick={()=>{
                    const editPlayerInGame = {...this.state.editPlayerInGame};
                    editPlayerInGame.buyIn -= 10;
                    if (editPlayerInGame.buyIn < 0){
                        editPlayerInGame.buyIn = 0;
                    }
                    this.setState({ editPlayerInGame });
                }}> -10 </button>
                <button className="button left-margin" onClick={()=>{
                    const editPlayerInGame = {...this.state.editPlayerInGame};
                    editPlayerInGame.buyIn += 10;
                    this.setState({ editPlayerInGame });
                }}> +10 </button>
                <br/>
                <br/>
                <InputRange className="InputRange"
                            step={10}
                            formatLabel={value => `${value}₪`}
                            maxValue={maxBuyInRange}
                            minValue={0}
                            value={this.state.editPlayerInGame.buyIn}
                            onChange={(buyIn) => {
                                const editPlayerInGame = {...this.state.editPlayerInGame};
                                editPlayerInGame.buyIn=buyIn;
                                this.setState({ editPlayerInGame });
                            }} />

                <br/>
                <br/>  <br/>
                <br/>
            </div>
            <div>
                cash-out:  <input className="editPlayerInput" type="number"  id="cashOut"
                                  value={this.state.editPlayerInGame.cashOut}
                                  onChange={(event)=>{
                                      const editPlayerInGame = {...this.state.editPlayerInGame};
                                      editPlayerInGame.cashOut=parseInt(event.target.value, 10);
                                      this.setState({ editPlayerInGame });
                                  }}/>

                <button className="button left-margin" onClick={()=>{
                    const editPlayerInGame = {...this.state.editPlayerInGame};
                    editPlayerInGame.cashOut -= 10;
                    if (editPlayerInGame.cashOut < 0){
                        editPlayerInGame.cashOut = 0;
                    }
                    this.setState({ editPlayerInGame });
                }}> -10 </button>

                <button className="button left-margin" onClick={()=>{
                    const editPlayerInGame = {...this.state.editPlayerInGame};
                    editPlayerInGame.cashOut += 10;
                    this.setState({ editPlayerInGame });
                }}> +10 </button>
                <br/>
                <br/>
                <InputRange className="InputRange"
                            step={10}
                            formatLabel={value => `${value}₪`}
                            maxValue={maxCashOutRange}
                            minValue={0}
                            value={this.state.editPlayerInGame.cashOut}
                            onChange={cashOut => {
                                const editPlayerInGame = {...this.state.editPlayerInGame};
                                editPlayerInGame.cashOut=cashOut;
                                this.setState({ editPlayerInGame });
                            }} />

            </div>
            <div>
                <br/> <br/>
                balance: {this.state.editPlayerInGame.cashOut - this.state.editPlayerInGame.buyIn}
            </div>
            <div>
                <button className="button" onClick={()=> this.setState({editPlayerInGame:null})}> Cancel</button>
                <button className="button left-margin" onClick={this.updateSelectedGamePlayerData}> Save Player</button>
                <button className="button left-margin" onClick={()=>{
                    this.updateSelectedGamePlayerData();
                    setTimeout(()=>{
                        this.updateSelectedGame();
                    },500)
                }}> Save Game</button>

            </div>
        </div>);
    }


    showImageUploaderForm = ({ gameId })=>{
        this.setState({ imageUploaderData: { gameId }});
    }

    hideImageUploaderForm = ()=>{
        this.setState({ imageUploaderData: null});
    }

    findPlayerNotInGame = (game)=>{
        const {group} = this.props;
        const PLAYERS = {};
        const GAME_PLAYERS = {};
        group.players.forEach(player=>{
            PLAYERS[player.id] = player;
        });

        game.playersData.forEach(player=>{
            GAME_PLAYERS[player.playerId] = player;
        });
        const playa = group.players.find(player => !GAME_PLAYERS[player.id]);

        return playa ? playa.id : null;

    };

    showImageUploaderForm = ({ gameId })=>{
        this.setState({ imageUploaderData: { gameId }});
    }

    handleNewPlayerChange = (existingPlayerId)=> {
        this.setState({existingPlayerId});
    };

    addCurrentPlayerToGame = () =>{
        if (!this.state.existingPlayerId){
            console.log('no existingPlayerId')
            return;
        }
        const {group} = this.props;

        const editGame = {...this.state.editGame};
        editGame.playersData.push({
            buyIn: 50,
            cashOut: 0,
            gameId: editGame.id,
            groupId: group.id,
            playerId: this.state.existingPlayerId,
            index: editGame.playersData.length,
        });
        console.log('editGame', editGame)
        const existingPlayerId = this.findPlayerNotInGame(editGame);
        console.log('new existingPlayerId', existingPlayerId);
        this.setState({existingPlayerId, editGame});
    };

    updateSelectedGame = () =>{
        const { group, provider, token, remoteUpdateGame, updateGroupGame } = this.props;
        const data = {
            id: this.state.editGame.id,
            date: `${this.state.editGame.date}T20:00:00.000Z`,
            description: this.state.editGame.description,
            playersData:this.state.editGame.playersData
        };
        console.log('calling update game with body:', data);
        remoteUpdateGame(group.id, data.id, data, provider, token).then((game)=>{
            // this.setState({ newGame: null, editGame: null, gameSummary:game});
            updateGroupGame(game);
            console.log('updated game was ok', game)
            this.setState({ showSuccess: true, editGame: game});//TODO: date
            setTimeout(()=>{
                this.setState({ showSuccess: null});
                this.props.close();
            },10)
        }).catch((e)=>{
            console.log('update game was NOT ok',e)
            this.setState({ showError: true});
            setTimeout(()=>{
                this.setState({ showError: null});
                this.props.close();
            },10)
        })

    };

    getGamePot = (game)=>{
        return game.playersData.reduce((all, one)=>{
            return all + one.buyIn;
        }, 0);
    }

    uploadImage = async (image, tags) =>{
        return postImage(image, tags, this.props.provider, this.props.token)
    }


    handleEditGameDateChange = (event) =>{
        const editGame = { ...this.state.editGame, date: event.target.value };
        this.setState({editGame});
    };

    handleEditGameDescriptionChange = (event) =>{
        const editGame = { ...this.state.editGame, description: event.target.value };
        this.setState({editGame});
    };

    isGameReady = (game)=>{
        const totalBuyIn = game.playersData.map(pd=>pd.buyIn).reduce((total, num)=>  total + num, 0);
        const totalCashOut =game.playersData.map(pd=>pd.cashOut).reduce((total, num)=>  total + num, 0);
        const diff = totalBuyIn - totalCashOut;
        const ready = diff === 0 && game.playersData.length >1;
        return { ready, diff };
    };

    removePlayerFromGame = (playerId) =>{
        const editGame = this.state.editGame;
        editGame.playersData = editGame.playersData.filter(player => player.playerId !==playerId);
        const existingPlayerId = this.findPlayerNotInGame(editGame);
        this.setState({editGame, existingPlayerId})
    }

    editGamePlayer = (playerId) =>{
        const game = this.state.editGame;
        const playerData = game.playersData.find(p=>p.playerId===playerId);
        const editPlayerInGame = { playerId, buyIn: playerData.buyIn,cashOut: playerData.cashOut };
        this.setState({editPlayerInGame });
    }

    render(){
        const { group } = this.props;

        if (this.state.editPlayerInGame){
            return this.getEditPlayerInGame()
        }

        if (this.state.imageUploaderData){
            return <ImageUploader group={group} {...this.state.imageUploaderData} close={this.hideImageUploaderForm} uploadImage={this.uploadImage} updateImage={this.props.updateImage}/>
        }

        const isMobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        const PLAYERS = {};
        const GAME_PLAYERS = {};
        group.players.forEach(player=>{
            PLAYERS[player.id] = player;
        });
        const game = this.state.editGame;
        if (!game){
            console.log('render, no editGame on state')
            return <div/>;
        }

        game.playersData.forEach(player=>{
            GAME_PLAYERS[player.playerId] = player;
        });
        const players = game.playersData.map(playerData=>{
            const playerName = PLAYERS[playerData.playerId].name;
            const playerImageUrl = PLAYERS[playerData.playerId].imageUrl;
            const onImageError = (ev)=>{
                if (!ev.target.secondTry){
                    ev.target.secondTry = true;
                    ev.target.src= playerImageUrl;
                }else{
                    ev.target.src=ANON_URL;
                }
            };

            const image =  <img alt={playerName} className="playersListImage" src={playerImageUrl || ANON_URL} onError={onImageError} /> ;

            return (<div key={`_playerData_${playerData.playerId}`} className="editGamePlayerSection">
                <button className="button edit-player-in-game-form" onClick={()=>this.editGamePlayer(playerData.playerId)}> edit </button>
                {image}
                { isMobile && <br/>}
                {playerName}
                <span className="gray-seprator"> |</span>
                { isMobile && <br/>}
                buy-in: {playerData.buyIn} <span className="gray-seprator"> |</span>
                { isMobile && <br/>}
                cash-out: {playerData.cashOut} <span className="gray-seprator"> |</span>
                { isMobile && <br/>}
                balance: {playerData.cashOut - playerData.buyIn}

                <button className="button remove-player-from-game" onClick={()=>this.removePlayerFromGame(playerData.playerId)}> remove </button>

            </div>);
        });


        const comboVals = group.players.filter(player => !GAME_PLAYERS[player.id]).map(player =>
            (
                <option key={`_comboVals_${player.id}`} value={player.id}>
                    { player.name }
                </option>
            )
        );
        const { ready, diff } = this.isGameReady(game);
        const { showError, showSuccess} = this.state;
        return (<div className="game-edit-div">
            <h2> edit game. </h2>
            <div className="new-game-section">
                Game date:
                <input  className="left-margin" type="date" id="newGameDate" min="2010-01-01" max="2050-01-01" value={this.state.editGame.date} onChange={this.handleEditGameDateChange}/>
            </div>
            <div className="new-game-section">
                description:
                <input  type="text" id="newGameExtra" className="bordered-input left-margin left-pad" value={this.state.editGame.description} onChange={this.handleEditGameDescriptionChange}/>
            </div>
            <div>
                <div>
                    <u>{players.length} Players:</u>
                </div>
                <div>
                    {players}
                </div>
            </div>

            <hr/>
            {
                comboVals.length >0 ? (
                    <div>
                        <select name="player" value={this.state.existingPlayerId} onChange={(e)=>this.handleNewPlayerChange(e.target.value)}>
                            {comboVals}
                        </select>
                        <button className="button left-margin" onClick={this.addCurrentPlayerToGame}> Add player</button>
                    </div>
                ) :<div>no more players</div> }
            <hr/>
            <div>
                <button className="button left-margin" onClick={this.props.close}> Cancel</button>
                <button className="button left-margin" onClick={this.updateSelectedGame}> Save</button>
            </div>
            <div>
                <br/>
                <h3>{ready ? '' : `game still not done (${diff>0 ? diff : -1*diff} ${diff>0 ? 'still in pot':'missing from pot'}).`}</h3>
            </div>
            <button onClick={()=>this.showImageUploaderForm({ gameId: game.id})} >upload image for this game</button>
            { showError && <ShowErrorAlert message={"failed to update game"}/>}
            { showSuccess && <ShowSuccessAlert message={"game updated successfully"}/>}
        </div>);

    }
}

export default EditGameForm;
