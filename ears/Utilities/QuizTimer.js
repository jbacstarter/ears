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
    this.updateDisplay(); // Initial display update
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
    
    // Update visual warnings
    if (this.totalSeconds <= this.dangerThreshold) {
      this.displayElement.classList.add('danger');
      this.displayElement.classList.remove('warning');
    } else if (this.totalSeconds <= this.warningThreshold) {
      this.displayElement.classList.add('warning');
    }
  }

  updateDisplay() {
    const minutes = Math.floor(this.totalSeconds / 60);
    let seconds = this.totalSeconds % 60;
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    this.displayElement.textContent = `${minutes}:${seconds}`;
  }

  timeUp() {
    clearInterval(this.timerInterval);
    this.isTimeUp = true;
    this.displayElement.textContent = "00:00";
    this.displayElement.className = 'danger';
    
    // Automatically submit the quiz
    this.submitQuiz();
  }

  submitQuiz() {
    // Disable all answer inputs
    document.querySelectorAll('.answer-radio').forEach(radio => {
      radio.disabled = true;
    });
    
    // Show time's up message
    const warning = document.createElement('div');
    warning.className = 'time-up-warning';
    warning.innerHTML = `
      <i class="fas fa-exclamation-triangle"></i>
      Time's up! Your answers will be submitted automatically.
    `;
    document.querySelector('.quiz-header').appendChild(warning);
    
    // Trigger your quiz submission logic here
    // submitQuizAnswers();
  }
}
