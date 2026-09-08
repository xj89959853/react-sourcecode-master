const ReactSharedInternals:any={
    H:null
}

function useState(initialState:any){
    return ReactSharedInternals.H(initialState);
}
const version = '1.0.0';
export {version,useState,ReactSharedInternals};
