import { URL_PREFIX } from '../../config.js';
import React, { Component } from 'react';
import request from 'request';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import FacebookLogin from 'react-facebook-login';
import { GoogleLogin } from 'react-google-login';
import config from './config.json';

const pokerStatsGroupsUrlPrefix = URL_PREFIX;//'http://localhost:5000/api/v2';
//const pokerStatsGroupsUrlPrefix = 'https://poker-stats.herokuapp.com/api/v2';
let mediaStream, context, myWidth,myHeight;
async function setupVideo(){
    if (context) return;
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({audio:false,  video: true});
        const video = document.querySelector('video');
        video.srcObject = mediaStream;
        video.onloadedmetadata = function(event,error) {
            if (error){
                console.error('error',error);
                return;
            }
            video.play();
            const canvas = document.querySelector('canvas');
            context = canvas.getContext('2d');
            const ratio = video.videoWidth/video.videoHeight;
            myWidth = video.videoWidth-100;
            myHeight = parseInt(myWidth/ratio,10);
            canvas.width = myWidth;
            canvas.height = myHeight;
        };
    } catch(err) {
        console.error('stream error!', err);
    }
}


class App extends Component {


    constructor() {
        super();
        this.state = { loading: false, isAuthenticated: false, user: null, token: null, groups:[],group:null, newGroupName:'', provider:'', error:null, videoPage:false, takingSnapshots: false, stackSize: null, interval:30000, baseChipColor: "Black", numberOfBaseChips: 1 };
    }

    logout = () => {
        this.setState({isAuthenticated: false, token: null, user: null, groups:[],group:null, error:null})
    };


    backToGroupPage = () => {
        this.setState({error:null, videoPage:false})
    };

    backToMainPage = () => {
        this.setState({group:null, error:null})
    };

    goToVideoPage = () => {
        this.setState({error:null, videoPage: true})
    };

    setProvider = (provider) => {
        this.setState({provider, error:null})
    };

    onFailure = (error) => {
        alert(error);
    };

    performLogin = (name, token) => {
        const options = {
            url: `${pokerStatsGroupsUrlPrefix}/groups/`,
            headers:{
                provider: name,
                "x-auth-token": token,
                "Content-Type":'application/json'
            }
        };

        request(options, (error, response, body) =>{
            if (response.statusCode>=400){
                const bodyObj = JSON.parse(body) ;
                console.log('error', bodyObj);
                this.setState({error: bodyObj.title});
            }

            if (response && response.headers && response.headers['x-user-context']){
                const userContextString = response.headers['x-user-context'];
                const userContext = JSON.parse(decodeURI(userContextString));
                this.setState({error:null, loading:false, isAuthenticated: true, user: userContext, groups: JSON.parse(body).results});
            }
        });
    };

    LoginResponse = (r, name) => {
        navigator.clipboard.writeText( r.accessToken);

        this.setState({error:null,loading:true, isAuthenticated: true, token: r.accessToken});

        this.performLogin(name, r.accessToken);


    };

    facebookResponse = (response) => {
        this.setProvider('facebook');
        return this.LoginResponse(response, 'facebook');
    };

    googleResponse = (response) => {
        this.setProvider('google');
        return this.LoginResponse(response, 'google');
    };

    LoginPage = () => {
        return (
            <div className="App login-page">
                <div>
                    <h1>Log in to PokerStats!</h1>
                    <h2> Log in with:</h2>
                </div>

                <div>
                     <div>

                            <FacebookLogin
                                appId={config.FACEBOOK_APP_ID}
                                autoLoad={false}

                                fields="name,email,picture"
                                callback={this.facebookResponse} />
                     </div>
                    <br/>
                    <div>
                            <GoogleLogin
                                clientId={config.GOOGLE_CLIENT_ID}
                                buttonText="Login with Google"
                                onSuccess={this.googleResponse}
                                onFailure={this.onFailure}
                            />



                    </div>
                </div>
            </div>
        );
    };

    LoaderPage = () => {
        return (
            <div className="App">
                <p id="loader">Please wait...</p>
            </div>
        );
    };

    createNewGroup = () =>{

        const options = {
            method:'POST',
            url: `${pokerStatsGroupsUrlPrefix}/groups/`,
            body:JSON.stringify({name:this.state.newGroupName}),
            headers:{
                provider: this.state.provider,
                "x-auth-token": this.state.token,
                "Content-Type":'application/json'
            }
        };

        request(options, (error, response, body) =>{

            if (response.statusCode>=400){
                const bodyObj = JSON.parse(body) ;
                console.log('error', bodyObj);
              this.setState({error: bodyObj.title});

            } else{
                this.performLogin(this.state.provider, this.state.token);
            }

        });
    };

