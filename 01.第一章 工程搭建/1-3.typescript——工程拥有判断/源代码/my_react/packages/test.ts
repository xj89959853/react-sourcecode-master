type Person = {
    name: string;
    age: number;
}

const person:Person = {
    name:'John',
    age:20
}

function getPersonName(person:Person){
    console.log(person.name);
}

getPersonName(person);