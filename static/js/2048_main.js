// 显示尺寸适应性调整
documentWidth = Math.min(window.screen.availWidth - 20, 500); // 500px
gridContainerWidth = 0.92 * documentWidth; // 460px
cellSize = 0.2 * documentWidth; // 100px
cellSideSize = 0.18 * documentWidth; // 90px
cellSpace = 0.04 * documentWidth; // 20px


var board = new Array(); // 4X4方格棋盘
var hasConflicted = new Array(); // 同一方格仅单次合并允许
var score = 0; // 分数

var numBgcs = ["black", "#eee4da", "#ede0c8", "#f2b179", "#f59563", "#f67c5f", "#f65eb3", "#edcf72", "#edcc61", "#9c0", "#33b5e5", "#09c", "#a6c", "#93c"];

var startX;
var startY;
var endX;
var endY;

window.onload = (function() {
	var gridContainer = document.getElementById('grid-container');
	gridContainer.style.width = gridContainerWidth + "px";
	gridContainer.style.height = gridContainerWidth + "px";
	gridContainer.style.padding = cellSpace + "px";
	gridContainer.style.borderStyle = "border-radius: " + 0.02 * documentWidth + "px;";


	for (var i = 0; i < 4; i++) 
		for (var j = 0; j < 4; j++) {
			var gridCell = document.getElementById("grid-cell-"+i+"-"+j);
			gridCell.style.width = cellSize + "px";
			gridCell.style.height = cellSize + "px";
			gridCell.style.borderStyle = "border-radius: " + 0.012 * documentWidth + "px;";
		}
					
	newGame();
});

function newGame() {
	// 初始化棋盘格
	init();
	// 在随机两个格子生成数字
	generateOneNumber();
	generateOneNumber();
}

function init() {
	score = 0;
	document.getElementById("score").innerHTML = score;

	for (var i = 0; i < 4; i++)
		for (var j = 0; j < 4; j++) {
			var gridCell = document.getElementById("grid-cell-"+i+"-"+j);
			gridCell.style.top = getPosTop(i, j) + "px";
			gridCell.style.left = getPosLeft(i, j) + "px";
		}

	for (var i = 0; i < 4; i++) {
		board[i] = new Array();
		hasConflicted[i] = new Array();
		for (var j = 0; j < 4; j++) {
			board[i][j] = 0;
			hasConflicted[i][j] = false;
		}
	}

	updateBoardView();
}

function getPosTop(i, j) {
	return cellSpace + i * (cellSize + cellSpace);
}

function getPosLeft(i, j) {
	return cellSpace + j * (cellSize + cellSpace);
}

function updateBoardView() {
	var gridContainer = document.getElementById("grid-container");
	for (var i = 0; i < 4; i++) 
		for (var j = 0; j < 4; j++)
			if (document.getElementById("num-cell-"+i+"-"+j))
				gridContainer.removeChild(document.getElementById("num-cell-"+i+"-"+j));

	for (var i = 0; i < 4; i++) 
		for (var j = 0; j < 4; j++) {
			var numCell = document.createElement("div");
			numCell.className = "num-cell";
			numCell.id = "num-cell-"+i+"-"+j;
			gridContainer.appendChild(numCell);

			if (board[i][j] == 0) {
				numCell.style.width = "0px";
				numCell.style.height = "0px"
			}
			else {
				numCell.style.backgroundColor = numBgcs[parseInt(Math.log2(board[i][j]))];
				numCell.style.width = cellSideSize + "px";
				numCell.style.height = cellSideSize + "px";
				numCell.style.margin = (cellSize - cellSideSize) / 2 + "px";
				numCell.style.color = (board[i][j] <= 4) ? "#776e65" : "white";
				numCell.style.fontSize = 0.4 * cellSize + "px";
				numCell.style.lineHeight = cellSize + "px";
				numCell.innerHTML = board[i][j];
			}
			numCell.style.top = getPosTop(i, j) + "px";
			numCell.style.left = getPosLeft(i, j) + "px";

			hasConflicted[i][j] = false;
		}
}

function generateOneNumber() {
	var nospace = true;
	for (var i = 0; i < 4 && nospace; i++)
		for (var j = 0; j < 4; j++)
			if (board[i][j] == 0) {
				nospace = false;
				break;
			}
	if (nospace)
		return false;

	var randX = 0;
	var randY = 0;
	var times = 0;
	while (times < 50) {
		randX = parseInt(Math.floor(Math.random() * 4));
		randY = parseInt(Math.floor(Math.random() * 4));
		if (board[randX][randY] == 0)
			break;
		times++;
	}
	if (times == 50)
		for (var i = 0; i < 4 && times > 0; i++)
			for (var j = 0; j < 4; j++)
				if (board[i][j] == 0) {
					randX = i;
					randY = j;
					times = 0;
					break;
				}

	// 随机一个数字
	var randNumber = Math.random() < 0.5 ? 2 : 4;
	
	// 在随机位置显示随机数字
	board[randX][randY] = randNumber;
	showNumberWithAnimation(randX, randY, randNumber);

	return true;
}

