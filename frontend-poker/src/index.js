import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { transitions, positions, Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';

import './style/bootstrap.css';
import './style/loader.css';
import './style/index.css';
import './style/login.css';
import './style/create-event-form.css';
import './style/event-page.css';
import './style/groups.css';
import './style/create-group-form.css';
import './style/group-page.css';
import './style/game.css';
import './style/onGoingGame.css';
import './style/chart.css';
import './style/introjs.min.css';
import './style/introjs-nazanin.css';
import './style/intro.css';
import './style/image-uploader.css';
import './style/images.css';
import './style/image-data.css';
import './style/image-slider.css';

const options = {
    // you can also just use 'bottom center'
    position: positions.BOTTOM_CENTER,
    timeout: 3000,
    offset: '30px',
    // you can also just use 'scale'
    transition: transitions.SCALE
}

const Root = () => (
    <AlertProvider template={AlertTemplate} {...options}>
        <App />
    </AlertProvider>
)


ReactDOM.render(
    <Root/>,
  document.getElementById('root')
);
