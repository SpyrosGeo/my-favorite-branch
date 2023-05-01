const {exec} = require('child_process');
const path  = require('path');
const workingDir = path.resolve( process.cwd());
console.log('working',workingDir)
 export default async function lel(){
     exec('git branch --show-current',(error:any,stdout:any,stderr:any)=>{
        if(error){
            console.error(`exec error:${error}`);
            return;
        }
        console.log(stdout)
    });
}