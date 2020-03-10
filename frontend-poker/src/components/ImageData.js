/* eslint-disable jsx-a11y/img-redundant-alt */

import React, { Component } from 'react';
import ShowErrorAlert from '../containers/ShowErrorAlert';
import ShowSuccessAlert from '../containers/ShowSuccessAlert';

class ImageData extends Component {

    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {

       const { image, group, uploadedBy, playerIds, gameIds, groupIds} = this.props;


        // eslint-disable-next-line
        return (
            <div id="image-uploader">

                <div>
                    <div>
                        choose image:
                    </div>
                    <div>
                        <input type="file" accept=".png,.jpg,.jpeg" id="imgInput" onChange={this.readURL}/>
                    </div>
                    <div>
                        {image && <img alt="image" id='image-uploader-preview' src={image}/>}
                    </div>
                    {!image &&  <div>
                       no image selected yet
                    </div> }
                </div>
                {groupIds.length > 0 && <div> Tagging the group ({groupName})</div>}
                {gameIds.length > 0 && <div> Tagging the game ({gameDate})</div>}
                {playerIds.length > 0 && <div> Tagging players:</div>}
                {tagedPlayers.length > 0 && <div> {tagedPlayers}</div>}
                <hr/>
                {tagPlayers}
                <div>
                    <button className="button" disabled={!image} onClick={this.uploadImage}> Upload </button>
                </div>

                <div>
                    <button className="button" onClick={this.props.close}> cancel </button>
                </div>
                { showError && <ShowErrorAlert message={"failed to upload image"}/>}
                { showSuccess && <ShowSuccessAlert message={"image uploaded successfully"}/>}
            </div>
        );

    }
}

export default ImageData;

