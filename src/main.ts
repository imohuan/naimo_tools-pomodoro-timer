/// <reference path="../typings/naimo.d.ts" />

import './style.css';

// ==================== 类型定义 ====================

type TimerState = 'idle' | 'running' | 'paused';
type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom';

interface PomodoroConfig {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
}

// ==================== 热重载 ====================
if (import.meta.hot) {
  import.meta.hot.on('preload-changed', async (data) => {
    console.log('📝 检测到 preload 变化:', data);
    console.log('🔨 正在触发 preload 构建...');
    try {
      const response = await fetch('/__preload_build');
      const result = await response.json();
      if (result.success) {
        console.log('✅ Preload 构建完成');
        await window.naimo.hot();
        console.log('🔄 Preload 热重载完成');
        location.reload();
      } else {
        console.error('❌ Preload 构建失败');
      }
    } catch (error) {
      console.error('❌ 触发 preload 构建失败:', error);
    }
  });
}

// ==================== 全局状态 ====================

let timerState: TimerState = 'idle';
let currentMode: TimerMode = 'pomodoro';
let timeRemaining: number = 25 * 60; // 秒
let timerInterval: number | null = null;
let completedPomodoros = 0;
let sessionPomodoros = 0;

const config: PomodoroConfig = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
};

// ==================== 核心功能 ====================

/**
 * 开始计时器
 */
function startTimer(): void {
  if (timerState === 'running') return;

  timerState = 'running';
  updateUI();

  timerInterval = window.setInterval(() => {
    if (timeRemaining > 0) {
      timeRemaining--;
      updateDisplay();
    } else {
      completeTimer();
    }
  }, 1000);

  naimo.log.info('计时器已启动', { mode: currentMode, duration: timeRemaining });
}

/**
 * 暂停计时器
 */
function pauseTimer(): void {
  if (timerState !== 'running') return;

  timerState = 'paused';
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  updateUI();

  naimo.log.info('计时器已暂停');
}

/**
 * 重置计时器
 */
function resetTimer(): void {
  timerState = 'idle';
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  setMode(currentMode);
  updateUI();

  naimo.log.info('计时器已重置');
}

/**
 * 完成计时器
 */
async function completeTimer(): Promise<void> {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  timerState = 'idle';

  // 播放提示音
  window.pomodoroAPI.playNotificationSound();

  // 发送通知
  if (currentMode === 'pomodoro') {
    completedPomodoros++;
    sessionPomodoros++;
    await saveStatistics();
    await naimo.system.notify('🎉 番茄钟完成！休息一下吧', '番茄钟计时器');

    // 自动切换到休息模式
    if (sessionPomodoros % config.longBreakInterval === 0) {
      setMode('longBreak');
    } else {
      setMode('shortBreak');
    }
  } else {
    await naimo.system.notify('⏰ 休息时间结束！继续加油', '番茄钟计时器');
    setMode('pomodoro');
  }

  updateUI();
  updateStatisticsDisplay();
}

/**
 * 设置模式
 */
function setMode(mode: TimerMode): void {
  currentMode = mode;

  switch (mode) {
    case 'pomodoro':
      timeRemaining = config.workDuration * 60;
      break;
    case 'shortBreak':
      timeRemaining = config.shortBreakDuration * 60;
      break;
    case 'longBreak':
      timeRemaining = config.longBreakDuration * 60;
      break;
    case 'custom':
      // 自定义时间由用户输入
      break;
  }

  updateDisplay();
  updateModeButtons();
}

/**
 * 更新显示
 */
function updateDisplay(): void {
  const display = document.getElementById('timeDisplay');
  if (display) {
    display.textContent = window.pomodoroAPI.formatTime(timeRemaining);
  }

  // 更新标题
  const modeText = {
    pomodoro: '🍅 专注工作',
    shortBreak: '☕ 短休息',
    longBreak: '🌟 长休息',
    custom: '⏱️ 自定义'
  };

  const modeTitle = document.getElementById('modeTitle');
  if (modeTitle) {
    modeTitle.textContent = modeText[currentMode];
  }
}

