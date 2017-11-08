import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import Chessdiagram from 'react-chessdiagram';
axios.defaults.withCredentials = true;



class App extends Component {
    constructor(props) {
        super(props);
        this.state = {highlights:{},player_position:'',ai_position:'',move_history:[],fen:'',legal_moves:[], isWinner:''};
    }

    componentWillMount() {
        axios.get('http://localhost:5000/start_game')
            .then((response) => {
                this.make_move(response);

            })
            .catch((error) => {
                console.log(error);
            });
    }


    onMovePiece (piece, fromSquare, toSquare) {
        if (piece == 'N') {
            console.log(this.state.legal_moves);
            if (this.state.legal_moves.indexOf(toSquare) > -1) {
                console.log("success");
                let game_position = {};
                game_position[toSquare] = 'wN';
                game_position[this.state.ai_position] = 'bN';

                let highlights = this.state.highlights;
                let player_position = toSquare;
                let ai_position = this.state.ai_position;
                let move_history = this.state.move_history;
                move_history.push(alpha2ind(toSquare));
                console.log(move_history);
                let legal_moves = this.state.legal_moves;
                let fen = objToFen(game_position);

                this.setState({
                    highlights:{},
                    player_position,
                    ai_position,
                    move_history,
                    fen,
                    legal_moves
                });

                this.get_ai_move();
            }
        }
        let message = 'You moved ' + piece + fromSquare + ' to ' + toSquare + ' !';
        console.log(message);
        //let response = {data:this.state};
        //this.get_ai_move(response);
    }

    get_ai_move() {
        axios.post('http://localhost:5000/play', {
            move_history:this.state.move_history,
            player_position:this.state.player_position
        })
            .then((response) => {
                this.make_move(response)
            })
            .catch((error) => {
                this.setState({isWinner:"White Knight"})
            });
    }

    make_move(response) {
        let move_history = response.data.move_history;
        let highlights = {A1:'red',B1:'red',C1:'red',D1:'red',E1:'red',F1:'red',G1:'red',H8:'red',H7:'red',H6:'red',H5:'red',H4:'red',H3:'red',H2:'red',H1:'red'};

        let moves = response.data.legal_moves;
        let player_position = ind2alpha(response.data.player_position);

        let ai_position = ind2alpha(response.data.ai_position);
        let legal_moves = [];
        let isWinner = response.data.isWinner;

        let game_position = {};
        game_position[player_position] = 'wN';
        game_position[ai_position] = 'bN';
        let fen  = objToFen(game_position);

        for (let square in moves) {
            legal_moves.push(ind2alpha(moves[square]));
            highlights[ind2alpha(moves[square])] = 'green';
        }

        for (let square in move_history) {
            highlights[ind2alpha(move_history[square])] = 'red';
        }

        this.setState({
            highlights,
            player_position,
            ai_position,
            move_history,
            fen,
            legal_moves,
            isWinner
        });
    }


    render() {
        let highlights = this.state.highlights;
        let fen = this.state.fen;
        let isWinner = this.state.isWinner;
        if (!fen) {
            return ( <div>Loading</div>)
        }

        let open_moves = [];
        for(let key in this.state.highlights){
            if(this.state.highlights[key] == 'green') {
                open_moves.push(key);
            }
        }

        open_moves = JSON.stringify(open_moves)


        const lightSquareColor = '#EBD6B4'; // light blue
        const darkSquareColor = '#B18563'; // dark blue
        const flip = false;
        const squareSize = 40;


        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <h1 className="App-title">Isolation Player vs AI</h1>
                </header>
                <p className="App-intro">
                    To get started, select the white knight to see available moves in green.  To move
                    drag and drop the white knight into a square highglighted in green.
                </p>

                <p> Available Moves: {open_moves}</p>

                <Chessdiagram flip={flip} fen={fen} highlights={highlights} squareSize={squareSize}
                              lightSquareColor={lightSquareColor} darkSquareColor={darkSquareColor}
                              onMovePiece={this.onMovePiece.bind(this)}/>

                <p> The Winner is: {isWinner}</p>
            </div>
        );
    }
}

export default App;

// from isoviz code

var COLUMNS = 'abcdefg'.split('');