function showNumberWithAnimation(x, y, randNumber) {
	var numCell = document.getElementById("num-cell-"+x+"-"+y);

	numCell.style.backgroundColor = numBgcs[parseInt(Math.log2(randNumber))];
	numCell.style.color = "#776e65";
	numCell.innerHTML = randNumber;

	clearInterval(numCell.termId);
	numCell.termId = setInterval(function () {
		numCell.style.width = cellSideSize + "px";
		numCell.style.height = cellSideSize + "px"
		numCell.style.margin = (cellSize - cellSideSize) / 2 + "px";
		numCell.style.top = getPosTop(x, y) + "px";
		numCell.style.left = getPosLeft(x, y) + "px";
		numCell.style.fontSize = 0.4 * cellSize + "px";
		numCell.style.lineHeight = cellSize + "px";
	}, 50);
}

document.onkeyup = (function (event) {
	event.preventDefault();
	switch(event.keyCode) {
		case 37: // left
			if (moveLeft()) {
				setTimeout("generateOneNumber()", 210);
				setTimeout("isgameover()", 300);
			}
			break;
		case 38: // up
			if (moveUp()) {
				setTimeout("generateOneNumber()", 210);
				setTimeout("isgameover()", 300);
			}
			break;
		case 39: // right
			if (moveRight()) {
				setTimeout("generateOneNumber()", 210);
				setTimeout("isgameover()", 300);
			}
			break;
		case 40: // down
			if (moveDown()) {
				setTimeout("generateOneNumber()", 210);
				setTimeout("isgameover()", 300);
			}
			break;
		default:
			break;
	}
});

document.addEventListener('touchstart', function(event) {
	startX = event.touches[0].pageX;
	startY = event.touches[0].pageY;
});

document.addEventListener('touchmove', function(event) {
	event.preventDefault();
})

document.addEventListener('touchend', function(event) {
	endX = event.changedTouches[0].pageX;
	endY = event.changedTouches[0].pageY;

	var deltax = endX - startX;
	var deltay = endY - startY;

	if (Math.abs(deltax) < 0.3*documentWidth && Math.abs(deltay) < 0.3*documentWidth)
		return;

	if (Math.abs(deltax) >= Math.abs(deltay)) {
		if (deltax > 0) {
			// move right
			if (moveRight()) {
				setTimeout("generateOneNumber()", 210);
				setTimeout("isgameover()", 300);
			}
		}
		else {
			// move left
			if (moveLeft()) {
				setTimeout("generateOneNumber()", 210);
				setTimeout("isgameover()", 300);
			}
		}
	}
	else {
		if (deltay > 0) {
			// move down
			if (moveDown()) {
				setTimeout("generateOneNumber()", 210);
				setTimeout("isgameover()", 300);
			}
		}
		else {
			// move up
			if (moveUp()) {
				setTimeout("generateOneNumber()", 210);
				setTimeout("isgameover()", 300);
			}
		}
	}
});

function moveLeft() {
	if (!canMoveLeft())
		return false;

	for (var i = 0; i < 4; i++)
		for (var j = 1; j < 4; j++)
			if (board[i][j] != 0)
				for (var k = 0; k < j; k++) {
					if (board[i][k] == 0 && noBlockHorizontal(i, k, j)) {
						// move
						showMoveAnimation(i, j, i, k);
						board[i][k] = board[i][j];
						board[i][j] = 0;
						continue;
					}
					else if (board[i][k] == board[i][j] && noBlockHorizontal(i, k, j) && !hasConflicted[i][k]) {
						// move
						showMoveAnimation(i, j, i, k);
						// add
						board[i][k] += board[i][j];
						// add score
						score += board[i][k];
						document.getElementById("score").innerHTML = score;
						board[i][j] = 0;
						hasConflicted[i][k] = true;
						continue;
					}
				}

	setTimeout("updateBoardView()", 200);
	return true; 
}

function canMoveLeft() {
	for (var i = 0; i < 4; i++)
		for (var j = 1; j < 4; j++)
			if (board[i][j] != 0 && (board[i][j-1] == 0 || board[i][j-1] == board[i][j]))
				return true;

	return false;
}