/**
 * 更新UI状态
 */
function updateUI(): void {
  const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
  const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;
  const resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;

  if (startBtn && pauseBtn && resetBtn) {
    if (timerState === 'running') {
      startBtn.disabled = true;
      pauseBtn.disabled = false;
      resetBtn.disabled = false;
    } else if (timerState === 'paused') {
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      resetBtn.disabled = false;
    } else {
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      resetBtn.disabled = false;
    }
  }
}

/**
 * 更新模式按钮状态
 */
function updateModeButtons(): void {
  const modes: TimerMode[] = ['pomodoro', 'shortBreak', 'longBreak'];
  modes.forEach(mode => {
    const btn = document.getElementById(`${mode}Btn`);
    if (btn) {
      if (mode === currentMode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });
}

/**
 * 保存统计数据
 */
async function saveStatistics(): Promise<void> {
  try {
    const today = window.pomodoroAPI.getTodayString();
    const stats = await naimo.storage.getItem('pomodoro_stats') || {};

    if (!stats[today]) {
      stats[today] = { count: 0, workTime: 0 };
    }

    stats[today].count++;
    stats[today].workTime += config.workDuration;

    await naimo.storage.setItem('pomodoro_stats', stats);
  } catch (error) {
    console.error('保存统计数据失败:', error);
  }
}

/**
 * 更新统计显示
 */
async function updateStatisticsDisplay(): Promise<void> {
  try {
    const today = window.pomodoroAPI.getTodayString();
    const stats = await naimo.storage.getItem('pomodoro_stats') || {};
    const todayStats = stats[today] || { count: 0, workTime: 0 };

    const statsEl = document.getElementById('statistics');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="stat-item">
          <span class="stat-label">今日完成</span>
          <span class="stat-value">${todayStats.count} 个</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">今日工作</span>
          <span class="stat-value">${todayStats.workTime} 分钟</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">本次会话</span>
          <span class="stat-value">${sessionPomodoros} 个</span>
        </div>
      `;
    }
  } catch (error) {
    console.error('更新统计显示失败:', error);
  }
}

/**
 * 设置自定义时间
 */
function setupCustomTimer(): void {
  const input = document.getElementById('customMinutes') as HTMLInputElement;
  if (!input) return;

  const minutes = parseInt(input.value);
  if (isNaN(minutes) || minutes <= 0 || minutes > 120) {
    naimo.system.notify('请输入1-120之间的数字', '番茄钟计时器');
    return;
  }

  currentMode = 'custom';
  timeRemaining = minutes * 60;
  updateDisplay();
  updateModeButtons();

  naimo.log.info('设置自定义时间', { minutes });
}

// ==================== 应用初始化 ====================

/**
 * 应用初始化
 */
async function initApp(): Promise<void> {
  console.log('番茄钟应用初始化...');

  // 绑定按钮事件
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');

  if (startBtn) startBtn.addEventListener('click', startTimer);
  if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
  if (resetBtn) resetBtn.addEventListener('click', resetTimer);

  // 绑定模式切换
  const pomodoroBtn = document.getElementById('pomodoroBtn');
  const shortBreakBtn = document.getElementById('shortBreakBtn');
  const longBreakBtn = document.getElementById('longBreakBtn');
  const customBtn = document.getElementById('customBtn');

  if (pomodoroBtn) pomodoroBtn.addEventListener('click', () => setMode('pomodoro'));
  if (shortBreakBtn) shortBreakBtn.addEventListener('click', () => setMode('shortBreak'));
  if (longBreakBtn) longBreakBtn.addEventListener('click', () => setMode('longBreak'));
  if (customBtn) customBtn.addEventListener('click', setupCustomTimer);

  // 初始化显示
  updateDisplay();
  updateUI();
  updateModeButtons();
  await updateStatisticsDisplay();

  // 记录初始化完成
  naimo.log.info('番茄钟应用初始化完成');
}

// ==================== 入口 ====================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

