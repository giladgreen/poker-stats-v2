import React, { Component } from 'react';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuIcon from '@material-ui/icons/Menu';
import TagsInput from 'react-tagsinput'
import DatesHelper from '../datesHelper'

import {
    MuiPickersUtilsProvider,
    KeyboardTimePicker,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import { Grid, TextField } from '@material-ui/core';

const { dateToString, addSeconds, addHours } = DatesHelper;


class NewEventForm extends Component {

    constructor(props) {
        super(props);
        const event = props.event || {
            title: '',
            description: '',
            location: '',
            startDate: addHours(new Date(), 5),
            endDate: null,
            lastConfirmationDate: null,
            imageUrl: null,
            minParticipants: 2,
            maxParticipants: 8,
            additionalItems: '',
        };

        const duration = props.event && props.event.endDate ?  Math.floor((props.event.endDate.getTime() - props.event.startDate.getTime())/(1000*60*60)) : 4;

        const additionalItems = !event.additionalItems || event.additionalItems.length === 0 ? [] : event.additionalItems.split('|');
        this.state = {
            showMenu:false,
            additionalItems,
            error: null,
            duration,
            hours_timer: 2,
            minutes_timer: 30,
            startDateTime:  event.startDate,
            event,
            update: Boolean(event.id)
        };
    }

    handleAdditionalItemChange = (additionalItems) => {
        this.setState({ additionalItems });
    };


    handleEventItemChange = (attributeName, newValue) => {
        const event = { ...this.state.event, [attributeName]: newValue };
        this.setState({ event });
    };

    handleStartDateChange = (date) => {
        const startDate = dateToString(date, this.state.startDateTime );
        const event = { ...this.state.event, startDate };
        this.setState({ event, startDateTime: startDate });
    };

    handleStartDateTimeChange = (timeDate) => {
        const startDateTime = dateToString(this.state.event.startDate, timeDate );
        const event = { ...this.state.event, startDate: startDateTime };
        this.setState({ startDateTime,event });
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
        this.props.delete(this.state.event.id)
    };

    goToEvent = () => {
        this.setState({showMenu: false});
        window.location.replace(`https://im-in.herokuapp.com?eventId=${this.state.event.id}`);
    };

    getHeader = ()=>{

        {this.state.pushSupported && <div id="notification">
            <span onClick={this.onNotificationButtonClick}><u> <b>{ this.state.subscribed ? 'disable':'enable'} notifications</b></u></span>
        </div>}

        const menuItems = [];

        menuItems.push(<MenuItem key="menuItem1" onClick={this.cancel}>Cancel</MenuItem>)
        if (this.state.update){
            menuItems.push(<MenuItem key="menuItem2" onClick={this.publishOrUpdate}>Update</MenuItem>)
            menuItems.push(<MenuItem key="menuItem3" onClick={this.delete} >Delete</MenuItem>)
            menuItems.push(<MenuItem key="menuItem4" onClick={this.goToEvent} >Open Event</MenuItem>)
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



            <span id="app-header-text">ImIN</span>
        </div>
    };

    publishOrUpdate = () => {
        this.setState({showMenu: false});
        const startDate = dateToString(this.state.event.startDate, this.state.startDateTime);
        const endDateObj=addHours(this.state.event.startDate, this.state.duration);
        const endDate = dateToString(endDateObj, endDateObj);

        const seconds = (60 * parseInt(this.state.minutes_timer,10)) + (60 * 60 *  parseInt(this.state.hours_timer,10));

        const lastConfirmationDateObj = addSeconds((new Date()), seconds);
        const lastConfirmationDate = dateToString(lastConfirmationDateObj,lastConfirmationDateObj);


        const event = {
            title: this.state.event.title,
            description: this.state.event.description,
            location: this.state.event.location,
            startDate,
            endDate,
            minParticipants: parseInt(this.state.event.minParticipants,10),
            maxParticipants: parseInt(this.state.event.maxParticipants,10),
            additionalItems: this.state.additionalItems.length ===0 ? '' : this.state.additionalItems.join('|'),
        };

        if (this.state.update){
            event.id = this.state.event.id;
            this.props.update(event);
        } else {
            event.lastConfirmationDate = lastConfirmationDate
            this.props.publish(event);
        }

    }


    render() {
        const header = this.getHeader();
        const seconds = (60 * parseInt(this.state.minutes_timer,10)) + (60 * 60 *  parseInt(this.state.hours_timer,10));

        const lastConfirmationDateObj = addSeconds((new Date()), seconds);

        const ilegalStartDate = this.state.event.startDate < lastConfirmationDateObj;
        const ilegalMinMax = this.state.event.minParticipants > this.state.event.maxParticipants;

        const formLegal = this.state.event.title.length > 0 &&
            this.state.event.location.length > 0 &&
            this.state.event.startDate &&
            !ilegalMinMax &&
            !ilegalStartDate;

        return (
            <div id="create-event-form container">
                {header}
                <div id="create-event-form-wrapper">
                    <div className="row">
                        <span className="new-event-form-item-label">Title*</span>
                    </div>
                    <div className="row">
                        <input type="text" placeholder="Enter event name" id="newEventTitle" className="formTextInput-full-width" value={this.state.event.title} onChange={(e) => this.handleEventItemChange('title', e.target.value)} />
                    </div>
                    <div className="row">
                        <span className="new-event-form-item-label">Description</span>
                    </div>
                    <div className="row">
                        <input type="text" placeholder="Enter description" id="newEventDescription" className="formTextInput-full-width" value={this.state.event.description} onChange={(e) => this.handleEventItemChange('description', e.target.value)} />
                    </div>
                    <div className="row">
                        <div className="col-xs-5">
                            <span className="new-event-form-item-label">Min Participants</span>
                        </div>
                        <div className="col-xs-1">
                            <span className="white">________</span>
                        </div>
                        <div className="col-xs-5">
                            <span className="new-event-form-item-label">Max Participants</span>
                        </div>
                    </div>
                    <div className={`row ${ilegalMinMax ? 'red-border':''}`}>
                        <div className="col-xs-5">
                            <input type="number" min="1" max="1000" className="formNumberInput-half-width" value={this.state.event.minParticipants} onChange={(e) => this.handleEventItemChange('minParticipants', e.target.value)} />
                        </div>
                        <div className="col-xs-1">
                            <span className="white">_______</span>
                        </div>
                        <div className="col-xs-5">
                            <input type="number" min={this.state.event.minParticipants} max="1000" className="formNumberInput-half-width" value={this.state.event.maxParticipants} onChange={(e) => this.handleEventItemChange('maxParticipants', e.target.value)} />
                        </div>
                    </div>
                    {ilegalMinMax && <div className='red-text'>min value can't be bigger the max value</div>}

                    <div className="row">
                        <span className="new-event-form-item-label">Location*</span>
                    </div>
                    <div className="row">
                        <input type="text" placeholder="Enter event location" id="newEventLocation" className="formTextInput-full-width locationInput" value={this.state.event.location} onChange={(e) => this.handleEventItemChange('location', e.target.value)} />
                    </div>

                    <div className={`row ${ilegalStartDate ? 'red-border':''}`}>

                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <Grid container justify="space-between" alignItems='baseline'>
                                <KeyboardDatePicker
                                    margin="normal"
                                    id="date-picker-dialog"
                                    label="Date"
                                    format="MM/dd/yyyy"
                                    value={this.state.event.startDate}
                                    onChange={this.handleStartDateChange}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                    style={{ width: '42%' }}
                                />
                                <KeyboardTimePicker
                                    margin="normal"
                                    id="time-picker"
                                    label="Time"
                                    value={this.state.startDateTime}
                                    onChange={this.handleStartDateTimeChange}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change time',
                                    }}
                                    style={{ width: '38%' }}
                                />
                                <TextField
                                    id="standard-number"
                                    label="Duration"
                                    type="number"
                                    value={this.state.duration}
                                    onChange={(e) => this.setState({ duration: e.target.value })}
                                    style={{ width: '10%' }}
                                />
                            </Grid>
                        </MuiPickersUtilsProvider>

                    </div>
                    {ilegalStartDate && <div className='red-text'>event must start after confirmation phase is over</div>}
                    {!this.state.update &&
                    <div className="row">
                        <span className="new-event-form-item-label small-top-margin">Timer</span>
                    </div>}
                    {!this.state.update &&
                    <div className="row">
                        <div className="col-xs-3">
                            <input className="formNumberInput-third-width paddingLeft"

                                       type="number"
                                       value={this.state.hours_timer}
                                       onChange={(e) => this.setState({ hours_timer: e.target.value })}
                            /><br/>
                            <span className="new-event-form-item-label new-event-form-item-label-left-padding">hours</span>
                        </div>

                        <div className="col-xs-3 paddingLeft marginLeft">
                            <input className="formNumberInput-third-width paddingLeft "

                                       type="number"
                                       value={this.state.minutes_timer}
                                       onChange={(e) => this.setState({ minutes_timer: e.target.value })}
                            /><br/>
                            <span className="new-event-form-item-label new-event-form-item-label-left-padding">minutes</span>
                        </div>


                    </div>}


                    <div className="row">
                        <span className="new-event-form-item-label small-top-margin">Additional Items</span>
                    </div>
                    <div className="row">
                        <TagsInput placeholder="Add items"
                                   value={this.state.additionalItems}
                                   onChange={this.handleAdditionalItemChange} />
                    </div>
                    <div className="row top-margin">
                        <button className="publish-button" onClick={this.publishOrUpdate} disabled={!formLegal}>{this.state.update ? 'UPDATE' : 'PUBLISH'}</button>
                    </div>
                    {this.state.update ? (<div className="row">
                        <button className="delete-button" onClick={() => this.props.delete(this.state.event.id)} >DELETE</button>

                    </div>) : <div />}
                    {this.state.update ? (<div id="event-link">
                        <a href={`https://im-in.herokuapp.com?eventId=${this.state.event.id}`} > open event </a>
                    </div>) : <div />}



                </div>
            </div>
        );

    }
}

export default NewEventForm;

