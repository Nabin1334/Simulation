// Simulation control logic

function startReaction() {
    isReacting = true;
    document.getElementById('start-btn').disabled = true;
}

function resetExperiment() {
    isReacting = false;
    acidLevel = 200;
    gasProduction = 0;
    bubbles = [];
    gasJarBubbles = [];
    waterLevel = 150;
    hydrogenGasLevel = 0;
    document.getElementById('start-btn').disabled = false;
    
    // Reset tube controls
    document.getElementById('tube-angle').value = 0;
    document.getElementById('tube-length').value = 150;
    document.getElementById('angle-value').textContent = '0°';
    document.getElementById('length-value').textContent = '150px';
}

function showInfo() {
    alert("This simulation shows the laboratory preparation of hydrogen gas.\n\n" +
          "When zinc reacts with dilute hydrochloric acid, hydrogen gas is produced.\n" +
          "The gas is collected by downward displacement of water.\n\n" +
          "Adjust the delivery tube using the sliders to see how it affects the experiment.");
}

// Setup button event listeners and slider updates
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('start-btn').addEventListener('click', startReaction);
    document.getElementById('reset-btn').addEventListener('click', resetExperiment);
    document.getElementById('info-btn').addEventListener('click', showInfo);
    
    // Update slider value displays
    document.getElementById('tube-angle').addEventListener('input', function() {
        document.getElementById('angle-value').textContent = this.value + '°';
    });
    
    document.getElementById('tube-length').addEventListener('input', function() {
        document.getElementById('length-value').textContent = this.value + 'px';
    });
});