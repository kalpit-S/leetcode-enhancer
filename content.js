// Function to add the new field with similar problems and solutions
function addSimilarProblemsAndSolutions(similarProblems, solutions) {
    console.log('Adding similar problems and solutions:', similarProblems, solutions);

    // Remove existing similar problems and solutions containers if they exist
    const existingSimilarProblemsContainer = document.querySelector('.similar-problems-container');
    const existingSolutionsContainer = document.querySelector('.solutions-container');
    if (existingSimilarProblemsContainer) {
        existingSimilarProblemsContainer.remove();
    }
    if (existingSolutionsContainer) {
        existingSolutionsContainer.remove();
    }

    const discussionSection = Array.from(document.querySelectorAll('.mt-6.flex.flex-col.gap-3'))
                                   .find(el => el.textContent.includes('Discussion'));

    if (discussionSection) {
        const similarProblemsDiv = document.createElement('div');
        similarProblemsDiv.className = 'similar-problems-container';
        similarProblemsDiv.innerHTML = `
            <h2 class="similar-problems-title">Similar Problems</h2>
            <ul class="similar-problems-list">
                ${similarProblems.map(problem => `
                    <li class="similar-problem-item">
                        <a href="${problem.url}" target="_blank" class="similar-problem-link">
                            ${problem.name}
                        </a>
                        <span class="similar-problem-score">(${Math.round(problem.similarity * 100)}%)</span>
                    </li>
                `).join('')}
            </ul>
        `;

        const solutionsDiv = document.createElement('div');
        solutionsDiv.className = 'solutions-container';
        solutionsDiv.innerHTML = `
            <h2 class="solutions-title">Solution</h2>
            <div class="tabs">
                <button class="tab-link active" data-tab="python">Python</button>
                <button class="tab-link" data-tab="cpp">C++</button>
                <button class="tab-link" data-tab="java">Java</button>
            </div>
            <div id="python" class="tab-content active">
                <pre><code>${solutions.python}</code></pre>
            </div>
            <div id="cpp" class="tab-content">
                <pre><code>${solutions.cpp}</code></pre>
            </div>
            <div id="java" class="tab-content">
                <pre><code>${solutions.java}</code></pre>
            </div>
        `;

        // Reference the external CSS file
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = chrome.runtime.getURL('styles.css');
        document.head.appendChild(link);

        discussionSection.appendChild(similarProblemsDiv);
        discussionSection.appendChild(solutionsDiv);

        // Add tab functionality
        const tabLinks = document.querySelectorAll('.tab-link');
        const tabContents = document.querySelectorAll('.tab-content');
        tabLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Remove active class from all tab links and tab contents
                tabLinks.forEach(link => link.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                // Add active class to the clicked tab link and show the corresponding tab content
                this.classList.add('active');
                const tabId = this.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
    } else {
        console.error('Discussion section not found.');
    }
}

// Function to fetch similar problems and solutions from the JSON file
async function fetchSimilarProblemsAndSolutions() {
    try {
        const response = await fetch(chrome.runtime.getURL('lc_problem_info.json'));
        const data = await response.json();
        console.log('Fetched similar problems and solutions data:', data);
        return data;
    } catch (error) {
        console.error('Failed to fetch similar problems and solutions:', error);
        return null;
    }
}

// Function to get the current problem key from the URL
function getCurrentProblemKey() {
    const urlParts = window.location.pathname.split('/');
    let problemKey = urlParts[2]; // Extract the problem key from the URL
    console.log('Current problem key:', problemKey);
    return problemKey;
}

// Main function to execute the script
async function main() {
    // Wait for the page to fully load, then wait an additional 3 seconds
    await new Promise(resolve => setTimeout(resolve, 1500));
    const currentProblemKey = getCurrentProblemKey();
    const data = await fetchSimilarProblemsAndSolutions();

    if (currentProblemKey && data && data[currentProblemKey]) {
        const { similar_problems, solutions } = data[currentProblemKey];
        addSimilarProblemsAndSolutions(similar_problems, solutions);
    } else {
        console.error('No similar problems or solutions found for the current problem key:', currentProblemKey);
    }
}

// Function to watch for URL changes and rerun the script
function watchUrlChanges() {
    let lastUrl = window.location.href;

    const observer = new MutationObserver(() => {
        const currentUrl = window.location.href;
        if (lastUrl !== currentUrl) {
            lastUrl = currentUrl;
            console.log('URL changed:', currentUrl);
            main();
        }
    });

    const config = { subtree: true, childList: true };
    observer.observe(document, config);
}

// Initialize the script
main();
watchUrlChanges();
