/// <reference path="../typings/naimo.d.ts" />

import { contextBridge } from 'electron';

// ==================== 工具函数 ====================

/**
 * 格式化时间为 MM:SS
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * 播放提示音
 */
function playNotificationSound(): void {
  // 创建音频上下文
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // 创建振荡器
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // 设置音调和音量
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  
  // 播放
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
  
  // 第二个音
  setTimeout(() => {
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    
    osc2.frequency.value = 1000;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    osc2.start(audioContext.currentTime);
    osc2.stop(audioContext.currentTime + 0.3);
  }, 200);
}

/**
 * 获取今天的日期字符串
 */
function getTodayString(): string {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

// ==================== 暴露插件 API ====================

const pomodoroAPI = {
  formatTime,
  playNotificationSound,
  getTodayString,
};

contextBridge.exposeInMainWorld('pomodoroAPI', pomodoroAPI);

// ==================== 功能处理器导出 ====================

/**
 * 导出功能处理器
 */
const handlers = {
  pomodoro: {
    onEnter: async (params: any) => {
      console.log('番茄钟功能被触发');
      console.log('参数:', params);
      
      // 功能进入时的初始化工作可以在这里完成
      // 主要的UI逻辑在 main.ts 中处理
    }
  }
};

// 使用 CommonJS 导出（Electron 环境）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = handlers;
}

// ==================== 类型扩展 ====================

declare global {
  interface Window {
    pomodoroAPI: typeof pomodoroAPI;
  }
}

