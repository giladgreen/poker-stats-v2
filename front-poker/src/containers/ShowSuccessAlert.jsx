import React from 'react'
import { useAlert } from 'react-alert'

const ShowSuccessAlert = (props) => {
    const alert = useAlert();
    const {message} = props;
    setTimeout(()=>{
            alert.success(message);
    },1);
    return (
        <div/>
    )
}

export default ShowSuccessAlert;
