import React, {Component,Button} from 'react';
import logo from './logo.svg';
import './App.css';
import Chessdiagram from 'react-chessdiagram';
import axios from 'axios';


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {highlights:{},};
    }

    start_game() {
        axios.get('http://localhost:5000/start_game')
            .then((response) => {
                console.log(response.data.legal_moves);
                let squares = response.data.legal_moves;
                let highlights = {};
                const columnHash = {0:7,1:6,2:5,3:4,4:3,5:2,6:1};
                const rowHash = {0:'A',1:'B',2:'C',3:'D',4:'E',5:'F',6:'G'};
                for (let square in squares) {
                    console.log(squares[square]);
                    console.log(columnHash[squares[square][0]] + rowHash[squares[square][1]]);
                    highlights[rowHash[squares[square][1]] + columnHash[squares[square][0]]] = 'green';
                }
                this.setState({
                    highlights,
                });

                this.forceUpdate()
            })
            .catch((error) => {
                console.log(error);
            });
    }


    render() {
        let highlights = this.state.highlights;
        const lightSquareColor = '#2492FF'; // light blue
        const darkSquareColor = '#005EBB'; // dark blue
        const currentPosition =  '8/1N/8/8/8/8/8/8'; // starting position
        const flip = false;
        const squareSize = 30;
        console.log(highlights);


        function onMovePiece(piece, fromSquare, toSquare) {
            let message = 'You moved ' + piece + fromSquare + ' to ' + toSquare + ' !';
            console.log(message);
        }

        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <h1 className="App-title">Welcome to React</h1>
                </header>
                <p className="App-intro">
                    To get started, edit <code>src/App.js</code> and save to reload.
                </p>

                <Chessdiagram flip={flip} fen={currentPosition} highlights={this.state.highlights} squareSize={squareSize}
                              lightSquareColor={lightSquareColor} darkSquareColor={darkSquareColor}
                              onMovePiece={onMovePiece()}/>


                <button onClick={this.runMe.bind(this)}>
                    Activate Lasers
                </button>
            </div>
        );
    }
}

export default App;
