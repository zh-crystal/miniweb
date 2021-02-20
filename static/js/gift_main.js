var GRID_WIDTH = Math.min(0.8 * window.screen.availWidth, 800);
var RATIO = 0.625;
var GRID_HEIGHT = Math.min(0.6 * window.screen.availHeight, 0.625 * GRID_WIDTH);
var COMMON_SIZE = Math.ceil(0.1 * GRID_HEIGHT);
var UP_OVER = 0.16 * GRID_HEIGHT;
var DOWN_OVER = 0.96 * GRID_HEIGHT - COMMON_SIZE;
var DOWN_BLOCK_TOP = DOWN_OVER - COMMON_SIZE;
var UP_BLOCK_TOP = DOWN_BLOCK_TOP - (DOWN_OVER - UP_OVER) / 2;
var STEP = 0.2 * COMMON_SIZE;
var FONTSIZE = (GRID_HEIGHT >= 500) ? 100 : 40;

var gamebegin = false;
var role = null;
var gridTimer = null;
var genTimer = null;
var paused = true;
var gameover = false;
var downAdmit = false;
var upAdmit = false;
var downPress = false;
var score = 0;
var collection = new Array();
var whispers = ["世间纷扰,我只在意你一人尔;白驹过隙,我只望相陪你一生止",
    "我最幸运的是能和你两情相悦,最幸福的是想与你两相厮守",
    "三生赏尽灼灼桃花,三世之子于归宜家",
    "你如春般温暖,夏般火辣,秋般清爽,冬般纯美,你便是这四季",
    "酸苦甘辛咸，杂陈五味，我都愿听你倾诉",
    "古人以六神谓体内六脏，依我看，都不如你一人来得重要",
    "世界如此美好，值得我为之奋斗。我坚信后半句。——七宗罪",
    "一日两人三餐四季，七情六欲五味百年",
    "2020-02-14 情人节快乐 ^_^ Over"
]

// page response
window.onload = (function () {
    adjustSize();
    role = document.getElementById("role");
    var msg = "paused!";
    showTopMsgAnimation(msg);
    score = 0;
    for (var i = 0; i < 8; i++)
        collection[i] = false;
    updateScore();
});

document.onkeydown = (function (event) {
    event.preventDefault();
    if (!gameover && event.keyCode == 38) { // up
        downAdmit = false;
        upAdmit = true;
    }
    else if (!gameover && event.keyCode == 40) { // down
        downPress = true;
        downAdmit = true;
        upAdmit = false;
    }
});

document.onkeyup = (function (event) {
    event.preventDefault();
    if (!gameover) {
        if (event.keyCode == 38) { // up
            upAdmit = false;
            downAdmit = true;
        }
        else if (event.keyCode == 40) { // down
            downPress = false;
            downAdmit = true;
        }
        else if (event.keyCode == 32) { // space
            if (paused)
                start();
            else
                pause();
        }
    }
});

document.addEventListener("touchstart", function (event) {
    event.preventDefault();
    if (!gamebegin) {
        gamebegin = true;
        start();
    }
    else if (!gameover) { // up
        downAdmit = false;
        upAdmit = true;
    }
}); 

document.addEventListener("touchend", function (event) {
    if (!gameover) {
        upAdmit = false;
        downAdmit = true;
    }
});


// start & pause & restart
function start() {
    clearTopMsgAnimation();
    pauseToStart();
    showGridAnimation();
    showRoleAnimation();
    showGenAnimation();
}

function pause(com = -1) {
    clearRoleAnimation();
    clearGenAnimation();
    clearGridAnimation();
    startToPause();
    var msg = null;
    switch (com) {
        case -1:
            msg = "paused!"
            showTopMsgAnimation(msg);
            break;
        case 0:
            showCollasionAnimation();
            break;
        case 1:
            showCompleteAnimation();
            break;
        default:
            break;
    }
}

function restart() {
    location.reload();
}

// support
function adjustSize() {
    document.getElementById("header").style.width = GRID_WIDTH + "px"; 
    document.getElementById("header").style.height = 0.02 * GRID_WIDTH + "px"; 
    document.getElementById("header").style.lineHeight = 0.02 * GRID_WIDTH + "px"; 
    document.getElementById("grid-container").style.width = GRID_WIDTH + "px";
    document.getElementById("grid-container").style.height = GRID_HEIGHT + "px";
    document.getElementById("top-msg").style.lineHeight = 0.16 * 0.6  * GRID_HEIGHT + "px";
    document.getElementById("top-msg").style.fontSize = FONTSIZE + "%";
    document.getElementById("gift").style.fontSize = FONTSIZE + "%";
    document.getElementById("gift").style.lineHeight = COMMON_SIZE / 2 + "px";
    document.getElementById("gift").style.height = COMMON_SIZE / 2 + "px";
    document.getElementById("gift").style.width = COMMON_SIZE / 2 + "px";
    
    document.getElementById("role").style.height = COMMON_SIZE + "px";
    document.getElementById("role").style.width = COMMON_SIZE + "px";
    document.getElementById("block-0").style.height = COMMON_SIZE + "px";
}

