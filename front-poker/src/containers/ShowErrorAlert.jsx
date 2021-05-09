import React from 'react'
import { useAlert } from 'react-alert'

const ShowErrorAlert = (props) => {
    const alert = useAlert();
    const {message} = props;
    setTimeout(()=>{
            alert.error(message);
    },1);
    return (
        <div/>
    )
}

export default ShowErrorAlert;
