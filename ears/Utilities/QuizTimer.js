import { updateDashboard } from "../home/public.js";
import { hideLoading, showLoading } from "./loader.js";
import { showNotification } from "./notification.js";

export default class QuizTimer {
  constructor(durationInMinutes, displayElement) {
    this.totalSeconds = durationInMinutes * 60;
    this.displayElement = displayElement;
    this.timerInterval = null;
    this.isTimeUp = false;
    this.warningThreshold = 5 * 60; // 5 minutes warning
    this.dangerThreshold = 1 * 60; // 1 minute danger
  }

  start() {
    this.updateDisplay();
    this.timerInterval = setInterval(() => {
      this.updateTimer();
    }, 1000);
  }

  updateTimer() {
    if (this.totalSeconds <= 0) {
      this.timeUp();
      return;
    }   
    
    this.totalSeconds--;
    this.updateDisplay();
    
    if (this.totalSeconds <= this.dangerThreshold) {
      this.displayElement.classList.add('danger');
      this.displayElement.classList.remove('warning');
    } else if (this.totalSeconds <= this.warningThreshold) {
      this.displayElement.classList.add('warning');
    }
  }

  updateDisplay() {
    const timeData = this.calculateTimeUnits(this.totalSeconds);
    this.displayElement.textContent = this.formatTimeString(timeData);
  }

  calculateTimeUnits(totalSeconds) {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return { days, hours, minutes, seconds };
  }

  formatTimeString({ days, hours, minutes, seconds }) {
    // Format seconds with leading zero
    const formattedSec = seconds < 10 ? `0${seconds}` : seconds;
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${formattedSec}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${formattedSec}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${formattedSec}s`;
    } else {
      return `${formattedSec}s`;
    }
  }

  timeUp() {
    clearInterval(this.timerInterval);
    this.isTimeUp = true;
    this.displayElement.textContent = "00:00";
    this.displayElement.className = 'danger';
    this.submitQuiz();
    showLoading();
    setTimeout(async () => {
      await updateDashboard();
      hideLoading()
    }, 1500);
    showNotification("Time's up. Note: No marks if not submitted within the time limit.", 'info')
  }

  submitQuiz() {
    document.querySelectorAll('.answer-radio').forEach(radio => {
      radio.disabled = true;
    });
    
    const warning = document.createElement('div');
    warning.className = 'time-up-warning';
    warning.innerHTML = `
      <i class="fas fa-exclamation-triangle"></i>
      Time's up! Your answers will be submitted automatically.
    `;
    document.querySelector('.quiz-header').appendChild(warning);
  }
}