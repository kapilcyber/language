// Charts for dashboard and analytics
document.addEventListener('DOMContentLoaded', function() {
    // Progress by category chart
    const progressChartElement = document.getElementById('progress-by-category-chart');
    if (progressChartElement) {
        renderProgressByCategory(progressChartElement);
    }
    
    // Quiz performance chart
    const quizChartElement = document.getElementById('quiz-performance-chart');
    if (quizChartElement) {
        renderQuizPerformance(quizChartElement);
    }
    
    // Activity over time chart
    const activityChartElement = document.getElementById('activity-over-time-chart');
    if (activityChartElement) {
        renderActivityOverTime(activityChartElement);
    }
    
    // Subject comparison chart
    const subjectChartElement = document.getElementById('subject-comparison-chart');
    if (subjectChartElement) {
        renderSubjectComparison(subjectChartElement);
    }
});

// Render progress by category chart
function renderProgressByCategory(canvas) {
    // Get data from data attributes or use sample data
    let labels = [];
    let data = [];
    
    try {
        // Try to get data from HTML attributes
        labels = JSON.parse(canvas.getAttribute('data-labels') || '[]');
        data = JSON.parse(canvas.getAttribute('data-values') || '[]');
    } catch (e) {
        console.error('Error parsing chart data:', e);
    }
    
    // If no data is available, exit
    if (labels.length === 0 || data.length === 0) {
        canvas.parentElement.innerHTML = '<div class="text-center p-4">No data available yet</div>';
        return;
    }
    
    // Create chart
    new Chart(canvas, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Progress (%)',
                data: data,
                backgroundColor: 'rgba(47, 128, 237, 0.2)',
                borderColor: 'rgba(47, 128, 237, 1)',
                pointBackgroundColor: 'rgba(47, 128, 237, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(47, 128, 237, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Learning Progress by Category'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.formattedValue}%`;
                        }
                    }
                }
            }
        }
    });
}

// Render quiz performance chart
function renderQuizPerformance(canvas) {
    // Get data from data attributes or use sample data
    let labels = [];
    let scores = [];
    let maxScores = [];
    
    try {
        // Try to get data from HTML attributes
        labels = JSON.parse(canvas.getAttribute('data-labels') || '[]');
        scores = JSON.parse(canvas.getAttribute('data-scores') || '[]');
        maxScores = JSON.parse(canvas.getAttribute('data-max-scores') || '[]');
    } catch (e) {
        console.error('Error parsing chart data:', e);
    }
    
    // If no data is available, exit
    if (labels.length === 0 || scores.length === 0) {
        canvas.parentElement.innerHTML = '<div class="text-center p-4">No quiz data available yet</div>';
        return;
    }
    
    // Calculate percentages for easier comparison
    const percentages = scores.map((score, index) => {
        return (score / maxScores[index]) * 100;
    });
    
    // Create chart
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Score (%)',
                data: percentages,
                backgroundColor: function(context) {
                    const value = context.dataset.data[context.dataIndex];
                    if (value >= 80) return 'rgba(76, 175, 80, 0.7)'; // Green
                    if (value >= 60) return 'rgba(255, 193, 7, 0.7)'; // Yellow
                    return 'rgba(244, 67, 54, 0.7)'; // Red
                },
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Score (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Quizzes'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Quiz Performance'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const scoreText = `Score: ${scores[index]}/${maxScores[index]}`;
                            const percentText = `${context.formattedValue}%`;
                            return [scoreText, percentText];
                        }
                    }
                }
            }
        }
    });
}

// Render activity over time chart
function renderActivityOverTime(canvas) {
    // Get data from data attributes or use sample data
    let dates = [];
    let minutes = [];
    
    try {
        // Try to get data from HTML attributes
        dates = JSON.parse(canvas.getAttribute('data-dates') || '[]');
        minutes = JSON.parse(canvas.getAttribute('data-minutes') || '[]');
    } catch (e) {
        console.error('Error parsing chart data:', e);
    }
    
    // If no data is available, use sample data
    if (dates.length === 0 || minutes.length === 0) {
        canvas.parentElement.innerHTML = '<div class="text-center p-4">No activity data available yet</div>';
        return;
    }
    
    // Create chart
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Activity (minutes)',
                data: minutes,
                backgroundColor: 'rgba(47, 128, 237, 0.2)',
                borderColor: 'rgba(47, 128, 237, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(47, 128, 237, 1)',
                pointRadius: 4,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Time (minutes)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Learning Activity Over Time'
                }
            }
        }
    });
}

// Render subject comparison chart
function renderSubjectComparison(canvas) {
    // Get data from data attributes or use sample data
    let subjects = [];
    let progress = [];
    
    try {
        // Try to get data from HTML attributes
        subjects = JSON.parse(canvas.getAttribute('data-subjects') || '[]');
        progress = JSON.parse(canvas.getAttribute('data-progress') || '[]');
    } catch (e) {
        console.error('Error parsing chart data:', e);
    }
    
    // If no data is available, exit
    if (subjects.length === 0 || progress.length === 0) {
        canvas.parentElement.innerHTML = '<div class="text-center p-4">No subject data available yet</div>';
        return;
    }
    
    // Create chart
    new Chart(canvas, {
        type: 'polarArea',
        data: {
            labels: subjects,
            datasets: [{
                data: progress,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    position: 'right',
                },
                title: {
                    display: true,
                    text: 'Subject Progress Comparison'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.formattedValue}%`;
                        }
                    }
                }
            }
        }
    });
}
