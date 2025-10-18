const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const statusEl = document.getElementById('status');
const liveIndicator = document.getElementById('live-indicator');
const context = canvas.getContext('2d');

const FRAME_INTERVAL_MS = 1000;
let ws;

function setStatus(text, colorClass) {
    statusEl.textContent = text;
    statusEl.className = `absolute bottom-4 left-4 py-1 px-3 rounded-full text-white font-semibold ${colorClass}`;
}

async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment', // Prefer back camera
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        };
    } catch (err) {
        console.error("Error accessing camera:", err);
        setStatus('Camera Error', 'bg-red-500');
        alert("Could not access the camera. Please check permissions and refresh.");
    }
}

function connectWebSocket() {
    const wsUrl = `ws://${window.location.host}/?role=phone`;
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('Connected to WebSocket server.');
        setStatus('Connected', 'bg-green-500');
        liveIndicator.classList.remove('bg-red-500');
        liveIndicator.classList.add('bg-green-500');

        setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                ws.send(dataUrl);
            }
        }, FRAME_INTERVAL_MS);
    };

    ws.onclose = () => {
        console.log('Disconnected from WebSocket server.');
        setStatus('Disconnected. Retrying...', 'bg-yellow-500');
        liveIndicator.classList.add('bg-red-500');
        liveIndicator.classList.remove('bg-green-500');
        setTimeout(connectWebSocket, 3000); // Retry connection
    };

    ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setStatus('Connection Error', 'bg-red-500');
        ws.close();
    };
}

initCamera();
connectWebSocket();
