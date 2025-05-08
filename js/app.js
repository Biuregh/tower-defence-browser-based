/*-------------------------------- Constants --------------------------------*/
const gridSize = 10;
const enemypath ={
    easy: [
        [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], 
        [2, 4], [3, 4], [4, 4], [5, 4], [6, 4],
        [7, 4], [8, 4], [8, 5], [8, 6], [8, 7], 
        [8, 8], [8, 9]
    ],
    medium: [
        [1, 0], [1, 1], [2, 1], [2, 2], [2, 3], 
        [3, 3], [4, 3], [4, 4], [5, 4], [5, 5], 
        [6, 5], [6, 6], [7, 6], [8, 6], [8, 7], 
        [8, 8], [8, 9]
    ],
    hard: [
        [1, 0], [1, 1], [2, 1], [2, 2], [3, 2], 
        [3, 3], [4, 3], [4, 4], [5, 4], [5, 5], 
        [6, 5], [6, 6], [7, 6], [7, 7], [8, 7], 
        [8, 8], [8, 9]
    ]
}
const placedTowers={};
const towerType={
    "basic-tower":{type: "basic", range: 2, damage: 3, healingtime: 3, level: 1 , emoji:"💣"},
    "tangle-tower":{type: "tangle", range: 3, damage: 0, healingtime: 5, level: 1, emoji:"🏰"},
    "sniper-tower":{type: "sniper", range: 8, damage: 3, healingtime: 3, level: 1, emoji:"🚀"}
}

/*---------------------------- Variables (state) ----------------------------*/
let difLevel = enemypath.easy;
let selectedTower = null;

/*------------------------ Cached Element References ------------------------*/
const gameArea = document.getElementById("game-area");
const basicTower = document.getElementById("basic-tower");
const tangleTower= document.getElementById("tangle-tower");
const sniperTower = document.getElementById("sniper-tower");
const updateButton = document.getElementById("update");
/*--------------------------------- Class -----------------------------------*/

class Tower{
    constructor(type, range, damage, healingtime, level){
        this.type=type;
        this.range=range;
        this.damage= damage;
        this.healingtime = healingtime;
        this.level = level;
        this.emoji = this.emoji;
    }
}


/*-------------------------------- Functions --------------------------------*/
//create grid dynamically
for(let row=0; row< gridSize; row++){
    for(let col=0; col<gridSize; col++){
        const cell= document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.row = row;
        cell.dataset.col = col;
        gameArea.appendChild(cell);
    };
};
//enemy's path dynamically
difLevel.forEach(([row, col])=>{
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    cell.classList.add("enemy-path");
});

/*----------------------------- Event Listeners -----------------------------*/

//select tower to drag
Object.keys(towerType).forEach(type => {
    const towerDiv = document.getElementById(type);
    towerDiv.addEventListener("dragstart", event =>{
        event.dataTransfer.setData("tower-id", type)
    })
})

//allows dropping in game area (by defult browser doesn't allow)
gameArea.addEventListener("dragover" , event =>{
    if(event.target.classList.contains("cell")){
        event.preventDefault();
    }
})

//drop tower in grid
gameArea.addEventListener("drop" , event =>{
    if(!event.target.classList.contains("cell")) return;
    event.preventDefault();
    const id=event.dataTransfer.getData("tower-id");
    if(!id || event.target.classList.contains("has-tower") || event.target.classList.contains("enemy-path")) return;
    const {type, range, damage, healingtime, level, emoji} = towerType[id];
    const tower = new Tower(type, range, damage, healingtime, level);
    event.target.textContent = emoji;
    event.target.classList.add("has-tower");
    const position = `${event.target.dataset.row}, ${event.target.dataset.col}`;
    placedTowers[position] = tower;
})