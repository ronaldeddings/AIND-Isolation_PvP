from isolation import Board
from sample_players import (RandomPlayer, open_move_score,
                            improved_score, center_score,GreedyPlayer)
from game_agent import (MinimaxPlayer, AlphaBetaPlayer, custom_score,
                        custom_score_2, custom_score_3)

# create an isolation board (by default 7x7)
player1 = RandomPlayer()
player2 = AlphaBetaPlayer(score_fn=custom_score_3)
game = Board(player1, player2)


# place player 1 on the board at row 2, column 3, then place player 2 on
# the board at row 0, column 5; display the resulting board state.  Note
# that the .apply_move() method changes the calling object in-place.
assert(player1 == game.active_player)

game.apply_move((2, 3))
print(game.to_string())

# players take turns moving on the board, so player1 should be next to move

# get a list of the legal moves available to the active player
print(game.get_legal_moves())

# get a successor of the current state by making a copy of the board and
# applying a move. Notice that this does NOT change the calling object
# (unlike .apply_move()).
new_game = game.forecast_move((1, 1))
assert(new_game.to_string() != game.to_string())
print("\nOld state:\n{}".format(game.to_string()))
print("\nNew state:\n{}".format(new_game.to_string()))

# play the remainder of the game automatically -- outcome can be "illegal
# move", "timeout", or "forfeit"
winner, history, outcome = game.play()
print("\nWinner: {}\nOutcome: {}".format(winner, outcome))
print(game.to_string())
print("Move history:\n{!s}".format(history))
