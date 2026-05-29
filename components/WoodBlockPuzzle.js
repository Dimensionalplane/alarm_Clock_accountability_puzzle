import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, PanResponder, Animated, Dimensions } from 'react-native';

const GRID_SIZE = 5;
const CELL_SIZE = Math.min(50, (Dimensions.get('window').width - 60) / GRID_SIZE);

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
  const [gridLayout, setGridLayout] = useState({ x: 0, y: 0 });

  // Use refs to avoid stale closures in PanResponder
  const gridRef = useRef(grid);
  const piecesRef = useRef(pieces);
  const containerRef = useRef(null);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    piecesRef.current = pieces;
  }, [pieces]);

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

  const onGridLayout = (event) => {
    if (containerRef.current) {
      containerRef.current.measure((fx, fy, width, height, px, py) => {
        setGridLayout({ x: px, y: py });
      });
    }
  };

  const handlePlacePiece = (pieceId, gestureX, gestureY) => {
    const piece = piecesRef.current.find(p => p.instanceId === pieceId);
    if (!piece) return false;

    const currentGrid = gridRef.current;
    const gridX = Math.round((gestureX - gridLayout.x) / CELL_SIZE);
    const gridY = Math.round((gestureY - gridLayout.y) / CELL_SIZE);

    // Validate placement
    for (const [dx, dy] of piece.cells) {
      const nx = gridX + dx;
      const ny = gridY + dy;
      if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE || currentGrid[ny][nx] !== 0) {
        return false;
      }
    }

    // Place piece
    const newGrid = currentGrid.map(row => [...row]);
    for (const [dx, dy] of piece.cells) {
      newGrid[gridY + dy][gridX + dx] = 1;
    }

    // Identify lines to clear
    const rowsToClear = [];
    const colsToClear = [];

    for (let y = 0; y < GRID_SIZE; y++) {
      if (newGrid[y].every(cell => cell === 1)) {
        rowsToClear.push(y);
      }
    }

    for (let x = 0; x < GRID_SIZE; x++) {
      let full = true;
      for (let y = 0; y < GRID_SIZE; y++) {
        if (newGrid[y][x] !== 1) {
          full = false;
          break;
        }
      }
      if (full) {
        colsToClear.push(x);
      }
    }

    // Clear lines
    const finalGrid = newGrid.map(row => [...row]);
    rowsToClear.forEach(y => {
      finalGrid[y] = Array(GRID_SIZE).fill(0);
    });
    colsToClear.forEach(x => {
      for (let y = 0; y < GRID_SIZE; y++) {
        finalGrid[y][x] = 0;
      }
    });

    const linesCleared = rowsToClear.length + colsToClear.length;
    setGrid(finalGrid);

    const remainingPieces = piecesRef.current.filter(p => p.instanceId !== pieceId);
    if (remainingPieces.length === 0) {
      generatePieces();
    } else {
      setPieces(remainingPieces);
    }

    const winCondition = settings?.difficulty === 'hard' ? 2 : 1;
    if (linesCleared >= winCondition) {
      onSuccess();
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

      <View
        ref={containerRef}
        onLayout={onGridLayout}
        style={styles.grid}
      >
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
            onDrop={(x, y) => handlePlacePiece(piece.instanceId, x, y)}
          />
        ))}
      </View>
    </View>
  );
}

function DraggablePiece({ piece, onDrop }) {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        const success = onDrop(gesture.moveX, gesture.moveY);
        if (!success) {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        } else {
          // Success! Reset position for next use (though this piece instance is removed)
          pan.setValue({ x: 0, y: 0 });
        }
      },
    })
  ).current;

  return (
    <View style={styles.pieceWrapper}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
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
    textAlign: 'center',
  },
  piecesContainer: {
    flexDirection: 'row',
    marginTop: 40,
    height: CELL_SIZE * 3.5,
    width: '100%',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  pieceWrapper: {
    width: CELL_SIZE * 2.5,
    height: CELL_SIZE * 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  piece: {
    position: 'relative',
    zIndex: 100,
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
