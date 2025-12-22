# Mesh_ctracker

A simple and elegant calorie tracking web application built with vanilla JavaScript. Track your daily food intake, set calorie goals, and monitor your progress with a clean, mobile-friendly interface.

## Features

- **Track Food Items**: Add food entries with names and calorie counts
- **Daily Calorie Goals**: Set and customize your daily calorie targets
- **Real-time Progress**: Visual progress bar showing your daily calorie intake
- **Daily Statistics**: View total calories consumed, remaining calories, and goal progress
- **Automatic History**: Previous days are automatically archived for review
- **Data Persistence**: All data is saved locally in your browser using localStorage
- **Mobile Responsive**: Works great on phones, tablets, and desktops
- **Clean UI**: Modern, intuitive interface with smooth animations

## Quick Start

1. Open `index.html` in a web browser
2. Start adding foods with their calorie counts
3. Watch your daily progress update in real-time

## Usage

### Setting Your Daily Goal

1. Enter your desired daily calorie goal in the "Daily Calorie Goal" field
2. Click "Set Goal" to save it
3. Default goal is 2000 calories

### Adding Food Items

1. Enter the food name (e.g., "Chicken Sandwich")
2. Enter the calorie amount (e.g., "450")
3. Click "Add Food" or press Enter
4. The food will appear in your daily list with the current time

### Viewing Statistics

The app displays three key metrics:
- **Today's Total**: Total calories consumed today
- **Daily Goal**: Your target calorie intake
- **Remaining**: How many calories you have left (goes negative if you exceed your goal)

### Managing Your Data

- **Delete Individual Foods**: Click the "Delete" button next to any food item
- **Clear Today**: Remove all foods for the current day
- **Clear All History**: Erase all historical data

### Automatic History

The app automatically saves yesterday's data when you open it on a new day. You can view your historical daily totals and food entries in the History section.

## Technical Details

- **Pure JavaScript**: No frameworks or dependencies required
- **localStorage**: Data persists across browser sessions
- **Responsive Design**: CSS Grid and Flexbox for adaptive layouts
- **Modern UI**: CSS variables for easy theming

## Browser Compatibility

Works on all modern browsers that support:
- ES6 JavaScript
- CSS Grid and Flexbox
- localStorage API

## Files

- `index.html` - Main application structure
- `styles.css` - Styling and responsive design
- `app.js` - Application logic and data management

## Privacy

All data is stored locally in your browser. Nothing is sent to external servers.
