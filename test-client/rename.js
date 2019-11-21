const fs = require('fs');
console.log('renaming output files:')


function rename(path){
    const files = fs.readdirSync(path).filter(filename=> filename.indexOf('main.css')!==0 && filename.indexOf('main.js')!==0);
    console.log('files',files);

    files.forEach(file=>{
        const target = `main${file.substring(13)}`;
        fs.rename(`${path}/${file}`, `${path}/${target}`, function(err) {
            if ( err ) {
                console.log('ERROR: ' + err);
            } else{
                console.log(`file renamed from ${file} to ${target}`)
            }
        });
    })

}
rename('./build/static/css');
rename('./build/static/js');

