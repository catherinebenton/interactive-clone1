
// board
let board;
let boardWidth = window.innerWidth;
let boardHeight = window.innerHeight;
let context;

//bird
let birdWidth = 34; //width/height ratio = 400/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth/8
let birdY = boardHeight/2
let birdImg;

let birdColors = ["red", "blue", "green", "violet", "yellow", "orange", "white", "black"];
let currentBirdColorIndex = 0;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight,
    color : birdColors[currentBirdColorIndex]
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/302/72 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY  = 0; //bird jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;

//bubbles
let bubbleArray = [];
let bubbleSize = 20;

window.onload = function() {
    board = document.getElementById("board")
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing content

    

    //load images
    birdImg = new Image();
    birdImg.src ="img/flappybird.png";
    birdImg.onload = function(){
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);  
    }

    topPipeImg = new Image();
    topPipeImg.src = "img/toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "img/bottompipe.png";


    placePipes();


    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1.5 seconds
    document.addEventListener("keydown", function (e){
        if(e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX"){
            createBubble();
        }
    })
    document.addEventListener("keydown", moveBird);

}

function update() {
    requestAnimationFrame(update);
    if(gameOver){
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += gravity;
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y , limit the bird.y to top of the canvas
    context.fillStyle = bird.color;
    context.fillRect(bird.x, bird.y, bird.width, bird.height);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // bubbles
    for (let i = 0; i < bubbleArray.length; i++) {
        let bubble = bubbleArray[i];
        bubble.y -= 3; // Adjust the bubble speed
        context.beginPath();
        context.arc(bubble.x, bubble.y, bubble.size, 0, 2 * Math.PI);
        context.fillStyle = "rgba(255, 255, 255, 0.3)"; // Adjust bubble color and transparency
        context.fill();
        context.stroke();
    
        if (bubble.y + bubble.size < 0) {
            // Remove bubbles that are off-screen
            bubbleArray.splice(i, 1);
            i--;
        }
    }

    if(bird.y > board.height){
        gameOver = true;
    }

    //pipes
    for(let i = 0; i < pipeArray.length; i++){
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x,pipe.y, pipe.width, pipe.height);

        if(!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;// 0.5 bc there are 2 pipes, so 0.5*2 = 1, 1 for each pipe
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe))
            gameOver = true;
    }

    //clear pipes
    while(pipeArray.length > 0 && pipeArray[0].x < -pipeWidth){
        pipeArray.shift(); //removes first element from the array
    }

    //score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 10 , 45);

    
    if(gameOver){
        // context.fillText("GAME OVER", 5, 90)
        context.textAlign = "center";
        context.fillText("GAME OVER", board.width / 2, board.height / 2);
        context.textAlign = "left"; // Reset text alignment to default
    }
}


function placePipes() {
    if(gameOver){
        return;
    }

    //(0-1)*pipeHeight/2
    //0 -> -128 (pipeHeight/4)
    //1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }

    pipeArray.push(topPipe);

    let bottomPipe = {
       img : bottomPipeImg,
       x : pipeX,
       y : randomPipeY + pipeHeight + openingSpace,
       width : pipeWidth,
       height : pipeHeight,
       passed : false

    }
    pipeArray.push(bottomPipe);
 }

 function createBubble() {
    let bubble = {
        x: bird.x + bird.width / 2,
        y: bird.y + bird.height / 2,
        size: bubbleSize
    };
    bubbleArray.push(bubble);
}


 function moveBird(e) {
    if(e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        //Change bird color on each space bar press
        currentBirdColorIndex = (currentBirdColorIndex + 1) % birdColors.length;
        bird.color = birdColors[currentBirdColorIndex];
        
        
        //jump
        velocityY = -6;

        //reset game
        if(gameOver){
            bird.y = birdY;
            pipeArray = []
            score = 0;
            gameOver = false;
        }
    }
 }

 function detectCollision(a,b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
 }

