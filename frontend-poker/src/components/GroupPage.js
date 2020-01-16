import React, { Component } from 'react';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import DateRangeIcon from '@material-ui/icons/DateRange';
import AppsIcon from '@material-ui/icons/Apps';
import AddToCalendar from 'react-add-to-calendar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuIcon from '@material-ui/icons/Menu';

const SECOND = 1000;
const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
class GroupPage extends Component {

    getDateParts(date){

        const now = new Date();
        const bigger = now < date ? date : now;
        const smaller = now < date ? now : date;
        const totalSeconds =  Math.floor((bigger.getTime() - smaller.getTime()) / SECOND);
        const days = Math.floor(totalSeconds / DAY);
        let reminder = totalSeconds - days * DAY;
        const hours = Math.floor(reminder / HOUR);
        reminder -=  hours * HOUR;
        const minutes =  Math.floor(reminder / MINUTE);
        const seconds = reminder - minutes * MINUTE;

        return {
            days: days>9 ? `${days}` : `0${days}`,
            hours:hours>9 ? `${hours}` : `0${hours}`,
            minutes:minutes>9 ? `${minutes}` : `0${minutes}`,
            seconds:seconds>9 ? `${seconds}` : `0${seconds}`,
        }
    }

    setup = (props) => {
        const { lastConfirmationDate, startDate, endDate, participants, minParticipants, additionalItems } = props.event;
        this.lastConfirmationDateOver = lastConfirmationDate < new Date();
        this.eventTime = startDate < new Date() & new Date() < endDate;
        this.eventIsOver = endDate < new Date();
        this.eventOn = participants.length >= minParticipants;

        const compareDate = !this.lastConfirmationDateOver ? lastConfirmationDate :
            (!this.eventTime && !this.eventIsOver ? startDate : endDate);
        const { days, hours, minutes, seconds } = this.getDateParts(compareDate);

        let selectedItem=null;
        if (additionalItems.length>0) {
            const allItems = additionalItems.split('|');
            participants.forEach(({additionalItem}) => {
                const index = allItems.findIndex((item => item === additionalItem));
                if (index >= 0) {
                    allItems.splice(index, 1);
                }
            });

            if (allItems.length > 0) {
                this.allItems = allItems;
                selectedItem = allItems[0];
            }
        }

        this.calendarEvent = {
            title: props.event.title,
            description: props.event.description,
            location: props.event.location,
            startTime: props.event.startDate.toISOString(),
            endTime: props.event.endDate.toISOString(),
        };
        return {
            days, hours, minutes, seconds, selectedItem
        };
    }
    constructor(props) {
        super(props);
        this.backgroundImage = `url(${props.event.imageUrl ||  `backgroundImage1.jpg`})`;
        this.state = this.setup(props);

        setInterval(()=>{
            this.setState(this.setup(props))
        },1000)
    }

    attendOrUnattend = (attending, eventId)=>{
        if (attending){
            return this.props.unattend(eventId)
        }else{
            return this.props.attend(eventId, this.state.selectedItem)
        }
    };
    onItemSelected = ({value: selectedItem})=>{
        this.setState({selectedItem })
    };

    edit = (event)=>{
        this.setState({showMenu: false })
        this.props.edit(event)
    };
    logout = ()=>{
        this.setState({showMenu: false })
        this.props.logout()
    };
    goHome = ()=>{
        this.setState({showMenu: false })
        this.props.goHome()
    };
    onThumbUpClick = async (userId, alreadyPressed) => {
       const {event: {id: eventId}} = this.props;
       this.props.onThumbUpClick(eventId, userId, alreadyPressed);
    };
    onThumbDownClick = async (userId, alreadyPressed) => {
        const {event: {id: eventId}} = this.props;
        this.props.onThumbDownClick(eventId, userId, alreadyPressed);
    };
    getHeader = ()=>{

        const { event, user } = this.props;
        const isCreator = event.creatorId === user.id;

        const menuItems = [];

        if (isCreator && !this.lastConfirmationDateOver){
            menuItems.push(<MenuItem key="menuItem1" onClick={()=>this.edit(event)}>Edit</MenuItem>)
        }

        menuItems.push(<MenuItem key="menuItem2" onClick={this.goHome}>Home</MenuItem>);
        menuItems.push(<MenuItem key="menuItem3" onClick={this.logout}>Logout</MenuItem>);

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



            <span id="app-header-text">ImIN</span>
        </div>
    };