    onGetInventionsRequestsClicked = (groupId) =>{
        const body = JSON.stringify({
            groupId
        });

        const options = {
            method: 'POST',
            url: `${pokerStatsGroupsUrlPrefix}/inventions-requests/`,
            headers:{
                provider: 'google',
                "x-auth-token": this.state.token,
                "Content-Type":'application/json'
            },
            body
        };
        const groups = {...this.state.groups};
        const group = Object.values(groups).find(g=>g.id === groupId);

        request(options, (error, response, body) =>{
            if (response.statusCode>=400){
                const bodyObj = JSON.parse(body) ;
                console.log('error', bodyObj);
                this.setState({error: bodyObj.title});
            }else{
                try {
                    const {status} = JSON.parse(body);
                    if (group && status){
                        group.invitationRequested = true;
                        group.invitationStatus = status;
                        this.setState({error:null, groups});
                    }
                } catch (e) {
                }
            }



        });
    };

    handleNewGameNameChange = (event) =>{
        this.setState({error:null,newGroupName: event.target.value});
    };

    getNewGroupSection = () => {
        return (<div>
            <h1> Create a new group. </h1>
            Group name: <input type="text" id="newGroupName" value={this.state.newGroupName} onChange={this.handleNewGameNameChange}/>

            <button className="button" onClick={this.createNewGroup}> Create </button>
            <br/><br/> <hr/><br/><br/>

        </div>);
    };

