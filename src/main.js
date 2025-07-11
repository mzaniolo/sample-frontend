import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Handle GitHub Pages 404 redirect
const handleGitHubPagesRedirect = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');

    if (redirect) {
        // Remove the redirect parameter from the URL
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('redirect');

        // For OIDC callback, use window.location to ensure proper handling
        if (redirect.startsWith('/callback')) {
            // Use window.location to ensure OIDC library can properly handle the callback
            window.location.replace(redirect);
        } else {
            // For other routes, use router.push
            router.push(redirect);
        }

        // Update the URL without the redirect parameter (only for non-callback routes)
        if (!redirect.startsWith('/callback')) {
            window.history.replaceState({}, '', newUrl.toString());
        }
    }
};

const app = createApp(App)
app.use(router)
app.mount('#app')

// Handle redirect after the app is mounted
handleGitHubPagesRedirect();