function moveRight() {
	if (!canMoveRight())
		return false;

	// moveRight
	for (var i = 0; i < 4; i++)
		for (var j = 2; j >= 0; j--)
			if (board[i][j] != 0)
				for (var k = 3; k > j; k--) {
					if (board[i][k] == 0 && noBlockHorizontal(i, j, k)) {
						// move
						showMoveAnimation(i, j, i, k);
						board[i][k] = board[i][j];
						board[i][j] = 0;
						continue;
					}
					else if (board[i][k] == board[i][j] && noBlockHorizontal(i, j, k) && !hasConflicted[i][k]) {
						// move
						showMoveAnimation(i, j, i, k);
						// add
						board[i][k] += board[i][j];
						// add score
						score += board[i][k];
						document.getElementById("score").innerHTML = score;
						board[i][j] = 0;
						hasConflicted[i][k] = true;
						continue;
					}
				}	

	setTimeout("updateBoardView()", 200);
	return true;
}

function canMoveRight() {
	for (var i=0; i < 4; i++)
		for (var j=2; j >= 0; j--)
			if (board[i][j] != 0 && (board[i][j+1] == 0 || board[i][j+1] == board[i][j]))
				return true;

	return false;
}

function noBlockHorizontal(row, col1, col2) {
	for (var i = col1 + 1; i < col2; i++)
		if (board[row][i] != 0)
			return false;

	return true;
}

function moveUp() {
	if (!canMoveUp())
		return false;

	// moveUp
	for (var j=0; j < 4; j++)
		for (var i=1; i < 4; i++)
			if (board[i][j] != 0)
				for (var k=0; k < i; k++) {
					if (board[k][j] == 0 && noBlockVertical(j, k, i)) {
						// move
						showMoveAnimation(i, j, k, j);
						board[k][j] = board[i][j];
						board[i][j] = 0;
						continue;
					}
					else if (board[k][j] == board[i][j] && noBlockVertical(j, k, i) && !hasConflicted[k][j]) {
						// move
						showMoveAnimation(i, j, k, j);
						// add
						board[k][j] += board[i][j];
						// add score
						score += board[k][j];
						document.getElementById("score").innerHTML = score;
						board[i][j] = 0;
						hasConflicted[k][j] = true;
						continue;
					}
				}	

	setTimeout("updateBoardView()", 200);
	return true;
}

function canMoveUp() {
	for (var i=1; i < 4; i++)
		for (var j=0; j < 4; j++)
			if (board[i][j] != 0 && (board[i-1][j] == 0 || board[i-1][j] == board[i][j]))
				return true;

	return false;
}

function moveDown() {
	if (!canMoveDown())
		return false;

	// moveDown
	for (var j=0; j < 4; j++)
		for (var i=2; i >= 0; i--)
			if (board[i][j] != 0)
				for (var k=3; k > i; k--) {
					if (board[k][j] == 0 && noBlockVertical(j, i, k)) {
						// move
						showMoveAnimation(i, j, k, j);
						board[k][j] = board[i][j];
						board[i][j] = 0;
						continue;
					}
					else if (board[k][j] == board[i][j] && noBlockVertical(j, i, k) && !hasConflicted[k][j]) {
						// move
						showMoveAnimation(i, j, k, j);
						// add
						board[k][j] += board[i][j];
						// add score
						score += board[k][j];
						document.getElementById("score").innerHTML = score;
						board[i][j] = 0;
						hasConflicted[k][j] = true;
						continue;
					}
				}	

	setTimeout("updateBoardView()", 200);
	return true;
}

function canMoveDown() {
	for (var i=2; i >= 0; i--)
		for (var j=0; j < 4; j++)
			if (board[i][j] != 0 &&(board[i+1][j] == 0 || board[i+1][j] == board[i][j]))
				return true;

	return false;
}

function noBlockVertical(col, row1, row2) {
	for (var i=row1+1; i < row2; i++)
		if (board[i][col] != 0)
			return false;

	return true;
}

function showMoveAnimation(fromX, fromY, toX, toY) {
	var numCell = document.getElementById("num-cell-"+fromX+"-"+fromY);

	clearInterval(numCell.termId);
	numCell.termId = setInterval(function () {
		numCell.style.top = getPosTop(toX, toY) + "px";
		numCell.style.left = getPosLeft(toX, toY) + "px";
	}, 200);
}

function isgameover() {
	if (!(canMoveLeft() || canMoveRight() || canMoveUp() || canMoveDown()))
		alert("Game Over, "+score+" Total!");
}