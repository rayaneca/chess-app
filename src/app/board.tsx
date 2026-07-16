// app/board.tsx - Full Chess Game (reset, flip, undo, checkmate/draw detection, move history, captures)
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
  ScrollView,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chess, type Move } from 'chess.js';
import Chessboard, { type ChessboardRef } from 'react-native-chessboard';
import { router } from 'expo-router';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_SIZE = Math.floor(Math.min(SCREEN_WIDTH - 48, 420) / 8) * 8;
const SQUARE = BOARD_SIZE / 8;

const PIECE_UNICODE: Record<string, string> = {
  wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
  bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟',
};

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

type Orientation = 'white' | 'black';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BoardScreen() {
  const gameRef = useRef(new Chess());
  const boardRef = useRef<ChessboardRef>(null);
  const historyScrollRef = useRef<ScrollView>(null);

  const [fen, setFen] = useState(gameRef.current.fen());
  const [orientation, setOrientation] = useState<Orientation>('white');
  const [history, setHistory] = useState<Move[]>([]);
  const [gameOver, setGameOver] = useState<{ title: string; subtitle: string } | null>(null);
  const [checkNow, setCheckNow] = useState(false);

  // -- derived data ----------------------------------------------------------

  const turn = useMemo(() => (gameRef.current.turn() === 'w' ? 'white' : 'black'), [fen]);

  const movePairs = useMemo(() => {
    const pairs: { no: number; white?: string; black?: string }[] = [];
    for (let i = 0; i < history.length; i += 2) {
      pairs.push({ no: i / 2 + 1, white: history[i]?.san, black: history[i + 1]?.san });
    }
    return pairs;
  }, [history]);

  const { capturedByWhite, capturedByBlack, materialDiff } = useMemo(() => {
    const w: string[] = [];
    const b: string[] = [];
    history.forEach((m) => {
      if (m.captured) {
        if (m.color === 'w') w.push(m.captured);
        else b.push(m.captured);
      }
    });
    const wVal = w.reduce((s, p) => s + (PIECE_VALUES[p] ?? 0), 0);
    const bVal = b.reduce((s, p) => s + (PIECE_VALUES[p] ?? 0), 0);
    return { capturedByWhite: w, capturedByBlack: b, materialDiff: wVal - bVal };
  }, [history]);

  const filesDisplay = orientation === 'white'
    ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];

  const ranksDisplay = orientation === 'white'
    ? [8, 7, 6, 5, 4, 3, 2, 1]
    : [1, 2, 3, 4, 5, 6, 7, 8];

  // -- sync helpers ------------------------------------------------------------

  const refreshFromGame = () => {
    const g = gameRef.current;
    setFen(g.fen());
    setHistory(g.history({ verbose: true }));
    setCheckNow(g.isCheck() && !g.isCheckmate());

    if (g.isGameOver()) {
      let title = 'Game Over';
      let subtitle = '';

      if (g.isCheckmate()) {
        const winner = g.turn() === 'w' ? 'Black' : 'White';
        title = 'Checkmate!';
        subtitle = `${winner} wins the game`;
        Vibration.vibrate([0, 80, 60, 80]);
      } else if (g.isStalemate()) {
        title = 'Stalemate';
        subtitle = "It's a draw — no legal moves left";
      } else if (g.isThreefoldRepetition()) {
        title = 'Draw';
        subtitle = 'Draw by threefold repetition';
      } else if (g.isInsufficientMaterial()) {
        title = 'Draw';
        subtitle = 'Draw by insufficient material';
      } else if (g.isDraw()) {
        title = 'Draw';
        subtitle = 'Draw by the 50-move rule';
      }
      setGameOver({ title, subtitle });
    } else {
      setGameOver(null);
    }
  };

  // react-native-chessboard resolves moves internally (its own chess.js), then
  // hands us the resulting FEN. We reconcile that against OUR chess.js instance
  // by testing every legal move and finding the one that produces a matching
  // position — this keeps full SAN history, captures, and game-over detection
  // reliable regardless of what the board library's internal engine reports.
  const handleMove = (info: any) => {
    const newFen: string | undefined = info?.state?.fen ?? info?.fen;
    if (!newFen) return;

    const g = gameRef.current;
    const before = g.fen();
    const normalize = (f: string) => f.split(' ').slice(0, 4).join(' ');

    const legalMoves = g.moves({ verbose: true });
    const match = legalMoves.find((m) => {
      const clone = new Chess(before);
      clone.move(m);
      return normalize(clone.fen()) === normalize(newFen);
    });

    if (match) {
      g.move(match);
    } else {
      try {
        g.load(newFen);
      } catch {
        // ignore malformed fen, board stays in sync on next legal move
      }
    }

    Vibration.vibrate(10);
    refreshFromGame();
  };

  const newGame = () => {
    gameRef.current = new Chess();
    boardRef.current?.resetBoard();
    boardRef.current?.resetAllHighlightedSquares();
    setHistory([]);
    setFen(gameRef.current.fen());
    setGameOver(null);
    setCheckNow(false);
  };

  const resetGame = () => {
    if (history.length > 0 && !gameOver) {
      Alert.alert('Start a new game?', 'Your current game will be lost.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'New Game', style: 'destructive', onPress: newGame },
      ]);
    } else {
      newGame();
    }
  };

  const undoMove = () => {
    if (history.length === 0) return;
    boardRef.current?.undo();
    gameRef.current.undo();
    refreshFromGame();
  };

  const flipBoard = () => {
    setOrientation((prev) => (prev === 'white' ? 'black' : 'white'));
  };

  useEffect(() => {
    historyScrollRef.current?.scrollToEnd({ animated: true });
  }, [history.length]);

  // -- piece rendering (counter-rotated so flip only moves position, not the glyphs) --

  const renderPiece = (piece: string) => {
    const isWhite = piece[0] === 'w';
    const glyph = PIECE_UNICODE[piece] ?? '';
    return (
      <View style={{ transform: [{ rotate: orientation === 'black' ? '180deg' : '0deg' }] }}>
        <Text
          style={{
            fontSize: SQUARE * 0.72,
            lineHeight: SQUARE * 0.78,
            color: isWhite ? '#f5f3ee' : '#14161a',
            textShadowColor: isWhite ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.2)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}
        >
          {glyph}
        </Text>
      </View>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <SafeAreaView className="flex-1 bg-gray-600 items-center p-4">
      <Text className="text-white text-3xl font-bold mb-2 mt-2 ">♟️ Chess ya la3ziz</Text>



      {/* Captured pieces / material */}
      <View className="w-full max-w-md mb-2" style={{ gap: 4 }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-slate-300 text-xs">
            White captured: {capturedByWhite.map((p) => PIECE_UNICODE['b' + p]).join(' ') || '—'}
          </Text>
          {materialDiff > 0 && <Text className="text-emerald-300 text-xs font-bold">+{materialDiff}</Text>}
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-slate-300 text-xs">
            Black captured: {capturedByBlack.map((p) => PIECE_UNICODE['w' + p]).join(' ') || '—'}
          </Text>
          {materialDiff < 0 && <Text className="text-emerald-300 text-xs font-bold">+{-materialDiff}</Text>}
        </View>
      </View>

      {/* Board with rank/file labels */}
      <View className="flex-row items-center justify-center">
        <View style={{ height: BOARD_SIZE, justifyContent: 'space-between', marginRight: 6 }}>
          {ranksDisplay.map((r) => (
            <Text
              key={r}
              style={{ height: SQUARE, width: 14, color: '#94a3b8', fontSize: 11, textAlign: 'center' }}
            >
              {r}
            </Text>
          ))}
        </View>

        <View>
          <View
            style={{
              width: BOARD_SIZE,
              height: BOARD_SIZE,
              borderRadius: 8,
              overflow: 'hidden',
              transform: [{ rotate: orientation === 'black' ? '180deg' : '0deg' }],
            }}
          >
            <Chessboard
              ref={boardRef}
              fen={fen}
              boardSize={BOARD_SIZE}
              withLetters={false}
              withNumbers={false}
              gestureEnabled={!gameOver}
              onMove={handleMove}
              renderPiece={renderPiece}
              colors={{
                black: '#4b7399',
                white: '#eae9d2',
                lastMoveHighlight: 'rgba(246, 246, 105, 0.65)',
                checkmateHighlight: '#e0544d',
                promotionPieceButton: '#f0a04b',
              }}
              durations={{ move: 180 }}
            />
          </View>

          <View style={{ flexDirection: 'row', width: BOARD_SIZE, justifyContent: 'space-between', marginTop: 4 }}>
            {filesDisplay.map((f) => (
              <Text key={f} style={{ width: SQUARE, textAlign: 'center', color: '#94a3b8', fontSize: 11 }}>
                {f}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* Controls */}
      <View className="flex-row flex-wrap justify-center mt-1" style={{ gap: 10 }}>
        <TouchableOpacity className="bg-blue-600 px-5 py-3 rounded-lg" onPress={resetGame}>
          <Text className="text-white font-bold">🔄 New Game</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="px-5 py-3 rounded-lg"
          style={{ backgroundColor: history.length === 0 ? '#4b5563' : '#7c3aed' }}
          onPress={undoMove}
          disabled={history.length === 0}
        >
          <Text className="text-white font-bold">↩️ Undo</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-orange-600 px-5 py-3 rounded-lg" onPress={flipBoard}>
          <Text className="text-white font-bold">🔃 Flip</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-gray-600 px-5 py-3 rounded-lg" onPress={() => router.back()}>
          <Text className="text-white font-bold">⬅️ Back</Text>
        </TouchableOpacity>
      </View>

      {/* Move history */}
      <View className="w-full max-w-md mt-5 bg-gray-800 rounded-lg p-3" style={{ height: 130 }}>
        <Text className="text-slate-300 font-semibold mb-2">Moves</Text>
        <ScrollView ref={historyScrollRef}>
          {movePairs.map((p) => (
            <View key={p.no} className="flex-row" style={{ gap: 12 }}>
              <Text style={{ width: 24, color: '#64748b' }}>{p.no}.</Text>
              <Text style={{ width: 70, color: '#e2e8f0' }}>{p.white ?? ''}</Text>
              <Text style={{ width: 70, color: '#e2e8f0' }}>{p.black ?? ''}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Game over modal */}
      <Modal visible={!!gameOver} transparent animationType="fade" onRequestClose={() => setGameOver(null)}>
        <View className="flex-1 items-center justify-center p-6" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <View className="bg-gray-800 rounded-2xl p-6 items-center w-full" style={{ maxWidth: 360 }}>
            <Text style={{ fontSize: 30, marginBottom: 6 }}>🏆</Text>
            <Text className="text-white text-2xl font-bold mb-1">{gameOver?.title}</Text>
            <Text className="text-slate-300 text-sm mb-5 text-center">{gameOver?.subtitle}</Text>
            <View className="flex-row" style={{ gap: 12 }}>
              <TouchableOpacity className="bg-blue-600 px-5 py-3 rounded-lg" onPress={newGame}>
                <Text className="text-white font-bold">New Game</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-gray-600 px-5 py-3 rounded-lg" onPress={() => setGameOver(null)}>
                <Text className="text-white font-bold">Review Board</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}