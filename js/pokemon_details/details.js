import { getPokemonDataByName } from "../api_fetch/main.js";

// Main function to handle Pokemon search
async function details() {
    const input = document.getElementById("name").value.trim();
    const result = document.getElementById("result");

    // Validate input
    if (!input) {
        showError("Please enter a Pokémon name");
        return;
    }

    try {
        // Show enhanced loading animation with temporary container
        showLoadingWithTempContainer();
        
        // Fetch Pokemon data
        const pokemonData = await getPokemonDataByName(input);
        console.log(pokemonData);

        // Validate data
        if (!pokemonData || typeof pokemonData !== 'object') {
            throw new Error("Invalid Pokémon data received");
        }

        // Display Pokemon details with entrance animation
        await displayResultWithTransition(pokemonData);
        
        // Animate stat bars after a short delay
        setTimeout(animateStatBars, 300);

    } catch (error) {
        console.error("Error fetching Pokemon data:", error);
        showError(error.message || "Failed to fetch Pokémon data");
    }
}

// Enhanced loading with temporary container animation
function showLoadingWithTempContainer() {
    const result = document.getElementById("result");
    
    // Create temporary loading container with advanced animations
    result.innerHTML = `
        <div class="temp-loading-container">
            <div class="loading-backdrop"></div>
            <div class="loading-content">
                <div class="scanning-radar">
                    <div class="radar-sweep"></div>
                    <div class="radar-dots">
                        <div class="radar-dot dot-1"></div>
                        <div class="radar-dot dot-2"></div>
                        <div class="radar-dot dot-3"></div>
                        <div class="radar-dot dot-4"></div>
                    </div>
                </div>
                
                <h2 class="loading-text">SCANNING...</h2>
                
                <div class="loading-progress-container">
                    <div class="progress-track">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="progress-percentage">0%</div>
                </div>
                
                <div class="loading-details">
                    <div class="loading-step active">
                        <span class="step-icon">📡</span>
                        <span class="step-text">Connecting to database...</span>
                    </div>
                    <div class="loading-step">
                        <span class="step-icon">🔍</span>
                        <span class="step-text">Searching Pokémon data...</span>
                    </div>
                    <div class="loading-step">
                        <span class="step-icon">🧬</span>
                        <span class="step-text">Analyzing characteristics...</span>
                    </div>
                    <div class="loading-step">
                        <span class="step-icon">✨</span>
                        <span class="step-text">Preparing display...</span>
                    </div>
                </div>
                
                <div class="spinner-container">
                    <div class="spinner"></div>
                </div>
            </div>
        </div>
    `;
    
    // Start the loading sequence
    startLoadingSequence();
}

// Loading sequence with step-by-step animation
function startLoadingSequence() {
    const loadingText = document.querySelector('.loading-text');
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = document.querySelector('.progress-percentage');
    const loadingSteps = document.querySelectorAll('.loading-step');
    
    const scanningStates = ['SCANNING...', 'ANALYZING...', 'PROCESSING...', 'LOADING...'];
    let stateIndex = 0;
    let progress = 0;
    let currentStep = 0;
    
    // Text animation
    const textInterval = setInterval(() => {
        if (loadingText) {
            stateIndex = (stateIndex + 1) % scanningStates.length;
            loadingText.textContent = scanningStates[stateIndex];
        }
    }, 600);
    
    // Progress bar animation
    const progressInterval = setInterval(() => {
        if (progress < 100 && progressFill && progressPercentage) {
            progress += Math.random() * 15 + 5; // Random increment between 5-20
            if (progress > 100) progress = 100;
            
            progressFill.style.width = progress + '%';
            progressPercentage.textContent = Math.floor(progress) + '%';
            
            // Activate steps based on progress
            const stepIndex = Math.floor((progress / 100) * loadingSteps.length);
            if (stepIndex > currentStep && stepIndex < loadingSteps.length) {
                if (loadingSteps[currentStep]) {
                    loadingSteps[currentStep].classList.remove('active');
                    loadingSteps[currentStep].classList.add('completed');
                }
                if (loadingSteps[stepIndex]) {
                    loadingSteps[stepIndex].classList.add('active');
                }
                currentStep = stepIndex;
            }
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                // Mark all steps as completed
                loadingSteps.forEach(step => {
                    step.classList.remove('active');
                    step.classList.add('completed');
                });
            }
        }
    }, 200);
    
    // Clean up intervals when component is removed
    setTimeout(() => {
        clearInterval(textInterval);
        clearInterval(progressInterval);
    }, 10000); // Cleanup after 10 seconds max
}

