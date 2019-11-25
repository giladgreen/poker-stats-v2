
import React, { Component } from 'react';

export default class Loader extends Component {
    render() {
        const heart =  <i className="emSvgSize em-svg em-hearts"></i>;
        const spade =  <i className="emSvgSizeBigger em-svg em-spades"></i>;
        const diamond =<i className="emSvgSizeBigger em-svg em-diamonds"></i>;
        const club =   <i className="emSvgSizeBigger em-svg em-clubs"></i>;

        return  (
            <div id="loader">
                <div className="loader">
                    <span id="loaderSpan1" className="loaderSpan">{heart}</span>
                    <span id="loaderSpan2" className="loaderSpan">{spade}</span>
                    <span id="loaderSpan3" className="loaderSpan">{diamond}</span>
                    <span id="loaderSpan4" className="loaderSpan">{club}</span>
                </div>
            </div>
        );
    }
}
