import React from 'react'

const RedBubbleButton = (props) => {

    return (
        <button {...props} className={`${props.className} confetti-button confetti-button-red`} onClick={(e)=>{
            e.preventDefault();
            //reset animation
            try {
                e.target.classList.remove('animate');
            } catch (e) {
            }

            try {
                e.target.classList.add('animate');
            } catch (e) {
            }
            setTimeout(function(){
                try {
                    e.target.classList.remove('animate');
                } catch (e) {
                }
            },700);
            setTimeout(function(){
                try {
                    props.onClick(e);
                } catch (e) {
                }
            },500);

        }} > {props.children}</button>
    )
}

export default RedBubbleButton;
