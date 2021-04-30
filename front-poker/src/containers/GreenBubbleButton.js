import React from 'react'
const GreenBubbleButton = (props) => {
    return (
        <button {...props} className={`${props.className} confetti-button confetti-button-green`} onClick={(e)=>{
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

export default GreenBubbleButton;
