AI Engine Guardian

Real-Time Acoustic Engine Fault Detection (Web-Based Prototype)

Overview

AI Engine Guardian is a real-time acoustic anomaly detection system designed to identify abnormal engine behavior using sound analysis. The system records engine audio, builds a statistical profile of healthy operation, and detects deviations during monitoring.

This implementation avoids external machine learning libraries and instead uses mathematical feature extraction and statistical modeling for fault detection.

Objective

The objective of this project is to detect early-stage engine abnormalities by analyzing acoustic signals and computing deviation from a calibrated healthy baseline.

Methodology

The system operates in two phases:

1. Calibration Phase (10 seconds)

Records healthy engine sound.

Extracts acoustic features in real time.

Computes mean (μ) and standard deviation (σ) for each feature.

Builds a statistical baseline model.

2. Monitoring Phase

Continuously extracts features from live audio.

Computes normalized Z-score deviation from baseline.

Converts deviation into a Risk Percentage.

Displays system status based on deviation level.

Extracted Features

The following signal features are computed using Web Audio API:

RMS Energy

Zero Crossing Rate (ZCR)

Spectral Centroid

Spectral Bandwidth

Spectral Flux

These features provide a multidimensional representation of engine sound behavior.

Anomaly Scoring

Risk is computed using normalized Z-score deviation:

Feature deviation is calculated as:
(current value − mean) / standard deviation

Root mean square (RMS) of all Z-scores is computed.

The result is scaled to a 0–100 risk score.

Risk Interpretation

0–40% → Normal

40–70% → Warning

Above 70% → Engine Fault

Technology Stack

HTML

CSS

JavaScript

Web Audio API

FFT via AnalyserNode

Pure mathematical anomaly detection

Project Structure
AI-Engine-Guardian/
│
├── index.html
├── style.css
├── app.js
└── README.md
How to Run
Step 1: Install Python

Ensure Python is installed on your system.
Download from https://www.python.org/downloads/
 if required.

Step 2: Open Project Folder in Terminal

Navigate to the project directory.

On Windows:

Open the project folder.

Click the address bar.

Type cmd and press Enter.

On macOS/Linux:

Right-click the folder.

Select “Open in Terminal”.

Step 3: Start Local Server

Run:

python -m http.server 8000

If that does not work, try:

python3 -m http.server 8000

You should see a message indicating the server is running.

Step 4: Open in Browser

Open:

http://localhost:8000

Do not open the file directly using file:// because microphone access requires HTTP.

Step 5: Calibration and Monitoring

Click Calibrate (Healthy)

Allow microphone access when prompted

Keep the engine running at steady RPM for 10 seconds

After calibration completes, click Start Monitoring

Observe real-time risk percentage and system status

Important Notes

Calibration must be completed before monitoring.

The system works best when the engine remains stable during calibration.

This is a prototype focused on demonstrating real-time acoustic anomaly detection using statistical modeling.

Future Improvements

Adaptive baseline updating

Fault-type classification

Data logging and storage

Cloud-based analytics

Neural network-based anomaly detection
