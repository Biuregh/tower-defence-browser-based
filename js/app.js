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


/*---------------------------- Variables (state) ----------------------------*/
let difLevel = enemypath.hard;
let selectedTower = null;

/*------------------------ Cached Element References ------------------------*/
const gameArea = document.getElementById("game-area");
const basicTower = document.getElementById("basic-tower");
const tangleTower= document.getElementById("tangle-tower");
const sniperTower = document.getElementById("sniper-tower");

/*--------------------------------- Class -----------------------------------*/

class Tower{
    constructor(type, range, damage, healingtime, level){
        this.type=type;
        this.range=range;
        this.damage= damage;
        this.healingtime = healingtime;
        this.level = level;
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