function pauseToStart() {
    document.getElementById("header").removeChild(document.getElementById("icon-pause"));

    var icon = document.createElement("a");
    icon.href = "javascript:pause()";
    icon.id = "icon-start";
    icon.innerText = "| |";
    document.getElementById("header").appendChild(icon);

    downAdmit = true;
    paused = false;
}

function startToPause() {
    document.getElementById("header").removeChild(document.getElementById("icon-start"));

    var icon = document.createElement("a");
    icon.href = "javascript:start()";
    icon.id = "icon-pause";
    icon.innerText = "| >";
    document.getElementById("header").appendChild(icon);

    downAdmit = false;
    paused = true;
}

function generateOneBlock() {
    var blocks = document.getElementsByClassName("block");
    if (blocks.length < 2) {
        var curBlock = blocks[0];
        var block = document.createElement("div");
        block.className = "block";
        block.style.top = ((Math.random() < 0.5) ? DOWN_BLOCK_TOP : UP_BLOCK_TOP) + "px";
        block.style.left = Math.max(parseInt(Math.random())+curBlock.offsetLeft+curBlock.offsetWidth, GRID_WIDTH*0.6) + COMMON_SIZE * 1.5 + "px";
        block.style.width = parseInt(Math.random()*(GRID_WIDTH*0.4-COMMON_SIZE))+COMMON_SIZE + "px";
        block.style.height = COMMON_SIZE + "px";
        document.getElementById("grid-container").appendChild(block);
    }
}

function generateOneGift() {
    if (!document.getElementById("gift") && Math.random() < 0.5) {
        var gift = document.createElement("div");
        gift.id = "gift";
        gift.style.lineHeight = COMMON_SIZE / 2 + "px";
        gift.style.height = COMMON_SIZE / 2 + "px";
        gift.style.width = COMMON_SIZE / 2 + "px";
        gift.style.fontSize = FONTSIZE + "%";
        gift.style.top = Math.min(Math.random() + 0.16, DOWN_BLOCK_TOP / GRID_HEIGHT) * 100 + "%";
        gift.style.left = Math.max(parseInt(Math.random()*GRID_WIDTH)+3*COMMON_SIZE, GRID_WIDTH*0.6) + "px";
        var allCollected = true;
        for (var i = 0; i < 8 && allCollected; i++)
        if (collection[i] == false)
        allCollected = false;
        if (allCollected) {
            gift.innerText = "9";
            gift.style.borderRadius = "50%";
            gift.style.backgroundColor = "brown";

        }
        else
            gift.innerText = parseInt((Math.random() * 8)) + 1;
        document.getElementById("grid-container").appendChild(gift);
    }
}

function gridMove() {
    var blocks = document.getElementsByClassName("block");
    for (var i = 0; i < blocks.length; i++) {
        blocks[i].style.left = blocks[i].offsetLeft - STEP + "px";
        if (blocks[i].offsetLeft <= -blocks[i].offsetWidth)
            blocks[i].parentNode.removeChild(blocks[i]);
    }

    var gift = document.getElementById("gift");
    if (gift) {
        gift.style.left = gift.offsetLeft - STEP + "px";
        if (gift.offsetLeft <= -gift.offsetWidth) {
            gift.parentNode.removeChild(gift);
            score -= 10;
            updateScore();
        }
    }
}

function checkState() {
    // block collasion
    var blocks = document.getElementsByClassName("block");
    for (var i = 0; i < blocks.length; i++) {
        var roTop = role.offsetTop;
        var bcLeft = blocks[i].offsetLeft;
        var bcTop = blocks[i].offsetTop;
        if ((roTop < bcTop && roTop > Math.ceil(bcTop - COMMON_SIZE)) || (roTop >= bcTop && roTop < Math.floor(bcTop + COMMON_SIZE))) {
            if (bcLeft > 1.2 * COMMON_SIZE && bcLeft < 2.0 * COMMON_SIZE) {
                if (roTop < bcTop)
                    role.style.top = bcTop - COMMON_SIZE + "px";
                else
                    role.style.top = bcTop + COMMON_SIZE + "px";
                return false;
            }
        }
    }
    // bound collasion
    if (role.offsetTop <= UP_OVER || role.offsetTop >= DOWN_OVER) {
        pause(0);
        return false;
    }
    // gift touched
    var gift = document.getElementById("gift");
    if (gift && gift.offsetLeft + gift.offsetWidth > COMMON_SIZE && gift.offsetLeft < 2 * COMMON_SIZE && Math.abs(role.offsetTop - gift.offsetTop) < COMMON_SIZE)
        makeSurprise(parseInt(gift.innerText));
    
    return true;
}

