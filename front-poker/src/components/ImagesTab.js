
import React, { Component } from 'react';
import ImageData from './ImageData';
import ImageUploader from "./ImageUploader";
import postImage from "../actions/postImage";

class ImagesTab extends Component {

    constructor(props) {
        super(props);
        this.state = { selectedImage: null, showImageUploader: false };
    }

    showImageUploaderForm = ()=>{
       this.setState({ showImageUploader: true});
    }

    hideImageUploaderForm = ()=>{
        this.setState({ showImageUploader: false});
    }

    enterImagePage = (image) =>{
        this.setState({selectedImage:image});
    }

    closeImagePage = () =>{
        this.setState({selectedImage:null});
    }

    uploadImage = async (image, tags) =>{
        return postImage(image, tags, false, this.props.provider, this.props.token);
    }

    render() {
        const { group } = this.props;
        if (this.state.selectedImage){
            return <ImageData group={group}
                              close={this.closeImagePage}
                              user={this.props.user}
                              {...this.state.selectedImage}
                              provider={this.props.provider}
                              removeImage={this.props.removeImage}
                              token={this.props.token}/>
        }
        if (this.state.showImageUploader){

            return <ImageUploader group={group}  close={this.hideImageUploaderForm} uploadImage={this.uploadImage} updateImage={this.props.updateImage}/>
        }


        const {images} = group;
        const IMAGES = images.map((image) => {
            return (
                <div key={`${image.id}`} className="image-item-div" onClick={()=>{this.enterImagePage(image)}}>
                    <img key={`${image.id}__`} className="image-item-div-innerimg" alt={`uploaded by ${image.uploadedByName}`} src={image.image}/>
                </div>
            );
        })

        return <div className="row">
            <div className="col-xs-6">
                <div className="image-item-div"
                     onClick={this.showImageUploaderForm}>
                    <img src="plus.png" key="plus" className="image-item-div-plus-sign"/>

                </div>
            </div>
            {IMAGES}
        </div>;

    }
}

export default ImagesTab;

