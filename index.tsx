/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- DOM Elements ---
const statusIndicator = document.getElementById('status-indicator') as HTMLDivElement;
const statusText = document.getElementById('status-text') as HTMLSpanElement;
const ipAddress = document.getElementById('ip-address') as HTMLElement;
const connectBtn = document.getElementById('connect-btn') as HTMLButtonElement;
const btnText = connectBtn.querySelector('.btn-text') as HTMLSpanElement;
const spinner = connectBtn.querySelector('.spinner') as HTMLDivElement;
const serverSelect = document.getElementById('server-select') as HTMLSelectElement;
const infoButtons = document.querySelectorAll('.info-btn');
const infoResponse = document.getElementById('info-response') as HTMLDivElement;

// --- State ---
let isConnected = false;
let isConnecting = false;
const localIp = "192.168.1.10 (Local)";

// --- Functions ---

/**
 * Generates a random public IP address for simulation.
 */
function generateFakeIp(): string {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)} (Secure)`;
}

/**
 * Updates the entire UI based on the current connection state.
 */
function updateUI() {
  if (isConnected) {
    statusIndicator.dataset.status = 'connected';
    statusText.textContent = 'Connected';
    connectBtn.dataset.status = 'connected';
    btnText.textContent = 'Disconnect';
    serverSelect.disabled = true;
    if (ipAddress.textContent === localIp) {
      ipAddress.textContent = generateFakeIp();
    }
  } else {
    statusIndicator.dataset.status = 'disconnected';
    statusText.textContent = 'Disconnected';
    connectBtn.dataset.status = 'disconnected';
    btnText.textContent = 'Connect';
    serverSelect.disabled = false;
    ipAddress.textContent = localIp;
  }

  spinner.hidden = !isConnecting;
  btnText.hidden = isConnecting;
  connectBtn.disabled = isConnecting;
}

/**
 * Handles the click event for the main connect/disconnect button.
 */
async function handleConnectClick() {
  if (isConnecting) return;

  if (isConnected) {
    // Disconnect immediately
    isConnected = false;
    updateUI();
  } else {
    // Simulate connecting
    isConnecting = true;
    btnText.textContent = 'Connecting...';
    updateUI();
    
    setTimeout(() => {
      isConnected = true;
      isConnecting = false;
      updateUI();
    }, 2000);
  }
}

/**
 * Handles clicks on the educational info buttons, fetching and displaying
 * content from the Gemini API.
 * @param {Event} e - The click event.
 */
async function handleInfoClick(e: Event) {
  const button = e.target as HTMLButtonElement;
  const prompt = button.dataset.prompt;

  if (!prompt) return;

  infoResponse.innerHTML = 'Thinking...';

  try {
    const stream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let fullResponse = "";
    infoResponse.innerHTML = ""; // Clear "Thinking..."
    for await (const chunk of stream) {
      fullResponse += chunk.text;
      infoResponse.textContent = fullResponse;
    }
  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    infoResponse.textContent = "Sorry, I couldn't fetch that information. Please try again later.";
  }
}

// --- Event Listeners ---
connectBtn.addEventListener('click', handleConnectClick);
infoButtons.forEach(button => {
  button.addEventListener('click', handleInfoClick);
});

// --- Initial UI Setup ---
updateUI();
