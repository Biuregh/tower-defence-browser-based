
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
    "basic-tower":{type: "basic", range: 2, damage: 3, healingtime: 3, level: 1 , emoji:"🏹"},
    //"tangle-tower":{type: "tangle", range: 3, damage: 0, healingtime: 5, level: 1, emoji:"⏳"},
    "sniper-tower":{type: "sniper", range: 4, damage: 3, healingtime: 3, level: 1, emoji:"🚀"}
}


/*---------------------------- Variables (state) ----------------------------*/
let difLevel = enemypath.easy;
let selectedTower = null;
let playerLives = 3;
let coin = 500;
let baseLevel=1;
let enemies= [];
let waveIsGoing = false;
let timerInterval;
let survivalTime = 0;
let timerOn = true;
/*------------------------ Cached Element References ------------------------*/
const gameArea = document.getElementById("game-area");
const basicTower = document.getElementById("basic-tower");
const tangleTower= document.getElementById("tangle-tower");
const sniperTower = document.getElementById("sniper-tower");
const updateButton = document.getElementById("update");
const baseUpdateBtn= document.getElementById("base-update-btn");
const baseLevelDisplay = document.getElementById("base-level");
const survivalTimeEl = document.getElementById("timer");
const restartButton = document.getElementById("restart-btn");
const difficultySelect = document.getElementById("difficulty-select");
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
        this.eHlth= baseLevel *20;
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

    damage(amount) {
        if (!this.alive) return;
        this.eHlth -= amount;
        if (this.healthDisplay) {
            this.healthDisplay.textContent = this.eHlth;
        }
        if (this.eHlth <= 0) {
            this.alive = false;
            coin += baseLevel * 3;
            updateCoin();
            if (this.domElement && this.domElement.parentElement) {
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
        document.getElementById("game-over").style.display = "block";
        survivalTime = 0
        timerOn =false;

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
    const enemyContainer = document.createElement("div");
    enemyContainer.classList.add("enemy-div");
    const healthDisplay = document.createElement("div");
    healthDisplay.classList.add("enemy-health");
    healthDisplay.textContent = newEnemy.eHlth;
    const enemyDiv = document.createElement("div");
    enemyDiv.classList.add("enemy");
    enemyDiv.textContent = "🧟‍♂️";
    enemyContainer.appendChild(healthDisplay);
    enemyContainer.appendChild(enemyDiv);
    cell.appendChild(enemyContainer);
    newEnemy.domElement = enemyContainer; //inside enemy object saves enemy's element
    newEnemy.healthDisplay=healthDisplay//inside enemy object saves enemy's health element
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
};

//timer format
const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

//timer
const updateSurvivalTime = () => {
    if(timerOn){
        survivalTime++; 
        survivalTimeEl.textContent = formatTime(survivalTime);
    }

};

//restart
const restartGame = () => {
    document.querySelectorAll(".cell").forEach(cell =>{
        cell.className = "cell";
    })
    // Reset variables
    playerLives = 3;
    coin = 500;
    baseLevel = 1;
    survivalTime = 0; 
    enemies = [];
    Object.keys(placedTowers).forEach(tower => delete placedTowers[tower]);
    waveIsGoing = false;
    timerOn = true; 
    // Clean up grid cells
    document.querySelectorAll(".cell").forEach(cell => {
        cell.className = "cell";;
        cell.textContent = "";  // Clear the towers from the grid
        cell.classList.remove("has-tower");
        cell.classList.remove("enemy-path");
    });
    // Reset the enemy path
    difLevel.forEach(([row, col]) => {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add("enemy-path");
    });
    // Reset the base button and level
    baseLevelDisplay.textContent = `Level ${baseLevel}`;
    showBaseUpgradeCost();
    // Hide game over
    document.getElementById("game-over").style.display = "none";
    // Re-start intervals
    clearInterval(moveInterval);  
    clearInterval(enemyInterval);  
    clearInterval(timerInterval);  
    // Start new intervals
    moveInterval = setInterval(moveEnemies, enemyMoveInterval());
    enemyInterval = setInterval(generateEnemy, 3000);
    // Start the timer interval once
    timerInterval = setInterval(updateSurvivalTime, 1000);
    // Start the tower attack interval
    setInterval(towerAttack, 1000);
    // Reset UI elements
    updateCoin();
    updateLives();
};


//base upgrade
const baseUpgradeCost=() => baseLevel * 120;

//base upgrade cost display
const showBaseUpgradeCost = () =>{
    const cost = baseUpgradeCost();
    baseUpdateBtn.textContent = `⬆️ ${cost} 🟡`
}

//enemy move
const enemyMoveInterval = ()=>{
    let normTime = 1000;
    if(difLevel === enemypath.medium) normTime -= 10;
    else if(difLevel === enemypath.hard) normTime -=20;
    const finalTime = Math.floor(normTime - baseLevel * 5)
    return Math.max(200, finalTime);
}

//difficalty level
difficultySelect.addEventListener("change", (event) => {
    const selected = event.target.value;
    if(selected === "easy"){
        difLevel = enemypath.easy;
    } else if(selected === "medium"){
        difLevel = enemypath.medium;
    } else if(selected === "hard"){
        difLevel = enemypath.hard;
    }
    document.querySelectorAll(".cell").forEach(cell=> {
        cell.classList.remove("enemy-path");
    });
    difLevel.forEach(([row, col]) =>{
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if(cell) cell.classList.add("enemy-path");
    });
    restartGame();
});



updateCoin();
showBaseUpgradeCost();
updateLives();
let moveInterval = setInterval(moveEnemies, enemyMoveInterval());
let enemyInterval = setInterval(generateEnemy, 3000);
setInterval(updateSurvivalTime, 1000);

setInterval(towerAttack, 1000); 

/*----------------------------- Event Listeners -----------------------------*/

//select tower to dragac
Object.keys(towerType).forEach(type => {
    console.log(type);
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
    const position = `${event.target.dataset.row},${event.target.dataset.col}`; 
    placedTowers[position] = tower;
})

//not enough coins
function notEnoughCoins() {
    const counter = document.getElementById("coin-p");
    counter.classList.add("highlight");
  
    setTimeout(() => {
      counter.classList.remove("highlight");
    }, 1000);
  }

//base level incrrease
baseUpdateBtn.addEventListener("click", ()=>{
    const cost = baseUpgradeCost();
    if(coin >= cost){
        coin -= cost;
        baseLevel++;
        updateCoin();
        baseLevelDisplay.textContent =`Level ${baseLevel}`;
        showBaseUpgradeCost();
    }else{
        notEnoughCoins();
    }
});

//reset button
restartButton.addEventListener("click", restartGame);
