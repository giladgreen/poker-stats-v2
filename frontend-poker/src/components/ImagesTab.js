import React, { Component } from 'react';
import ImageData from './ImageData';
class ImagesTab extends Component {

    constructor(props) {
        super(props);
        console.log('ImagesTab ctor',props)
        this.state = { selectedImage: null}
    }

    showCreateImage = () =>{
        this.setState({ showCreateImage: true });
    };

    render() {
        const { group } = this.props;
        if (this.state.selectedImage){
            const data = {
                group,
                ...this.state.selectedImage
            };
            return <ImageData {...data} />
        }


        const {images} = group;
        const IMAGES = images.map((image) => {
            return (
                <div key={image.id} className="image-item-div" onClick={()=>{this.setState({selectedImage:image})}}>
                    <img className="image-item-div-innerimg" alt={`uploaded by ${image.uploadedBy}`} src={image.image}/>
                </div>
            );
        });

        return <div className="row">
            <div className="col-xs-6">
                <div className="image-item-div"

                     onClick={this.showCreateImage}>
                    <img src="plus.png" className="image-item-div-plus-sign"/>

                </div>
            </div>
            {IMAGES}
        </div>;

    }
}

export default ImagesTab;

