  const getArrayCopy = (array) => {
    return JSON.parse(JSON.stringify(array)); 
  }


  const GameBoard = () => {
    const board = [
    [null,null,null],
    [null,null,null],
    [null,null,null]]

    const getDimensions = ()=>{
      return [board.length,board[0].length]
    }

    const getCurrentState = () => getArrayCopy(board)

  // public function to make a move
  const makeMove = (player,x,y) => {
    if (isMoveLegal(x,y)){
      board[x][y] = player.getSymbol()
      var cell = document.getElementById('col-'+x+y)
      cell.innerHTML = board[x][y]
    }
    else{
      throw "Not a legal move"
    }
  }

  // private function to check legal move
  const isMoveLegal = (x,y) => {
    if (board[x][y] == null){
      return true
    }
    return false
  }

  // private function to get column
  const arrayColumn = (arr, n) => arr.map(x => x[n]);

  // private function to get whether an array is 'won'
  const checkArrayWinner = (arr) => {
    var set = new Set(arr);
    if (set.size==1 & !set.has(null)){
      return true
    }
    return false
  }
  const checkDraw = (arr) => {
    var set = new Set(arr);
    if (set.size==2 & !set.has(null)){
      return true
    }
    return false
  }

  //public function to check whether the game is complete
  const checkFinished = (board) => {
    // check every row 
    var draw=true; 
    for (let i = 0; i < board.length; i++) {
      if (checkArrayWinner(board[i])){
        return'Yes'
      }
      if(!checkDraw(board[i])){
        draw=false
      }
    }
    // check columns 
    for (let i = 0; i < board[0].length; i++) {
      if (checkArrayWinner(arrayColumn(board,i))){
        return 'Yes'
      }
      if(!checkDraw(arrayColumn(board,i))){
        draw=false
      }
    } 
    // check diagonals. Hacking for now
    var diag1 = [board[0][0], board[1][1],board[2][2]]
    var diag2 = [board[0][2], board[1][1],board[2][0]]

    if (checkArrayWinner(diag1)||checkArrayWinner(diag2)){
      return 'Yes'
    }
    if (draw){
      return 'Draw'
    }

    return 'No'
    
  }

  return {makeMove,checkFinished,getDimensions, getCurrentState,isMoveLegal}
}

const Player = (name,symbol,ai) =>{
  const getName = () => name;
  const getSymbol = () => symbol;
  const isAi = () => ai;


  const getNextMove = (board) => {

    // create every possible winning mutation 
    for (const [permutation,move] of getPossiblePermutations(board.getCurrentState(),getSymbol())){
      if (board.checkFinished(permutation)!='No'){
        return move
      }
    }

    for (const [permutation,move] of getPossiblePermutations(board.getCurrentState(),getOppositeSymbol())){
      if (board.checkFinished(permutation)!='No'){
        console.log('one')
        return move
      }
    }

    // create every possible losing mutation 
    for (const [permutation,move] of getPossiblePermutations(board.getCurrentState(),getOppositeSymbol())){
      for (const [permutation_ahead,move_ahead] of getPossiblePermutations(permutation,getOppositeSymbol())){
        if (board.checkFinished(permutation_ahead)!='No'){
          console.log('two')
          return move_ahead
        }
      }
    }

    return makeRandomLegalMove(board)

  }

  const getPossiblePermutations= (boardState,symbol) =>{
    var permutations=[];

    for (const [row_id, row] of boardState.entries()) {
      for (const [val_id,val] of row.entries()){
        if (val==null){
          const boardcopy = getArrayCopy(boardState)
          boardcopy[row_id][val_id]=symbol
          permutations.push([boardcopy,[row_id,val_id]])
        }
      }
    }
    return permutations
  }

  const getOppositeSymbol = () =>{
    if (getSymbol()=='x'){
      return 'o'
    }
    else if(getSymbol()=='o'){
      return 'x'
    }
  }

  const makeRandomLegalMove = (board) => {
    var moves
    var legal_move = false
    while(!legal_move){
     moves = [Math.floor(Math.random() * 3),Math.floor(Math.random() * 3)]
     legal_move = board.isMoveLegal(...moves)
   }
   return moves 
 } 
 return{getName, getSymbol, isAi, getNextMove}
}

const Game = () =>{
  const players = []

  var board ;
  var current_turn; 

  const getCurrentTurn = () => current_turn
  const getCurrentPlayer = () => players[current_turn%players.length]
  const getCurrentPlayerName = () => getCurrentPlayer().getName()
  var finished = false

  // public function to initialise a game state from scratch
  const initialiseGame = () =>{
    board = GameBoard()
    finished = false
    current_turn = 0 
    if (players.length==0){
      players.push(Player(prompt("Please enter X player name", "PlayerX"),'x',false))
      players.push(Player(prompt("Please enter O player name", "PlayerO"),'o',true))
    }
    for (let x =0;x<board.getDimensions()[0];x++){
      for(let y=0;y<board.getDimensions()[1];y++){
        var cell = document.getElementById('col-'+x+y)
        cell.innerHTML = ""
      }
    }
    
  }

  // private function to check whether the game is complete
  const getFinishedState = () =>{
    // Call a board to get the state of the game. If finished then no more turns can be made
    var finished_state = board.checkFinished(board.getCurrentState())
    if (finished_state=='Yes'){
      finished=true
      alert('Winner: '+getCurrentPlayerName())
    }
    else if (finished_state=='Draw'){
      finished=true
      alert(finished_state)
    }
  } 

  // public function for player to make a move
  const makeMove = (x,y) => {
    if (!finished){
      try{
        board.makeMove(getCurrentPlayer(),x,y)
        getFinishedState()
        current_turn+=1
        
        const nextPlayer = getCurrentPlayer()
        if (nextPlayer.isAi()& !finished){
          const nextmove = nextPlayer.getNextMove(board)
          makeMove(...nextmove)
        }
      }
      catch(err){
        if (err == "Not a legal move"){
        }
        else{
          throw err        }
        }
      }
      else{initialiseGame()}
    }


  const getBoard = () =>board;
  return {initialiseGame,makeMove,getBoard}

}

var g = Game()
g.initialiseGame()
