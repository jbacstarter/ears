   const loadingOverlay = document.getElementById('loadingOverlay');
    
   export function showLoading(text = 'Loading...') {
        if (text) {
            const textElement = loadingOverlay.querySelector('.loading-text');
            textElement.textContent = text;
        }
        loadingOverlay.classList.add('active');
    }
    
    export function hideLoading() {
        loadingOverlay.classList.remove('active');
    }