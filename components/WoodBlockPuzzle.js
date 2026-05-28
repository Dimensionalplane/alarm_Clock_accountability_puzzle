import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, PanResponder, Animated, Dimensions } from 'react-native';

const GRID_SIZE = 5;
const CELL_SIZE = 50;
const SCREEN_WIDTH = Dimensions.get('window').width;

const SHAPES = [
  { id: '1', cells: [[0, 0], [0, 1], [1, 0], [1, 1]] }, // 2x2 Square
  { id: '2', cells: [[0, 0], [1, 0], [2, 0]] },        // 3x1 Line
  { id: '3', cells: [[0, 0], [0, 1], [0, 2]] },        // 1x3 Line
  { id: '4', cells: [[0, 0], [1, 0], [1, 1]] },        // L-shape small
  { id: '5', cells: [[0, 0], [1, 0], [0, 1]] },        // Corner
];

export default function WoodBlockPuzzle({ onSuccess, onFailure, settings }) {
  const [grid, setGrid] = useState(Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0)));
  const [pieces, setPieces] = useState([]);
  const [timeLeft, setTimeLeft] = useState(settings?.puzzleTimer || 60);

  useEffect(() => {
    generatePieces();
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onFailure('Timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const generatePieces = () => {
    const newPieces = [];
    for (let i = 0; i < 3; i++) {
      const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      newPieces.push({ ...randomShape, instanceId: `${randomShape.id}-${i}-${Date.now()}` });
    }
    setPieces(newPieces);
  };

  const handlePlacePiece = (piece, gridX, gridY) => {
    for (const [dx, dy] of piece.cells) {
      const nx = gridX + dx;
      const ny = gridY + dy;
      if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE || grid[ny][nx] !== 0) {
        return false;
      }
    }

    const newGrid = grid.map(row => [...row]);
    for (const [dx, dy] of piece.cells) {
      newGrid[gridY + dy][gridX + dx] = 1;
    }

    let linesCleared = 0;
    const finalGrid = newGrid.map(row => [...row]);

    for (let y = 0; y < GRID_SIZE; y++) {
      if (finalGrid[y].every(cell => cell === 1)) {
        finalGrid[y] = Array(GRID_SIZE).fill(0);
        linesCleared++;
      }
    }
    for (let x = 0; x < GRID_SIZE; x++) {
      let full = true;
      for (let y = 0; y < GRID_SIZE; y++) {
        if (finalGrid[y][x] !== 1) full = false;
      }
      if (full) {
        for (let y = 0; y < GRID_SIZE; y++) finalGrid[y][x] = 0;
        linesCleared++;
      }
    }

    setGrid(finalGrid);
    setPieces(prev => prev.filter(p => p.instanceId !== piece.instanceId));

    const winCondition = settings?.difficulty === 'hard' ? 2 : 1;
    if (linesCleared >= winCondition) {
      onSuccess();
    } else if (pieces.length === 1) {
      generatePieces();
    }

    return true;
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={[styles.timerText, timeLeft <= 10 && styles.timerUrgent]}>
          Time: {timeLeft}s
        </Text>
      </View>

      <View style={styles.grid}>
        {grid.map((row, y) => (
          <View key={y} style={styles.row}>
            {row.map((cell, x) => (
              <View key={x} style={[styles.cell, cell === 1 && styles.filledCell]} />
            ))}
          </View>
        ))}
      </View>

      <Text style={styles.hint}>
        {settings?.difficulty === 'hard' ? 'Clear 2 lines to win!' : 'Clear a line to stop the alarm!'}
      </Text>

      <View style={styles.piecesContainer}>
        {pieces.map((piece) => (
          <DraggablePiece
            key={piece.instanceId}
            piece={piece}
            onDrop={(x, y) => {
              const gridX = Math.round((x - (SCREEN_WIDTH - GRID_SIZE * CELL_SIZE) / 2) / CELL_SIZE);
              const gridY = Math.round((y - 150) / CELL_SIZE);
              return handlePlacePiece(piece, gridX, gridY);
            }}
          />
        ))}
      </View>
    </View>
  );
}

function DraggablePiece({ piece, onDrop }) {
  const pan = useState(new Animated.ValueXY())[0];

  const panResponder = useState(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        const success = onDrop(gesture.moveX, gesture.moveY);
        if (!success) {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
    })
  )[0];

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        pan.getLayout(),
        styles.piece,
        { width: CELL_SIZE * 2, height: CELL_SIZE * 2 }
      ]}
    >
      {piece.cells.map(([dx, dy], index) => (
        <View
          key={index}
          style={[
            styles.pieceCell,
            { left: dx * CELL_SIZE, top: dy * CELL_SIZE }
          ]}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  timerContainer: {
    marginBottom: 20,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  timerUrgent: {
    color: '#dc3545',
  },
  grid: {
    borderWidth: 2,
    borderColor: '#495057',
    backgroundColor: '#dee2e6',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderColor: '#ced4da',
  },
  filledCell: {
    backgroundColor: '#8b4513',
  },
  hint: {
    marginTop: 20,
    fontSize: 16,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  piecesContainer: {
    flexDirection: 'row',
    marginTop: 40,
    height: CELL_SIZE * 3,
    width: '100%',
    justifyContent: 'space-around',
  },
  piece: {
    position: 'relative',
  },
  pieceCell: {
    position: 'absolute',
    width: CELL_SIZE - 4,
    height: CELL_SIZE - 4,
    backgroundColor: '#cd853f',
    borderRadius: 4,
    margin: 2,
  },
});
