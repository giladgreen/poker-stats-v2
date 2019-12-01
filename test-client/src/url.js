let URL_PREFIX = `${window.location.href}api/v2`;
if (URL_PREFIX.includes(':3000')){
    URL_PREFIX= URL_PREFIX.replace(':3000', ':5000')
}
console.log('URL_PREFIX',URL_PREFIX)
export default URL_PREFIX;
