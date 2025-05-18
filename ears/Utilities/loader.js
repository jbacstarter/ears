   const loadingOverlay = document.getElementById('loadingOverlay');
    
   export async function showLoading(text = 'Loading...') {
        if (text) {
            const textElement = loadingOverlay.querySelector('.loading-text');
            textElement.textContent = text;
        }
        loadingOverlay.classList.add('active');
    }
    
    export async function hideLoading() {
        loadingOverlay.classList.remove('active');
    }