function validMove(move) {
    // move should be a string
    if (typeof move !== 'string') return false;

    // move should be in the form of "e2-e4", "f6-d5"
    var tmp = move.split('-');
    if (tmp.length !== 2) return false;

    return (validSquare(tmp[0]) === true && validSquare(tmp[1]) === true);
}

function validSquare(square) {
    if (typeof square !== 'string') return false;
    return (square.search(/^[a-h][1-8]$/) !== -1);
}

function validPieceCode(code) {
    if (typeof code !== 'string') return false;
    return (code.search(/^[bw][N]$/) !== -1);
}

// TODO: this whole function could probably be replaced with a single regex
function validFen(fen) {
    if (typeof fen !== 'string') return false;
    // cut off any move, castling, etc info from the end
    // we're only interested in position information
    fen = fen.replace(/ .+$/, '');

    // FEN should be 8 sections separated by slashes
    var chunks = fen.split('/');
    if (chunks.length !== 7) return false;

    // check the piece sections
    for (var i = 0; i < 8; i++) {
        if (chunks[i] === '' ||
            chunks[i].length > 7 ||
            chunks[i].search(/[^nN1-8]/) !== -1) {
            return false;
        }
    }

    return true;
}

function validPositionObject(pos) {
    if (typeof pos !== 'object') return false;

    for (var i in pos) {
        if (pos.hasOwnProperty(i) !== true) continue;

        if (validSquare(i) !== true || validPieceCode(pos[i]) !== true) {
            return false;
        }
    }

    return true;
}

// convert FEN piece code to bP, wK, etc
function fenToPieceCode(piece) {
    // black piece
    if (piece.toLowerCase() === piece) {
        return 'b' + piece.toUpperCase();
    }

    // white piece
    return 'w' + piece.toUpperCase();
}

// convert bP, wK, etc code to FEN structure
function pieceCodeToFen(piece) {
    var tmp = piece.split('');

    // white piece
    if (tmp[0] === 'w') {
        return tmp[1].toUpperCase();
    }

    // black piece
    return tmp[1].toLowerCase();
}

// convert FEN string to position object
// returns false if the FEN string is invalid
function fenToObj(fen) {
    if (validFen(fen) !== true) {
        return false;
    }

    // cut off any move, castling, etc info from the end
    // we're only interested in position information
    fen = fen.replace(/ .+$/, '');

    var rows = fen.split('/');
    var position = {};

    var currentRow = 8;
    for (var i = 0; i < 8; i++) {
        var row = rows[i].split('');
        var colIndex = 0;

        // loop through each character in the FEN section
        for (var j = 0; j < row.length; j++) {
            // number / empty squares
            if (row[j].search(/[1-8]/) !== -1) {
                var emptySquares = parseInt(row[j], 10);
                colIndex += emptySquares;
            }
            // piece
            else {
                var square = COLUMNS[colIndex] + currentRow;
                position[square] = fenToPieceCode(row[j]);
                colIndex++;
            }
        }

        currentRow--;
    }

    return position;
}

// position object to FEN string
// returns false if the obj is not a valid position object
function objToFen(obj) {
    if (validPositionObject(obj) !== true) {
        return false;
    }

    var fen = '';

    var currentRow = 8;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            var square = COLUMNS[j] + currentRow;

            // piece exists
            if (obj.hasOwnProperty(square) === true) {
                fen += pieceCodeToFen(obj[square]);
            }

            // empty space
            else {
                fen += '1';
            }
        }

        if (i !== 7) {
            fen += '/';
        }

        currentRow--;
    }

    // squeeze the numbers together
    // haha, I love this solution...
    fen = fen.replace(/11111111/g, '8');
    fen = fen.replace(/1111111/g, '7');
    fen = fen.replace(/111111/g, '6');
    fen = fen.replace(/11111/g, '5');
    fen = fen.replace(/1111/g, '4');
    fen = fen.replace(/111/g, '3');
    fen = fen.replace(/11/g, '2');

    return fen;
}

function ind2alpha(xy) {
    var alpha = "abcdefg";
    var num = "2345678";
    return alpha[xy[1]] + num[6 - xy[0]];
};

function alpha2ind(xy) {
    var alpha = {'a':0,'b':1,'c':2,'d':3,'e':4,'f':5,'g':6,'h':7}
    var num = "876543210";
    return  [parseInt(num[xy[1]]),alpha[xy[0]]];
}