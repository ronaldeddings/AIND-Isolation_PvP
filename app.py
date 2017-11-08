from flask import request, url_for, jsonify, Flask
from isolation import Board
from sample_players import (RandomPlayer, open_move_score,
                            improved_score, center_score,GreedyPlayer)
from game_agent import (MinimaxPlayer, AlphaBetaPlayer, custom_score,
                        custom_score_2, custom_score_3)

from random import choice

def time_left():
    return 150

from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app, support_credentials=True)


@app.route("/start_game", methods=['GET'])
@cross_origin(supports_credentials=True)
def start_game():
    # create an isolation board (by default 7x7)
    player1 = RandomPlayer()
    player2 = AlphaBetaPlayer(score_fn=custom_score_3)
    game = Board(player1, player2)
    assert (player1 == game.active_player)

    player_position = choice(game.get_legal_moves())
    game.apply_move(player_position)

    ai_position = choice(game.get_legal_moves())
    game.apply_move(ai_position)

    move_history = [player_position,ai_position]

    response = jsonify({'legal_moves': game.get_legal_moves(),'player_position':list(player_position),'ai_position':list(ai_position),'move_history':move_history})

    # place player 1 on the board at row 2, column 3, then place player 2 on
    # the board at row 0, column 5; display the resulting board state.  Note
    # that the .apply_move() method changes the calling object in-place.





    return response


@app.route("/play", methods=['GET','POST'])
@cross_origin(supports_credentials=True)
def play_game():
    content = request.get_json(silent=True)
    move_history = content['move_history']

    # create an isolation board (by default 7x7)
    player1 = RandomPlayer()
    player2 = AlphaBetaPlayer(score_fn=custom_score_3)
    game = Board(player1, player2)

    assert (player1 == game.active_player)

    for move in move_history:
        game.apply_move(move)

    isWinner = ''

    if game.is_winner(player1):
        isWinner = 'White Knight'

    if game.is_winner(player2):
        isWinner = 'Black Knight'

    if isWinner:
        response = jsonify(
            {'legal_moves': game.get_legal_moves(), 'player_position': list(player_position),
             'ai_position': list(ai_position), 'move_history': move_history, 'isWinner':isWinner})

    player2.time_left = time_left

    ai_move = player2.alphabeta(game, 6)
    game.apply_move(ai_move)

    player_position = game.get_player_location(player1)
    move_history.append(ai_move)
    ai_position = game.get_player_location(player2)

    if game.is_winner(player1):
        isWinner = 'White Knight'

    if game.is_winner(player2):
        isWinner = 'Black Knight'

    response = jsonify(
        {'legal_moves': game.get_legal_moves(), 'player_position': list(player_position), 'ai_position': list(ai_position),'move_history':move_history,'isWinner':isWinner})

    # place player 1 on the board at row 2, column 3, then place player 2 on
    # the board at row 0, column 5; display the resulting board state.  Note
    # that the .apply_move() method changes the calling object in-place.



    return response

if __name__ == "__main__":
    app.run(debug=True)
