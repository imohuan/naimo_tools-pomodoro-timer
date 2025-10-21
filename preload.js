"use strict";
const electron = require("electron");
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
function playNotificationSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.value = 800;
  oscillator.type = "sine";
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
  setTimeout(() => {
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    osc2.frequency.value = 1e3;
    osc2.type = "sine";
    gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
    osc2.start(audioContext.currentTime);
    osc2.stop(audioContext.currentTime + 0.3);
  }, 200);
}
function getTodayString() {
  const today = /* @__PURE__ */ new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}
const pomodoroAPI = {
  formatTime,
  playNotificationSound,
  getTodayString
};
electron.contextBridge.exposeInMainWorld("pomodoroAPI", pomodoroAPI);
const handlers = {
  pomodoro: {
    onEnter: async (params) => {
      console.log("番茄钟功能被触发");
      console.log("参数:", params);
    }
  }
};
if (typeof module !== "undefined" && module.exports) {
  module.exports = handlers;
}