    render() {
        const { event, user } = this.props;
        const isCreator = event.creatorId === user.id;

        const header = this.getHeader();

        const attending = event.participants.some(participant => participant.id === user.id);
        const eventDay = days[event.startDate.getDay()];

        const eventDate = `${event.startDate.getDate()}/${event.startDate.getMonth() +1}/${event.startDate.getFullYear()}`;
        const hours = `${event.startDate.getHours()}`;
        const minutes = `${event.startDate.getMinutes()}`;
        const eventTime = `${hours.length===1 ? '0':''}${hours}:${minutes.length===1 ? '0':''}${minutes}`;
        const style = {
            backgroundImage: this.backgroundImage,
        };

        const creator = event.participants.find(participant => participant.id === event.creatorId);
        const creatorImage = creator ? creator.imageUrl : null;
        const totalParticipants = event.participants.length;
        const participants = event.participants.slice(0,4).map((participant,index)=>{
            return <img alt="" className={`event-participantImage event-participantImage${index+1}`} src={participant.imageUrl} key={`event${event.id}_participant${participant.id}`}/>
        });
        if (participants.length < totalParticipants){
            const more = totalParticipants - participants.length;
            participants.push(<div className="more-participants-circle"> +{more}</div>)
        }
        const maxParticipants = event.maxParticipants;
        const rankingStage = isCreator && this.eventIsOver;
        const allParticipants = event.participants.map((participant,index)=>{
            const eventCreator = participant.id === creator.id;
            const thumbUpPressed = rankingStage && participant.thumb === 1;
            const thumbDownPressed = rankingStage && participant.thumb === -1;
            const buttonMode = rankingStage && !eventCreator && index < maxParticipants;
            const colloredThumb = !rankingStage || eventCreator || index >= maxParticipants;
            return (<div className="event-page-all-participant-item row" key={`event${event.id}_all_participant${participant.id}`}>
                {index === maxParticipants && (
                    <div className="col-xs-12 line" >
                        <u>standby</u>
                    </div>
                )}
                <div className="col-xs-4" >
                    <img alt="" className="event-page-all-participant-item-image" src={participant.imageUrl} />
                </div>
                <div className="col-xs-5 event-page-all-participant-item-name" >
                    <div> {participant.firstName} {participant.familyName}</div>
                    <span className="participant-additional-item" >{participant.additionalItem && participant.additionalItem.length>0 ? ` (${participant.additionalItem})`:''}</span>
                </div>
                <div className="col-xs-3 thumbs-div row" >
                    <div className="col-xs-6" >
                        <div className={buttonMode ?'ranking-button-mode':''} onClick={buttonMode ? ()=>this.onThumbUpClick(participant.id, thumbUpPressed) : ()=>{}} ><img alt="thumbsUp" className="thumbs-image" src={colloredThumb || thumbUpPressed ?"thumb_up.png": "thumb_up_gray.png"} /></div>
                        <div className="thumbs-text" >  {participant.thumbsUp}</div>
                    </div>
                    <div className="col-xs-6" >
                        <div className={buttonMode ?'ranking-button-mode':''} onClick={buttonMode ? ()=>this.onThumbDownClick(participant.id, thumbDownPressed) : ()=>{}}><img alt="thumbsDown" className="thumbs-image" src={colloredThumb || thumbDownPressed ? "thumb_down.png" : "thumb_down_gray.png"} /></div>
                        <div className="thumbs-text">  {participant.thumbsDown}</div>
                    </div>
                </div>
            </div>)
        });

        const showDropbox =  this.allItems && !attending;

        const dropdown = !showDropbox ? <span/> : (
                <select id="Dropdown" value={this.state.selectedItem}
                        onChange={(e) => this.setState({selectedItem: e.target.value})}>

                    {this.allItems.map((item,index)=>{
                        return  <option key={`${item}_${index}`} value={item}>{item}</option>
                    })}
                </select>
            )



        return (
            <div id="container">
                {header}
                <div id="event-image-title-and-timer" className="event-image-title-and-timer" style={style}>
                    <div className="row">
                        <div className="col-xs-8 event-page-title">
                            <div>{event.title}</div>
                            <div  className="event-page-description">{event.description}</div>

                        </div>
                        <div className="col-xs-1">

                        </div>
                        <div className="col-xs-3">
                            { creatorImage &&  <img alt="" className="event-image-creator-image" src={creatorImage}/> }
                        </div>
                    </div>
                    <div className="row timer-div">

                        <div className="col-xs-2 event-timer-item">

                            <span className="event-timer-number">{this.state.days}</span> <br/>
                            <span className="event-timer-title">days</span>
                        </div>
                        <div className="col-xs-2 event-timer-item">
                            <span className="event-timer-number">{this.state.hours}</span> <br/>
                            <span className="event-timer-title">hours</span>
                        </div>
                        <div className="col-xs-2 event-timer-item">
                            <span className="event-timer-number">{this.state.minutes}</span> <br/>
                            <span className="event-timer-title">minutes</span>
                        </div>
                        <div className="col-xs-2 event-timer-item">
                            <span className="event-timer-number">{this.state.seconds}</span> <br/>
                            <span className="event-timer-title">seconds</span>
                        </div>
                        <div className="col-xs-12 timer-purpose-div">
                            <span className="timer-purpose-text"> {
                                !this.lastConfirmationDateOver ? 'To approve attending':
                                    ( !this.eventTime && !this.eventIsOver ? 'till event' : (this.eventTime ? 'till event ends': 'since event ended'))

                            }</span> <br/>

                        </div>
                        <div id="event-participants">
                            {participants}
                        </div>
                    </div>


                </div>

                <div id="event-details-div">
                    <div id="event-date-text">
                       <DateRangeIcon/> {eventDay}, {eventDate} {eventTime}
                    </div>
                    <div id="event-location-text">
                       <LocationOnIcon/> {event.location}
                    </div>
                    { showDropbox &&
                        <div id="event-dropdown-div">
                            <AppsIcon/> select one: {dropdown}
                        </div>
                    }

                    {
                        !this.lastConfirmationDateOver ?
                        (<button className="approve-button approval-mode" onClick={()=>this.attendOrUnattend(attending, event.id)} >{attending ? "I'M OUT": "I'M IN"}</button>) :
                        ( (!this.eventTime && !this.eventIsOver) ? (<div id="is-event-on-text"  className={this.eventOn ?'event-on':'event-canceled'}>{this.eventOn ? "IT IS ON!" : "EVENT CANCELED.."} </div>) :
                        ( this.eventTime ? (<div id="is-event-on-text"  className={this.eventOn ?'event-ongoing':'event-canceled'}>{this.eventOn ? "EVENT ONGOING" : "EVENT CANCELED.."} </div>):(<div id="is-event-on-text"  className={this.eventOn ?'event-over':'event-canceled'}>{this.eventOn ? "EVENT OVER" : "EVENT CANCELED.."} </div>)))

                    }




                    <div id="event-all-participants">

                        <u>participants:</u><br/>
                        {allParticipants}
                    </div>
                     <div id="add-to-my-calendar">  <AddToCalendar event={this.calendarEvent}/></div>

                    {
                       navigator.share &&
                        <button id="share-button" onClick={()=>navigator.share({
                            title: 'ImIN',
                            text: `${event.title} - ${event.description}, ${event.location}, ${event.startDate}`,
                            url: `https://im-in.herokuapp.com?eventId=${event.id}`
                        })} >Share Event</button>
                    }



                </div>
            </div>
        );

    }
}

export default GroupPage;

