// app/board.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Chess } from 'chess.js';

// Simple chess board for web (since react-native-chessboard has SVG issues)
export default function BoardScreen() {
  const [chess] = useState(() => new Chess());
  const [fen, setFen] = useState(chess.fen());

  const onMove = (from: string, to: string) => {
    try {
      const result = chess.move({ from, to });
      if (result) {
        setFen(chess.fen());
      }
      return result;
    } catch (error) {
      return null;
    }
  };

  const resetGame = () => {
    chess.reset();
    setFen(chess.fen());
  };

  // Render a simple text-based board for now
  const renderBoard = () => {
    const board = chess.board();
    return (
      <View className="w-full max-w-md aspect-square bg-gray-800 p-2 rounded-lg">
        {board.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row flex-1">
            {row.map((square, colIndex) => {
              const isBlack = (rowIndex + colIndex) % 2 === 1;
              const piece = square ? square.type : null;
              const color = square ? square.color : null;
              let display = ' ';
              if (piece && color) {
                const symbols: Record<string, string> = {
                  'k': color === 'w' ? '♔' : '♚',
                  'q': color === 'w' ? '♕' : '♛',
                  'r': color === 'w' ? '♖' : '♜',
                  'b': color === 'w' ? '♗' : '♝',
                  'n': color === 'w' ? '♘' : '♞',
                  'p': color === 'w' ? '♙' : '♟',
                };
                display = symbols[piece] || ' ';
              }
              return (
                <TouchableOpacity
                  key={colIndex}
                  className={`flex-1 items-center justify-center ${isBlack ? 'bg-green-800' : 'bg-green-200'}`}
                  onPress={() => {
                    // Simple move logic - you can expand this
                    const files = 'abcdefgh';
                    const from = files[colIndex] + (8 - rowIndex);
                    // For demo, just show the square name
                    console.log('Clicked:', from);
                  }}
                >
                  <Text className={`text-3xl ${isBlack ? 'text-white' : 'text-black'}`}>
                    {display}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-900 items-center justify-center p-4">
      <Text className="text-white text-2xl font-bold mb-4">
        Chess Board
      </Text>
      
      {renderBoard()}

      <View className="flex-row gap-4 mt-6">
        <TouchableOpacity
          className="bg-blue-600 px-6 py-3 rounded-lg"
          onPress={resetGame}
        >
          <Text className="text-white font-semibold text-lg">
            Reset Game
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-600 px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold text-lg">
            Back
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-gray-400 mt-4 text-sm">
        {chess.isCheckmate() ? '🏆 Checkmate!' :
         chess.isDraw() ? '🤝 Draw!' :
         chess.isCheck() ? '⚠️ Check!' : 'Your turn'}
      </Text>
    </View>
  );
}