    onGroupClicked = (group) => {
        this.setState({group, loading:true, error:null});

        const playersOptions = {
            method: 'GET',
            url: `${pokerStatsGroupsUrlPrefix}/groups/${group.id}/players/`,
            headers:{
                provider: 'google',
                "x-auth-token": this.state.token,
                "Content-Type":'application/json'
            }
        };
        const gamesOptions = {
            method: 'GET',
            url: `${pokerStatsGroupsUrlPrefix}/groups/${group.id}/games/`,
            headers:{
                provider: 'google',
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

    GroupsInfo = () => {

        const {groups} = this.state;
        if (!groups || groups.length === 0){
            return (<div>
                <b><u>No groups. </u></b> <br/><br/> <br/><br/>
                {this.getNewGroupSection()}
            </div>);
        }
        const userGroups = groups.filter(group => group.userInGroup).map(group =>{
            return (<div key={`userInGroup_${group.id}`}>
                        -  <button className="button" onClick={()=> this.onGroupClicked(group)}>{group.name}   </button>  {group.isAdmin ? ' (you are a group admin.)' : ''}
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



    };

    About = ()=>{
        return 'About..';
    }

    Header = ()=>{
        const {loading, isAuthenticated}  = this.state;
        if (loading || !isAuthenticated){
            return <div/>;
        }
        return ( <div>
            <div className="logged-in-header">
                <img alt="" src={this.state.user.imageUrl}  className="user-image" />
                <span className="logged-in-header-text">you are logged in as <span className="blue-text"> {this.state.user.firstName} {this.state.user.familyName} </span> ({this.state.user.email})</span>
                <button className="button" onClick={this.logout}> Log out </button>

            </div>
            <hr/>
        </div>);
    };

    takeOneSnapshot = async() =>{
        const {provider, token, baseChipColor, numberOfBaseChips } = this.state;
        const video = document.querySelector('video');
        context.fillRect(0,0,myWidth,myHeight);
        context.drawImage(video,0,0,myWidth,myHeight);
        const canvas = document.querySelector('canvas');
        const image = canvas.toDataURL(); // PNG is the default
        const options = {
            url: `${pokerStatsGroupsUrlPrefix}/player-stack-image/`,
            method:'POST',
            headers:{
                provider: provider,
                "x-auth-token": token,
                "Content-Type":'application/json'
            },
            body: JSON.stringify({ image, baseChipColor, numberOfBaseChips })
        };

        request(options, (error, response, body) =>{
            if (response.statusCode>=400){
                const bodyObj = JSON.parse(body) ;
                console.log('error', bodyObj);
                this.setState({error: bodyObj.title});

            } else {
                const bodyObj = JSON.parse(body) ;
                this.setState({stackSize: bodyObj.stack, info:bodyObj.info  });
                console.log('server response was OK', bodyObj)
            }
        });
    };

    resetChipBase = ()=>{
        const {provider, token} = this.state;
        const options = {
            url: `${pokerStatsGroupsUrlPrefix}/player-stack-image/`,
            method:'DELETE',
            headers:{
                provider: provider,
                "x-auth-token": token,
                "Content-Type":'application/json'
            }
        };

        request(options, (error, response, body) =>{
            if (response.statusCode>=400){
                const bodyObj = JSON.parse(body) ;
                console.log('error', bodyObj);
            } else {
                const bodyObj = JSON.parse(body) ;
                this.setState({stackSize: null, info:[]  });
            }
        });
    };

    startTakingSnapshots = ()=>{
        this.takeOneSnapshot();
        const intervalId = setInterval(this.takeOneSnapshot, this.state.interval);
        this.setState({takingSnapshots:true, intervalId});
    };

    stopTakingSnapshots = ()=>{
        if (this.state.intervalId){
            clearInterval(this.state.intervalId)
        }
        this.setState({takingSnapshots:false, intervalId: null});
    };

    handleIntervalChange = (event) =>{
        this.setState({error:null,interval: event.target.value});
    };
    handleNumberOfBaseChipsChange = (event) =>{
        this.setState({error:null,numberOfBaseChips: event.target.value});
    };

    handleBaseChipColorChange = (event) =>{
        this.setState({error:null,baseChipColor: event.target.value});
    };

    VideoPage = () => {
        setTimeout(setupVideo,700);
        const {takingSnapshots} = this.state;
        return (
            <div className="App videoPage">
                <div>
                    <button className="button" onClick={this.backToGroupPage}> back to group page</button>
                </div>
                <hr/>
                <div>
                    <button className="button" onClick={this.resetChipBase}> Reset </button>
                </div>
                <hr/>
                <div>

                    interval: <input type="number" id="intervalTime" value={this.state.interval} onChange={this.handleIntervalChange}/><br/>
                    number of base chips: <input type="number" id="numberOfBaseChips" value={this.state.numberOfBaseChips} onChange={this.handleNumberOfBaseChipsChange}/><br/>
                    base chip color: <input type="text" id="baseChipColor" value={this.state.baseChipColor} onChange={this.handleBaseChipColorChange}/>
                </div>
                <hr/>
                <div>
                    <button className="button" onClick={()=> (takingSnapshots ? this.stopTakingSnapshots() : this.startTakingSnapshots())}> {takingSnapshots ?'stop': 'start taking snapshots'}</button>
                </div>
                <div className="errorSection">
                    {this.state.error}
                </div>
                <video id="videoOfChips"/>
                <h1>{ this.state.stackSize || this.state.stackSize === 0 ? `stack size: ${this.state.stackSize}` : ''}</h1>
                <div className="stackInfo">
                    {this.state.info ? (<ul>{ this.state.info.map(item=>(<li key={item.color}>{JSON.stringify(item)}</li>)) }  </ul>) : <div/>}
                 </div>
                <canvas id="canvas" className="imageCanvas" width="600" height="300"/>

             </div> );
     }

    GroupPage = () => {
        const {group} = this.state;
        return (
            <div className="App">
                <div>
                    <button className="button" onClick={this.backToMainPage}> back to all groups</button>
                    <button className="button" onClick={this.goToVideoPage}> video page</button>

                </div>
                <div>
                    <h1> Group: {group.name}</h1>
                </div>
                <div>
                    <h2>  {group.players.length} players</h2>
                </div>
                <div>
                    <hr/>
                </div>
                <div>
                    <h2>  {group.games.length} games</h2>
                </div>
            </div>);
    };

    render() {
        const { Header, GroupsInfo, About, LoaderPage, LoginPage, GroupPage, VideoPage } = this;
        if (this.state.videoPage) {
            return <VideoPage/>;
        }

        return (
            <div className="App">
                <Header/>
                <div className="errorSection">
                    {this.state.error}
                </div>
                <div className="MainSection">
                    <Router className="MainSection">
                        <Switch>
                            <Route path="/about" >
                                <About/>
                            </Route>
                            <Route path="/" >
                                { (this.state.loading && <LoaderPage/>) ||
                                (!this.state.isAuthenticated && <LoginPage/>) ||
                                (this.state.group && <GroupPage/>) ||
                                    <GroupsInfo/>}
                            </Route>
                        </Switch>
                    </Router>
                </div>
            </div>);

    }
}

export default App;

