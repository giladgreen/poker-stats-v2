const body = document.getElementsByTagName('body')[0];
const windowWidth = window.innerWidth || document.documentElement.clientWidth || body.clientWidth;
const Width = windowWidth;
const Height = window.innerHeight || document.documentElement.clientHeight ||  body.clientHeight;
const SmartPhone = (Width<600);

export default {
    Width:Width,
    Height:Height,
    SmartPhone:SmartPhone
}
