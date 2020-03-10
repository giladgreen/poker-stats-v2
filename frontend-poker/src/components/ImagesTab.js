import React, { Component } from 'react';

class ImagesTab extends Component {

    constructor(props) {
        super(props);
        this.state = { }
    }

    showCreateImage = () =>{
        this.setState({ showCreateImage: true });
    }

    render() {
        const { group } = this.props;
        const {images} = group;
        const IMAGES = images.map((image) => {
            return (
                <div key={image.id} className="image-item-div" >
                    <img className="image-item-div-innerimg" alt={`uploaded by ${image.uploadedBy}`} src={image.image}/>
                </div>
            );
        });

        return <div className="row">
            <div className="col-xs-6">
                <div className="image-item-div plus-sign"

                     onClick={this.showCreateImage}>
                    +
                </div>
            </div>
            {IMAGES}
        </div>;

    }
}

export default ImagesTab;

