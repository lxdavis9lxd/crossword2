// test_api_connectivity.js
// This script tests API connectivity to diagnose issues with the load puzzles button

// DOM elements for testing
const resultsContainer = document.getElementById('test-results');

// Test function
async function testApiEndpoints() {
    console.log('Starting API connectivity tests...');
    
    if (resultsContainer) {
        resultsContainer.innerHTML = '<p>Running tests...</p>';
    }
    
    let results = [];
    
    // Helper function to format test results
    function addResult(name, success, message, details = null) {
        const result = { name, success, message, details };
        results.push(result);
        console.log(`Test "${name}": ${success ? 'SUCCESS' : 'FAILED'} - ${message}`);
        return result;
    }
    
    // 1. Test getBaseUrl function
    try {
        const baseUrl = getBaseUrl ? getBaseUrl() : window.location.origin;
        addResult(
            'getBaseUrl Function', 
            true, 
            `Base URL: ${baseUrl}`,
            { baseUrl }
        );
    } catch (error) {
        addResult(
            'getBaseUrl Function', 
            false, 
            `Error in getBaseUrl: ${error.message}`,
            { error: error.toString(), stack: error.stack }
        );
    }

    // 2. Test API Test Endpoint
    try {
        const baseUrl = getBaseUrl ? getBaseUrl() : window.location.origin;
        const apiTestUrl = `${baseUrl}/v1/api-test`;
        
        const apiTestResult = addResult(
            'API Test Endpoint', 
            false, 
            `Attempting to fetch from ${apiTestUrl}...`
        );
        
        const response = await fetch(apiTestUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            },
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            apiTestResult.success = false;
            apiTestResult.message = `Failed with status: ${response.status} ${response.statusText}`;
            apiTestResult.details = { status: response.status, statusText: response.statusText };
        } else {
            const data = await response.json();
            apiTestResult.success = true;
            apiTestResult.message = `API test endpoint responded successfully`;
            apiTestResult.details = data;
        }
    } catch (error) {
        results[results.length - 1].success = false;
        results[results.length - 1].message = `Error: ${error.message}`;
        results[results.length - 1].details = { error: error.toString(), stack: error.stack };
    }
    
    // 3. Test Puzzle Endpoint for Easy Level
    try {
        const baseUrl = getBaseUrl ? getBaseUrl() : window.location.origin;
        const puzzlesUrl = `${baseUrl}/v1/game/puzzles/easy`;
        
        const puzzlesResult = addResult(
            'Puzzles Endpoint (Easy)', 
            false, 
            `Attempting to fetch from ${puzzlesUrl}...`
        );
        
        const response = await fetch(puzzlesUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            },
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            puzzlesResult.success = false;
            puzzlesResult.message = `Failed with status: ${response.status} ${response.statusText}`;
            puzzlesResult.details = { status: response.status, statusText: response.statusText };
        } else {
            const data = await response.json();
            puzzlesResult.success = true;
            puzzlesResult.message = `Successfully loaded ${data.length} puzzles`;
            puzzlesResult.details = { count: data.length, firstPuzzle: data[0] ? data[0].id : 'none' };
        }
    } catch (error) {
        results[results.length - 1].success = false;
        results[results.length - 1].message = `Error: ${error.message}`;
        results[results.length - 1].details = { error: error.toString(), stack: error.stack };
    }
    
    // Display results in container
    if (resultsContainer) {
        let html = '<h3>API Connectivity Test Results</h3>';
        html += '<div class="test-results-container">';
        
        results.forEach(result => {
            html += `
                <div class="test-result ${result.success ? 'success' : 'failure'}">
                    <h4>${result.name}</h4>
                    <p>${result.message}</p>
                    ${result.details ? `<pre>${JSON.stringify(result.details, null, 2)}</pre>` : ''}
                </div>
            `;
        });
        
        html += '</div>';
        resultsContainer.innerHTML = html;
    }
    
    console.log('API connectivity tests completed');
    return results;
}

// Call test function if container exists
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('test-results')) {
        document.getElementById('run-tests-btn').addEventListener('click', testApiEndpoints);
    }
});
