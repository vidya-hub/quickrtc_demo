const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { Server } = require("socket.io");
const { QuickRTCServer } = require("quickrtc-server");
const app = express();
const port = 3000;

// SSL certificate paths
const certsDir = path.join(__dirname, "..", "certs");
const keyPath = path.join(certsDir, "key.pem");
const certPath = path.join(certsDir, "cert.pem");

// SSL options
const sslOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

// CORS configuration
app.use(
  cors({
    origin: "https://localhost:5173",
    credentials: true,
  })
);

// Middleware to parse JSON bodies
app.use(express.json());

// Sample route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start the HTTPS server
const httpsServer = https.createServer(sslOptions, app).listen(port, () => {
  console.log(`HTTPS Server is running at https://localhost:${port}`);
});

// Create Socket.io server with CORS
const io = new Server(httpsServer, {
  cors: {
    origin: "https://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const quickrtcServer = new QuickRTCServer({
  httpServer: httpsServer,
  socketServer: io,
  mediasoup: {
    workerSettings: {
      logLevel: "warn",
      logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"],
      rtcMinPort: 40000,
      rtcMaxPort: 49999,
    },
    routerOptions: {
      mediaCodecs: [
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: "video",
          mimeType: "video/H264",
          clockRate: 90000,
          parameters: {
            "packetization-mode": 1,
            "profile-level-id": "42e01f",
            "level-asymmetry-allowed": 1,
          },
        },
        {
          kind: "video",
          mimeType: "video/VP8",
          clockRate: 90000,
          parameters: {},
        },
      ],
    },
    transportOptions: {
      listenIps: [
        {
          ip: "127.0.0.1",
          announcedIp: null,
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      enableSctp: false,
    },
  },
});
quickrtcServer.start();
/*

// Generate self-signed SSL certificates if they don't exist
function generateSSLCertificates() {
  if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir, { recursive: true });
  }

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.log("Generating self-signed SSL certificates...");
    try {
      execSync(
        `openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/CN=localhost"`,
        { stdio: "inherit" }
      );
      console.log("SSL certificates generated successfully.");
    } catch (error) {
      console.error("Failed to generate SSL certificates:", error.message);
      console.error("Make sure OpenSSL is installed on your system.");
      process.exit(1);
    }
  }
}

// Generate certificates
generateSSLCertificates();

*/
