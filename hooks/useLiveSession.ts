import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ConnectionState, Scenario } from '../types';
import { base64ToBytes, decodeAudioData, pcmToGeminiBlob } from '../audioUtils';

export const useLiveSession = () => {
  const [status, setStatus] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);

  // Refs for audio handling to avoid re-renders
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourceNodesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  // Helper to safely close audio contexts
  const cleanupAudio = useCallback(() => {
    if (inputSourceRef.current) {
      inputSourceRef.current.disconnect();
      inputSourceRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    
    // Stop all currently playing audio
    sourceNodesRef.current.forEach(node => {
      try { node.stop(); } catch (e) {}
    });
    sourceNodesRef.current.clear();
    nextStartTimeRef.current = 0;
    sessionPromiseRef.current = null;
  }, []);

  const disconnect = useCallback(async () => {
    setStatus(ConnectionState.DISCONNECTED);
    
    // Try to close session if active
    if (sessionPromiseRef.current) {
      try {
        const session = await sessionPromiseRef.current;
        session.close();
      } catch (e) {
        console.error("Error closing session:", e);
      }
    }
    
    cleanupAudio();
    setVolume(0);
    setActiveScenario(null);
  }, [cleanupAudio]);

  const connect = useCallback(async (scenario: Scenario) => {
    try {
      setStatus(ConnectionState.CONNECTING);
      setError(null);
      setActiveScenario(scenario);

      // Initialize Audio Contexts
      const InputContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputContext = new InputContextClass({ sampleRate: 16000 });
      const outputContext = new InputContextClass({ sampleRate: 24000 });
      
      inputAudioContextRef.current = inputContext;
      outputAudioContextRef.current = outputContext;

      // Microphone access
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = mediaStream;

      // Gemini Setup
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Start Session
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: scenario.systemInstruction,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connection Opened');
            setStatus(ConnectionState.CONNECTED);

            // Setup Audio Input Pipeline
            const source = inputContext.createMediaStreamSource(mediaStream);
            inputSourceRef.current = source;

            const processor = inputContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Calculate volume for visualizer
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) {
                sum += inputData[i] * inputData[i];
              }
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(Math.min(rms * 5, 1)); // Amplify for visual effect

              // Create PCM Blob and send
              const blob = pcmToGeminiBlob(inputData);
              
              // Ensure we use the promised session to avoid stale closures
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: blob });
              }).catch(err => {
                console.error("Error sending audio:", err);
              });
            };

            source.connect(processor);
            processor.connect(inputContext.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Interruption
            if (msg.serverContent?.interrupted) {
               sourceNodesRef.current.forEach(node => {
                 try { node.stop(); } catch (e) {}
               });
               sourceNodesRef.current.clear();
               nextStartTimeRef.current = 0;
               return;
            }

            // Handle Audio Output
            const audioDataStr = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioDataStr && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              
              // Ensure time doesn't drift too far behind
              const currentTime = ctx.currentTime;
              if (nextStartTimeRef.current < currentTime) {
                nextStartTimeRef.current = currentTime;
              }

              try {
                const rawBytes = base64ToBytes(audioDataStr);
                const audioBuffer = await decodeAudioData(rawBytes, ctx);
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;

                sourceNodesRef.current.add(source);
                source.onended = () => {
                  sourceNodesRef.current.delete(source);
                };
              } catch (decodingError) {
                console.error("Audio decoding error", decodingError);
              }
            }
          },
          onclose: () => {
            console.log('Gemini Live Connection Closed');
            if (status !== ConnectionState.DISCONNECTED) {
               setStatus(ConnectionState.DISCONNECTED);
            }
          },
          onerror: (err) => {
            console.error('Gemini Live Error:', err);
            setError("連線發生錯誤，請稍後再試。");
            setStatus(ConnectionState.ERROR);
            cleanupAudio();
          }
        }
      });
      
      sessionPromiseRef.current = sessionPromise;

    } catch (e: any) {
      console.error("Connection failed:", e);
      setError(e.message || "無法連接麥克風或伺服器。");
      setStatus(ConnectionState.ERROR);
      cleanupAudio();
    }
  }, [cleanupAudio, status]);

  return {
    status,
    connect,
    disconnect,
    volume,
    error,
    activeScenario
  };
};