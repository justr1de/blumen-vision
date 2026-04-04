/**
 * Voice Transcription — placeholder (Manus Forge removed)
 * Integrate with Google Cloud Speech-to-Text or Whisper as needed.
 */
export async function transcribeAudio(_params: { audioUrl: string; language?: string; prompt?: string }): Promise<{ text: string }> {
  console.warn("[VoiceTranscription] Not configured. Implement your own transcription service.");
  throw new Error("Voice transcription service not configured");
}
