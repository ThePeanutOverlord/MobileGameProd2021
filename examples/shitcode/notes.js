// html ref https://www.w3schools.com/html/html_intro.asp
// javascript ref https://www.freecodecamp.org/news/what-is-javascript-definition-of-js/ 
console.log("hello world"); //can put semicolons and put multiple stuff on one line
console.log("line1\nline2");
//3 ways for strings:
// "hello" 'hello' `hello`
 
let username = "chicken nuggets";

console.log(`${username} is a stupid name`); //it'll use the variable if you do it with `` and ${}

//VARIABLE DECLARATIONS
let a; //probs most used
var b; //everyone hates her
const c = "no"; //constant duh


//ARRAYS
let arr = [2, "peanut", 3.4, "yeet"]; //can put different stucc of different types in here. also objects

console.log(arr); //can just print arrays
console.log(arr[2]);

// OBJECT
let obj = { //can break object across multiple lines
    x: 100,
    y: 100,
    name: "magic potato",
    hp: 10,

    attack: function(){
        console.log(`${this.name} attacked enemy`);
    }

}

console.log(obj);

obj.attack();
obj.y = 25;     //these are the same thing
obj["y"] = 25;  //. and [] are registered the same
//LOOPS ARE SAME AS C++ MOSTLY
for(let i = 0; i < 10; i++){
    console.log(i);
}

//FUNCTIONS
function dothing(stuff){
    return `did ${stuff}`;    
}

console.log(dothing("things"));

let f = function(){ 
    console.log("f's in the chat pls");
}

f();

function runonall(arr, func){ //you can send functions to things
    for(let i = 0; i < arr.length; i++){
        func(arr[i]);
    }
}
//ANONYMOUS FUNCTIONS
runonall([1,2,3,4], function(x){//anon functions: functios with no name. this function being called will be deleted afterword
    console.log(`x=${x}`) //anon function def
}
);

//LAMBDA/ARROW FUNCTIONS don't have their own scope and use variables that exist outside the function

let x = 10;
let y = 6;
function run(func){
    func();
    func();
}

run(  //lambda/arrow function call
    () => { //this is the stuffs
        x*=2;
        y*=3;
        console.log(`${x}, ${y}`);
    }
);

//CALLBACKS tells to call function after certain thing. used for events. eg: on a click, call this function