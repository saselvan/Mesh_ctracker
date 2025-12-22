class CalorieTracker {
    constructor() {
        this.dailyGoal = 2000;
        this.foods = [];
        this.history = {};
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateDisplay();
    }

    loadData() {
        const savedGoal = localStorage.getItem('dailyGoal');
        const savedFoods = localStorage.getItem('todayFoods');
        const savedHistory = localStorage.getItem('calorieHistory');
        const savedDate = localStorage.getItem('lastDate');

        if (savedGoal) {
            this.dailyGoal = parseInt(savedGoal);
        }

        const today = this.getTodayString();

        if (savedDate === today && savedFoods) {
            this.foods = JSON.parse(savedFoods);
        } else if (savedDate && savedDate !== today) {
            this.archiveYesterday(savedDate, savedFoods);
            this.foods = [];
            localStorage.setItem('todayFoods', JSON.stringify(this.foods));
        }

        if (savedHistory) {
            this.history = JSON.parse(savedHistory);
        }

        localStorage.setItem('lastDate', today);
    }

    archiveYesterday(date, foodsJson) {
        if (!foodsJson) return;

        const foods = JSON.parse(foodsJson);
        if (foods.length === 0) return;

        const total = foods.reduce((sum, food) => sum + food.calories, 0);

        this.history[date] = {
            foods: foods,
            total: total
        };

        localStorage.setItem('calorieHistory', JSON.stringify(this.history));
    }

    saveData() {
        localStorage.setItem('dailyGoal', this.dailyGoal);
        localStorage.setItem('todayFoods', JSON.stringify(this.foods));
        localStorage.setItem('calorieHistory', JSON.stringify(this.history));
        localStorage.setItem('lastDate', this.getTodayString());
    }

    getTodayString() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    formatTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const dateStr = date.toISOString().split('T')[0];
        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (dateStr === todayStr) return 'Today';
        if (dateStr === yesterdayStr) return 'Yesterday';

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    setupEventListeners() {
        const foodForm = document.getElementById('food-form');
        const setGoalBtn = document.getElementById('set-goal-btn');
        const clearDayBtn = document.getElementById('clear-day-btn');
        const clearHistoryBtn = document.getElementById('clear-history-btn');

        foodForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addFood();
        });

        setGoalBtn.addEventListener('click', () => {
            this.setDailyGoal();
        });

        clearDayBtn.addEventListener('click', () => {
            this.clearToday();
        });

        clearHistoryBtn.addEventListener('click', () => {
            this.clearHistory();
        });
    }

    addFood() {
        const nameInput = document.getElementById('food-name');
        const caloriesInput = document.getElementById('food-calories');

        const name = nameInput.value.trim();
        const calories = parseInt(caloriesInput.value);

        if (!name || isNaN(calories) || calories < 0) {
            alert('Please enter valid food name and calories');
            return;
        }

        const food = {
            id: Date.now(),
            name: name,
            calories: calories,
            time: this.formatTime()
        };

        this.foods.push(food);
        this.saveData();
        this.updateDisplay();

        nameInput.value = '';
        caloriesInput.value = '';
        nameInput.focus();
    }

    deleteFood(id) {
        this.foods = this.foods.filter(food => food.id !== id);
        this.saveData();
        this.updateDisplay();
    }

    setDailyGoal() {
        const goalInput = document.getElementById('daily-goal');
        const goal = parseInt(goalInput.value);

        if (isNaN(goal) || goal <= 0) {
            alert('Please enter a valid calorie goal');
            return;
        }

        this.dailyGoal = goal;
        this.saveData();
        this.updateDisplay();
        goalInput.value = '';
    }

    clearToday() {
        if (confirm('Are you sure you want to clear all foods for today?')) {
            this.foods = [];
            this.saveData();
            this.updateDisplay();
        }
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
            this.history = {};
            this.saveData();
            this.updateDisplay();
        }
    }

    getTotalCalories() {
        return this.foods.reduce((sum, food) => sum + food.calories, 0);
    }

    updateDisplay() {
        this.updateStats();
        this.updateProgress();
        this.updateFoodList();
        this.updateHistory();
    }

    updateStats() {
        const total = this.getTotalCalories();
        const remaining = this.dailyGoal - total;

        document.getElementById('total-calories').textContent = total;
        document.getElementById('goal-display').textContent = this.dailyGoal;
        document.getElementById('remaining-calories').textContent = remaining;

        const remainingElement = document.getElementById('remaining-calories');
        if (remaining < 0) {
            remainingElement.classList.add('over-goal');
        } else {
            remainingElement.classList.remove('over-goal');
        }
    }

    updateProgress() {
        const total = this.getTotalCalories();
        const percentage = Math.min((total / this.dailyGoal) * 100, 100);
        const actualPercentage = (total / this.dailyGoal) * 100;

        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');

        progressFill.style.width = percentage + '%';
        progressText.textContent = Math.round(actualPercentage) + '% of daily goal';

        if (actualPercentage > 100) {
            progressFill.classList.add('over-goal');
            progressText.textContent = `${Math.round(actualPercentage)}% of daily goal (${total - this.dailyGoal} over)`;
        } else {
            progressFill.classList.remove('over-goal');
        }
    }

    updateFoodList() {
        const foodList = document.getElementById('food-list');

        if (this.foods.length === 0) {
            foodList.innerHTML = '<p class="empty-message">No foods logged yet. Start tracking!</p>';
            return;
        }

        foodList.innerHTML = this.foods.map(food => `
            <div class="food-item">
                <div class="food-info">
                    <div class="food-name">${this.escapeHtml(food.name)}</div>
                    <div class="food-time">${food.time}</div>
                </div>
                <div class="food-calories">${food.calories} cal</div>
                <button class="btn-delete" onclick="tracker.deleteFood(${food.id})">Delete</button>
            </div>
        `).join('');
    }

    updateHistory() {
        const historyList = document.getElementById('history-list');
        const sortedDates = Object.keys(this.history).sort().reverse();

        if (sortedDates.length === 0) {
            historyList.innerHTML = '<p class="empty-message">No history yet</p>';
            return;
        }

        historyList.innerHTML = sortedDates.map(date => {
            const dayData = this.history[date];
            return `
                <div class="history-day">
                    <div class="history-day-header">
                        <span class="history-date">${this.formatDate(date)}</span>
                        <span class="history-total">${dayData.total} calories</span>
                    </div>
                    <div class="history-foods">
                        ${dayData.foods.map(food => `
                            <div class="history-food-item">
                                <span>${this.escapeHtml(food.name)}</span>
                                <span>${food.calories} cal</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const tracker = new CalorieTracker();