// Display result with smooth transition
async function displayResultWithTransition(pokemonData) {
    const result = document.getElementById("result");
    
    // Add fade out animation to loading container
    const loadingContainer = document.querySelector('.temp-loading-container');
    if (loadingContainer) {
        loadingContainer.style.animation = 'fadeOutScale 0.5s ease-out forwards';
        
        // Wait for fade out to complete
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Create Pokemon HTML with entrance animation
    result.innerHTML = createPokemonHTML(pokemonData);
    
    // Add entrance animation to the new content
    const pokemonContainer = document.querySelector('.pokemon-container');
    if (pokemonContainer) {
        pokemonContainer.style.animation = 'slideInFromBottom 0.8s ease-out forwards';
    }
}

// Home navigation function
function goHome() {
    const result = document.getElementById("result");
    const nameInput = document.getElementById("name");
    
    // Clear input
    nameInput.value = "";
    
    // Add fade transition
    result.style.animation = 'fadeOut 0.3s ease-out forwards';
    
    setTimeout(() => {
        // Show welcome screen with animation
        result.innerHTML = `
            <div class="welcome-screen">
                <div class="pokeball-icon">
                    <div class="pokeball-top"></div>
                    <div class="pokeball-center"></div>
                    <div class="pokeball-bottom"></div>
                </div>
                <h2>POKÉDEX READY</h2>
                <p>Enter a Pokémon name to begin analysis</p>
                <div class="scan-line"></div>
            </div>
        `;
        result.style.animation = 'fadeIn 0.5s ease-out forwards';
    }, 300);
}

// Create complete Pokemon HTML
function createPokemonHTML(pokemonData) {
    const pokemonId = pokemonData.id ? String(pokemonData.id).padStart(3, '0') : '???';
    const height = pokemonData.height ? (pokemonData.height / 10).toFixed(1) + ' m' : 'Unknown';
    const weight = pokemonData.weight ? (pokemonData.weight / 10).toFixed(1) + ' kg' : 'Unknown';

    return `
        <div class="pokemon-container">
            <div class="pokemon-header">
                <div class="pokemon-name">${pokemonData.name || 'Unknown'}</div>
                
            </div>

            <div class="pokemon-content">
                <div class="pokemon-image-container">
                    <div class="pokemon-image">
                        <img src="${pokemonData.default_image || ''}" alt="${pokemonData.name || 'Pokemon'}" />
                    </div>
                    <div class="basic-stats">
                        <div class="stat-row">
                            <span class="stat-label">Height: </span>
                            <span class="stat-value">${height}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Weight: </span>
                            <span class="stat-value">${weight}</span>
                        </div>
                    </div>
                </div>

                <div class="pokemon-details">
                    <div class="detail-section">
                        <div class="section-title">Type</div>
                        <div class="types-container">
                            ${generateTypesHTML(pokemonData.types)}
                        </div>
                    </div>

                    <div class="detail-section">
                        <div class="section-title">Abilities</div>
                        <div class="abilities-container">
                            ${generateAbilitiesHTML(pokemonData.abilities)}
                        </div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <div class="section-title">Base Stats</div>
                <div class="stats-grid">
                    ${generateStatsHTML(pokemonData.stats)}
                </div>
            </div>

            <div class="detail-section">
                <div class="section-title">Moves</div>
                <div class="moves-grid">
                    ${generateMovesHTML(pokemonData.moves)}
                </div>
            </div>

            <div class="detail-section">
                <div class="section-title">Forms</div>
                <div class="forms-container">
                    ${generateFormsHTML(pokemonData.forms)}
                </div>
            </div>
        </div>
    `;
}

// Generate types HTML
function generateTypesHTML(types) {
    if (!types || types.length === 0) {
        return '<span class="type-badge">Unknown</span>';
    }
    
    return types.map((type, index) => 
        `<span class="type-badge" style="animation-delay: ${index * 0.1}s">${typeof type === 'string' ? type : type.name}</span>`
    ).join('');
}

// Generate abilities HTML
function generateAbilitiesHTML(abilities) {
    if (!abilities || abilities.length === 0) {
        return '<div class="ability-item">No abilities data</div>';
    }
    
    return abilities.map((ability, index) => {
        const abilityName = ability.name || ability;
        const hiddenClass = ability.is_hidden ? ' hidden' : '';
        
        return `<div class="ability-item${hiddenClass}" style="animation-delay: ${index * 0.1}s">${abilityName.replace('-', ' ')}</div>`;
    }).join('');
}

// Generate stats HTML
function generateStatsHTML(stats) {
    if (!stats || stats.length === 0) {
        return '<div class="stat-item">No stats available</div>';
    }
    
    return stats.map((stat, index) => {
        const statName = stat.name || 'Unknown';
        const statValue = stat.value || 0;
        const percentage = Math.min((statValue / 255) * 100, 100);
        
        return `
            <div class="stat-item" style="animation-delay: ${index * 0.1}s">
                <span class="stat-name">${statName.replace('-', ' ')}</span>
                <div class="stat-bar-container">
                    <div class="stat-bar" style="width: 0%" data-width="${percentage}%"></div>
                </div>
                <span class="stat-number">${statValue}</span>
            </div>
        `;
    }).join('');
}

// Generate moves HTML
function generateMovesHTML(moves) {
    if (!moves || moves.length === 0) {
        return '<div class="move-item">No moves data</div>';
    }
    
    const movesToShow = moves.slice(0, 12);
    let movesHTML = movesToShow.map((move, index) => 
        `<div class="move-item" style="animation-delay: ${index * 0.05}s">${typeof move === 'string' ? move.replace('-', ' ') : move.name}</div>`
    ).join('');
    
    if (moves.length > 12) {
        movesHTML += `<div class="move-item" style="animation-delay: 0.6s">+${moves.length - 12} more</div>`;
    }
    
    return movesHTML;
}

// Generate forms HTML
function generateFormsHTML(forms) {
    if (!forms || forms.length === 0) {
        return '<span class="form-item">Standard</span>';
    }
    
    return forms.map((form, index) => 
        `<span class="form-item" style="animation-delay: ${index * 0.1}s">${typeof form === 'string' ? form : form.name}</span>`
    ).join('');
}

// Show loading state (simple fallback)
function showLoading() {
    const result = document.getElementById("result");
    result.innerHTML = `
        <div class="loading">
            <h2>SCANNING...</h2>
            <div class="spinner"></div>
        </div>
    `;
}

// Show error message
function showError(message) {
    const result = document.getElementById("result");
    result.innerHTML = `
        <div class="error-message">
            <h3>ERROR</h3>
            <p>${message}</p>
            <p>Please try a different Pokémon name</p>
        </div>
    `;
}

// Enhanced animate stat bars
function animateStatBars() {
    const statBars = document.querySelectorAll('.stat-bar');
    statBars.forEach((bar, index) => {
        const targetWidth = bar.getAttribute('data-width');
        setTimeout(() => {
            bar.style.width = targetWidth;
        }, index * 200);
    });
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    const nameInput = document.getElementById("name");
    if (nameInput) {
        nameInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                details();
            }
        });
    }
});

// Make functions globally available
window.details = details;
window.goHome = goHome;
