import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini
// NOTE: In a real production app, ensure this is handled securely.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGodModeMove = async (fen: string, validMoves: string[]): Promise<string> => {
  try {
    const modelId = "gemini-2.5-flash"; // Fast and capable for chess logic

    const prompt = `
      You are a Grandmaster Chess Engine playing Black. 
      The current board state (FEN) is: "${fen}".
      Your available legal moves are: ${JSON.stringify(validMoves)}.
      
      Analyze the position deeply. Choose the absolute best move to win.
      Return ONLY the move string from the available list.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bestMove: {
              type: Type.STRING,
              description: "The best move in Standard Algebraic Notation (SAN) or UCI format found in the valid moves list."
            }
          },
          required: ["bestMove"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from Gemini");

    const result = JSON.parse(jsonText);
    
    // Fallback validation: ensure the move is actually in our list of valid moves
    const move = result.bestMove;
    if (validMoves.includes(move)) {
      return move;
    }
    
    // If Gemini hallucinated a move (rare with this schema), pick the first valid one as fail-safe
    return validMoves[0];

  } catch (error) {
    console.error("Gemini God Mode Error:", error);
    // Fail-safe: return random move if API fails
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
};