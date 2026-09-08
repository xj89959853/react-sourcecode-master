const ReactSharedInternals:any={
    H:null
}

function useState(initialState:any){
    return ReactSharedInternals.H.useState(initialState);
}
function useEffect(create:()=>(()=>void|void),createDeps?:any[]){
    ReactSharedInternals.H.useEffect(create,createDeps);
}
const version = '1.0.0';
export {version,useState,useEffect,ReactSharedInternals};