function makeSurprise(giftId) {
    if (giftId == 9)
        pause(1);
    else {
        document.getElementById("top-msg").style.display = "none";
        document.getElementById("gift").parentNode.removeChild(document.getElementById("gift"));
        collection[giftId-1] = true;
        showTopMsgAnimation(whispers[giftId-1])
        score += giftId;
        updateScore();
    }
}

function canMoveUp() {
    var blocks = document.getElementsByClassName("block");
    for (var i = 0; i < blocks.length; i++)
        if (role.offsetTop > blocks[i].offsetTop && role.offsetTop - blocks[i].offsetTop <= COMMON_SIZE)
            if (blocks[i].offsetLeft <= COMMON_SIZE && blocks[i].offsetLeft + blocks[i].offsetWidth > COMMON_SIZE) {
                role.style.top = blocks[i].offsetTop + COMMON_SIZE + "px";
                return false;
            }

    return true;
}

function canMoveDown() {
    var blocks = document.getElementsByClassName("block");
    for (var i = 0; i < blocks.length; i++)
        if (role.offsetTop < blocks[i].offsetTop && blocks[i].offsetTop - role.offsetTop <= COMMON_SIZE)
            if (blocks[i].offsetLeft <= COMMON_SIZE && blocks[i].offsetLeft + blocks[i].offsetWidth > COMMON_SIZE) {
                role.style.top = blocks[i].offsetTop - COMMON_SIZE + "px";
                return false;
            }

    return true;
}

function updateScore() {
    document.getElementById("score").innerText = score.toFixed(2);
}

// show animation
function showTopMsgAnimation(msg) {
    var ele = document.getElementById("top-msg");
    if (gameover)
        ele.style.color = "pink";
    ele.innerText = msg;
    var freq = 0;
    clearInterval(ele.termId);
    ele.termId = setInterval(function () {
        ele.style.display = (freq++ % 2) ? "none" : "block";
        freq > 2 && clearInterval(ele.termId);
    }, 500);
}

function showGenAnimation() {
    clearInterval(genTimer);
    genTimer = setInterval(function () {
        generateOneBlock();
        generateOneGift();
    }, 500);
}

function showGridAnimation() {
    clearInterval(gridTimer);
    gridTimer = setInterval(function () {
        gridMove();
        score += 0.05;
        updateScore();
    }, 50);
}

function showRoleAnimation() {
    clearInterval(role.termId);
    role.termId = setInterval(function () {
        if (checkState()) {
            if (upAdmit && canMoveUp())
                role.style.top = role.offsetTop - STEP * RATIO * 2 + "px";
            else if (downAdmit && canMoveDown())
                role.style.top = role.offsetTop + STEP * RATIO * (downPress ? 2 : 1) + "px";
            score += 0.05;
            updateScore(score);
        }
    }, 50);
}

function showCollasionAnimation() {
    gameover = true;
    var ele = document.getElementById("grid-container");
    var freq = 0;
    clearInterval(ele.termId);
    ele.termId = setInterval(function () {
        ele.style.border = (freq++ % 2) ? "none" : "red 10px solid";
        freq > 4 && clearInterval(ele.termId);
    }, 500);
    var msg = "BOOM! Restart or quit!"
    showTopMsgAnimation(msg);
    document.getElementById("icon-pause").parentNode.removeChild(document.getElementById("icon-pause"));
}

function showCompleteAnimation() {
    gameover = true;
    var ele = document.getElementById("grid-container");
    ele.removeChild(document.getElementById("role"));
    ele.removeChild(document.getElementById("gift"));
    ele.removeChild(document.getElementById("bottom-bar"));
    document.getElementById("icon-pause").parentNode.removeChild(document.getElementById("icon-pause"));
    var blocks = document.getElementsByClassName("block");
    for (var i = blocks.length - 1; i >= 0; i--)
        ele.removeChild(blocks[i]);
    var topBar = document.getElementById("top-bar");
    var freq = 0;
    clearInterval(ele.termId);
    ele.termId = setInterval(function () {
        ele.style.background = "linear-gradient(90deg, rgb(231, 21, 100) " + (++freq) + "%,pink)";
        topBar.style.background = "linear-gradient(90deg, rgb(231, 21, 100) " + (freq) + "%,pink)";
        freq >= 100 && clearInterval(ele.termId);
    }, 50);
    showTopMsgAnimation(whispers[8]);
}

// clear animation
function clearTopMsgAnimation() {
    var topMsg = document.getElementById("top-msg");
    clearInterval(topMsg.termId);
    topMsg.style.display = "none";
}

function clearGenAnimation() {
    clearInterval(genTimer);
}

function clearGridAnimation() {
    clearInterval(gridTimer);
}

function clearRoleAnimation() {
    clearInterval(role.termId);
}
    