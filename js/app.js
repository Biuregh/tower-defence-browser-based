
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
    "sniper-tower":{type: "sniper", range: 4, damage: 3, healingtime: 3, level: 1, emoji:"🚀"}
}
const enemies= [];

/*---------------------------- Variables (state) ----------------------------*/
let difLevel = enemypath.easy;
let selectedTower = null;
let playerLives = 3;
let coin = 50;
let baseLevel=1;

/*------------------------ Cached Element References ------------------------*/
const gameArea = document.getElementById("game-area");
const basicTower = document.getElementById("basic-tower");
const tangleTower= document.getElementById("tangle-tower");
const sniperTower = document.getElementById("sniper-tower");
const updateButton = document.getElementById("update");
/*--------------------------------- Class -----------------------------------*/

class Tower{
    constructor(type, range, damage, healingtime, level, emoji){
        this.type=type;
        this.range=range;
        this.damage= damage;
        this.healingtime = healingtime;
        this.level = level;
        this.emoji = emoji;
    }
}

class Enemy{
    constructor(path, baseLevel){
        this.path =path;
        this.enemyPosition= 0;
        this.row = path[0][0];
        this.col=path[0][1];
        this.eHlth= baseLevel *3;
        this.speed = 500;
        this.alive = true;
        this.justStart=true;
    }

    move(){
        if(!this.alive) return;
        if(this.justStart){
            this.justStart=false;
            return;
        }
        this.enemyPosition++;
        if(this.enemyPosition < this.path.length){
            this.row=this.path[this.enemyPosition][0];
            this.col =this.path[this.enemyPosition][1];
        }
        else{
            this.alive=false;
        }
    }

    damage(amount){
        if(!this.alive) return;
        this.eHlth -= amount;
        if(this.eHlth<=0){
            this.alive=false;
            coin += baseLevel * 3;
            updateCoin();
            if(this.domElement.parentElement){
                this.domElement.remove();
            }
        }
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

//player lives
const updateLives = () =>{
    const livesDisplay = document.getElementById("player-lives");
    livesDisplay.textContent = "❤️".repeat(playerLives);
    if(playerLives <= 0){
        clearInterval(enemyInterval);
        clearInterval(moveInterval);
        alert("game over")
    }
}

//collect coin
const updateCoin=()=>{
    const coinDisplay = document.getElementById("coin");
    coinDisplay.textContent = `💰 ${coin}`
}

//create enemy
const generateEnemy = () =>{
    const newEnemy = new Enemy(difLevel, baseLevel);
    enemies.push(newEnemy);
    const cell = document.querySelector(`[data-row="${newEnemy.row}"][data-col="${newEnemy.col}"]`);
    const enemyDiv = document.createElement("div");
    enemyDiv.classList.add("enemy");
    enemyDiv.textContent = "🧟‍♂️";
    cell.appendChild(enemyDiv);
    newEnemy.domElement = enemyDiv; //inside enemy object saves enemy's element
}

//enemy attacks
const moveEnemies = () =>{
    const aliveEnemies = [];
    enemies.forEach(enemy =>{
        if(!enemy.alive) return;
        const oldCell= document.querySelector(`[data-row="${enemy.row}"][data-col="${enemy.col}"]`);//current cell
        if(enemy.domElement.parentElement === oldCell){
            oldCell.removeChild(enemy.domElement);
        };
        enemy.move();
        if(enemy.alive){
            const newCell = document.querySelector(`[data-row="${enemy.row}"][data-col="${enemy.col}"]`);//get new cell after move
            newCell.appendChild(enemy.domElement);
            aliveEnemies.push(enemy);
        }else{
            if(enemy.enemyPosition === enemy.path.length){
                if(playerLives > 0){
                    playerLives--;
                    updateLives();
                }
            }
            if(enemy.domElement.parentElement){
                enemy.domElement.remove();
            }
        }
    });
    enemies.length=0;
    enemies.push(...aliveEnemies); // spread operator, pushes each item from aliveEnemeies to enemies array
}

//tower attacks
const towerAttack= ()=>{
    for(const position in placedTowers){
        const [row, col] = position.split(",").map(Number);
        const tower = placedTowers[position];
        for(const enemy of enemies){
            const distance=Math.abs(enemy.row-row)+Math.abs(enemy.col-col);
            if(distance > tower.range) continue;//skip if enemy out of range
            if(!enemy.alive) continue;//skip this one and move to the next
            enemy.damage(tower.damage);
        }
    }
}

//const enemyInterval = setInterval(generateEnemy, 3000);
//const moveInterval = setInterval(moveEnemies, 500);
//setInterval(towerAttack, 1000); 

/*----------------------------- Event Listeners -----------------------------*/

//select tower to dragac
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