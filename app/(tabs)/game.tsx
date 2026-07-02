import React, { useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  SafeAreaView, Platform, Animated,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { makeMove, setShowModal, resetRound, resetAll, Cell } from '../../store/gameSlice';
import { updateStats } from '../../store/authSlice';

function BoardCell({
  value, index, onPress, winLine, disabled,
}: {
  value: Cell; index: number; onPress: (i: number) => void;
  winLine: number[] | null; disabled: boolean;
}) {
  const isWinner = winLine?.includes(index) ?? false;
  const scale = React.useRef(new Animated.Value(1)).current;

  function handlePress() {
    if (value || disabled) return;
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress(index);
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={!!value || disabled}
      style={styles.cellTouch}
    >
      <Animated.View
        style={[
          styles.cell,
          isWinner && styles.cellWinner,
          { transform: [{ scale }] },
        ]}
      >
        {value === 'X' && (
          <Text style={[styles.cellText, styles.xText, isWinner && styles.cellTextWinner]}>X</Text>
        )}
        {value === 'O' && (
          <Text style={[styles.cellText, styles.oText, isWinner && styles.cellTextWinner]}>O</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function GameScreen() {
  const user = useAppSelector(state => state.auth.user);
  const {
    board, isXTurn, scoreX, scoreO, scoreDraw,
    gameOver, winner, isDraw, winLine, showModal,
  } = useAppSelector(state => state.game);
  const dispatch = useAppDispatch();

  const player1 = user?.username ?? 'Player 1';
  const player2 = 'Player 2';

  const handlePress = useCallback(
    (index: number) => {
      dispatch(makeMove(index));
    },
    [dispatch]
  );

  useEffect(() => {
    if (!gameOver) return;
    if (winner === 'X') dispatch(updateStats('win'));
    else if (winner === 'O') dispatch(updateStats('loss'));
    else if (isDraw) dispatch(updateStats('draw'));

    const timer = setTimeout(() => dispatch(setShowModal(true)), winner ? 600 : 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver]);

  const modalMsg = winner === 'X' ? `${player1} wins!`
    : winner === 'O' ? `${player2} wins!`
    : isDraw ? "It's a Draw!"
    : '';
  const modalSub = winner === 'X' ? 'X takes the round'
    : winner === 'O' ? 'O takes the round'
    : isDraw ? 'Nobody wins this round'
    : '';

  const currentPlayerName = isXTurn ? player1 : player2;
  const currentMark = isXTurn ? 'X' : 'O';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tic Tac Toe</Text>
          <TouchableOpacity onPress={() => dispatch(resetAll())} style={styles.resetAllBtn}>
            <Text style={styles.resetAllText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        {/* Score bar */}
        <View style={styles.scoreBar}>
          <View style={styles.scoreItem}>
            <Text style={styles.scorePlayerLabel}>{player1}</Text>
            <Text style={[styles.scoreNum, styles.xColor]}>{scoreX}</Text>
            <Text style={styles.scoreMark}>X</Text>
          </View>
          <View style={styles.scoreDivider}>
            <Text style={styles.scoreDraw}>{scoreDraw}</Text>
            <Text style={styles.scoreDrawLabel}>DRAWS</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scorePlayerLabel}>{player2}</Text>
            <Text style={[styles.scoreNum, styles.oColor]}>{scoreO}</Text>
            <Text style={styles.scoreMark}>O</Text>
          </View>
        </View>

        {/* Turn indicator */}
        {!gameOver && (
          <View style={styles.turnIndicator}>
            <Text style={styles.turnText}>
              <Text style={isXTurn ? styles.xColor : styles.oColor}>{currentPlayerName}</Text>
              {"'s turn "}
              <Text style={isXTurn ? styles.xColor : styles.oColor}>({currentMark})</Text>
            </Text>
          </View>
        )}

        {/* Board */}
        <View style={styles.board}>
          {Array(9).fill(null).map((_, i) => (
            <BoardCell
              key={i}
              index={i}
              value={board[i]}
              onPress={handlePress}
              winLine={winLine}
              disabled={gameOver}
            />
          ))}
        </View>

        {/* Next round button */}
        {gameOver && (
          <TouchableOpacity style={styles.nextBtn} onPress={() => dispatch(resetRound())} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>Next Round</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Result Modal */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalEmoji}>
              {isDraw ? '🤝' : '🏆'}
            </Text>
            <Text style={styles.modalTitle}>{modalMsg}</Text>
            <Text style={styles.modalSub}>{modalSub}</Text>

            <View style={styles.modalScores}>
              <Text style={[styles.modalScoreNum, styles.xColor]}>{scoreX}</Text>
              <Text style={styles.modalScoreSep}>–</Text>
              <Text style={[styles.modalScoreNum, styles.oColor]}>{scoreO}</Text>
            </View>

            <TouchableOpacity style={styles.modalBtn} onPress={() => dispatch(resetRound())} activeOpacity={0.85}>
              <Text style={styles.modalBtnText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const CELL_SIZE = 100;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0D1A' },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  resetAllBtn: {
    backgroundColor: '#1A1A2E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A4A',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  resetAllText: { color: '#9B9BB4', fontSize: 13, fontWeight: '600' },

  scoreBar: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A4A',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreItem: { flex: 1, alignItems: 'center', gap: 2 },
  scorePlayerLabel: { color: '#6B6B8D', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  scoreNum: { fontSize: 32, fontWeight: '800' },
  scoreMark: { color: '#4A4A6A', fontSize: 11, fontWeight: '700' },
  scoreDivider: { paddingHorizontal: 16, alignItems: 'center' },
  scoreDraw: { color: '#FFD740', fontSize: 24, fontWeight: '700' },
  scoreDrawLabel: { color: '#4A4A6A', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },

  turnIndicator: {
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#1A1A2E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  turnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },

  board: {
    width: CELL_SIZE * 3 + 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cellTouch: {
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  cell: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2A2A4A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellWinner: {
    backgroundColor: '#1F1040',
    borderColor: '#7C4DFF',
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  cellText: { fontSize: 42, fontWeight: '800' },
  cellTextWinner: { opacity: 1 },
  xText: { color: '#FF4081' },
  oText: { color: '#40C4FF' },
  xColor: { color: '#FF4081' },
  oColor: { color: '#40C4FF' },

  nextBtn: {
    marginTop: 28,
    backgroundColor: '#7C4DFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 48,
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  nextBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },

  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center', alignItems: 'center',
  },
  modal: {
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: 300,
    borderWidth: 1,
    borderColor: '#2A2A4A',
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  modalEmoji: { fontSize: 52, marginBottom: 12 },
  modalTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', textAlign: 'center' },
  modalSub: { color: '#6B6B8D', fontSize: 14, marginTop: 4, marginBottom: 20 },
  modalScores: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  modalScoreNum: { fontSize: 40, fontWeight: '800' },
  modalScoreSep: { color: '#4A4A6A', fontSize: 24, fontWeight: '300' },
  modalBtn: {
    backgroundColor: '#7C4DFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 48,
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  modalBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
