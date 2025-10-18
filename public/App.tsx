import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import LatestItemCard from './components/LatestItemCard';
import CounterCard from './components/CounterCard';
import HistoryCard from './components/HistoryCard';
import { Status } from './types';

// Extend Status to include WebSocket states
type AppStatus = Status | 'Connecting' | 'AwaitingPhone';

const DETECTION_CONFIRMATION_COUNT = 2; // Must see the same item this many times to confirm

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>('Initializing');
  const [latestDetection, setLatestDetection] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [detectedItems, setDetectedItems] = useState<Set<string>>(new Set());
  const [pendingDetection, setPendingDetection] = useState<{ name: string; count: number } | null>(null);
  const [latestImage, setLatestImage] = useState<string | null>(null);
  const [phoneUrl, setPhoneUrl] = useState<string>('');
  
  const dingAudioRef = useRef<HTMLAudioElement>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const ws = useRef<WebSocket | null>(null);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  useEffect(() => {
    // Generate the phone URL and QR code using the browser's location.
    const setup = () => {
      try {
        const url = `http://${window.location.hostname}:${window.location.port}/phone.html`;
        setPhoneUrl(url);

        // Robustly check for QRCode library before using it
        if (qrCodeRef.current && (window as any).QRCode) {
          qrCodeRef.current.innerHTML = '';
          new (window as any).QRCode(qrCodeRef.current, {
            text: url,
            width: 192,
            height: 192,
          });
          setStatus('AwaitingPhone');
        } else if (qrCodeRef.current) {
            // If the library isn't loaded, wait and try again.
            setTimeout(setup, 100);
        }
      } catch (error) {
        console.error("Failed to generate QR code:", error);
        setStatus('Error');
      }
    };
    setup();
  }, []);

  useEffect(() => {
    const connect = () => {
      const wsUrl = `ws://${window.location.host}/?role=display`;
      ws.current = new WebSocket(wsUrl);
      setStatus('Connecting');

      ws.current.onopen = () => {
        console.log('Connected to WebSocket server.');
        if (!latestImage) { // Only set back to awaiting if no image stream yet
          setStatus('AwaitingPhone');
        }
      };

      ws.current.onmessage = (event) => {
        setStatus('Detecting');
        const data = JSON.parse(event.data);
        
        if (data.image) {
          setLatestImage(data.image);
        }

        if (data.error) {
            console.error("Server error:", data.error);
            setStatus('Error');
            return;
        }

        if (data.result && !data.result.toLowerCase().includes('not food')) {
            const result = data.result;
            const normalizedName = result.trim().toUpperCase();

            if (pendingDetection && pendingDetection.name === normalizedName) {
                const newCount = pendingDetection.count + 1;
                
                if (newCount >= DETECTION_CONFIRMATION_COUNT) {
                    setLatestDetection(result);
                    setHistory(prev => [result, ...prev.slice(0, 9)]);

                    if (!detectedItems.has(normalizedName)) {
                        dingAudioRef.current?.play();
                        speak(result);
                        setDetectedItems(prev => new Set(prev).add(normalizedName));
                    }
                    setPendingDetection(null);
                } else {
                  setPendingDetection({ name: normalizedName, count: newCount });
                }
            } else {
              setPendingDetection({ name: normalizedName, count: 1 });
            }
        } else {
            setPendingDetection(null);
        }
        setTimeout(() => setStatus('Ready'), 200);
      };
      
      ws.current.onclose = () => {
          console.log('Disconnected. Retrying...');
          setStatus('Connecting');
          setTimeout(connect, 3000);
      };

      ws.current.onerror = (err) => {
          console.error("WebSocket Error:", err);
          setStatus('Error');
          ws.current?.close();
      };
    };

    connect();

    return () => {
      ws.current?.close();
    }
  }, [speak, detectedItems, pendingDetection, latestImage]);

  return (
    <div className="max-w-3xl mx-auto p-4 text-slate-800">
      <audio ref={dingAudioRef} src="/ding.mp3" preload="auto"></audio>
      <Header status={status} />
      <main className="pt-4 grid gap-6">
        <div className="relative bg-black rounded-lg shadow-md overflow-hidden aspect-video flex items-center justify-center">
          {latestImage ? (
            <img src={latestImage} className="w-full h-full object-contain" alt="Live feed from phone" />
          ) : (
            <div className="text-white p-4 text-center">
              <h2 className="text-2xl font-bold mb-4">Connect Your Phone Camera</h2>
              <p className="mb-4">Scan the QR code with your phone or open this URL:</p>
              <div ref={qrCodeRef} className="bg-white p-4 inline-block rounded-lg"></div>
              <p className="mt-4 break-all font-mono text-sm">{phoneUrl}</p>
            </div>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <LatestItemCard detection={latestDetection} isDetecting={status === 'Detecting'} />
          <CounterCard count={detectedItems.size} />
        </div>

        <HistoryCard items={history} />
      </main>
    </div>
  );
};

export default App;