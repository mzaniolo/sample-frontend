export const authConfig = {
    // OIDC Provider configuration
    authority: 'https://zitadel.scada.mzaniolo.net', // Replace with your Keycloak realm URL
    client_id: '321035155483469052', // Replace with your client ID
    redirect_uri: 'http://localhost:5173/callback', // Must match the redirect URI in your OIDC provider
    post_logout_redirect_uri: 'http://localhost:5173',

    // PKCE configuration
    response_type: 'code',
    scope: 'openid profile email',

    // Additional settings
    loadUserInfo: true,
    automaticSilentRenew: true,
    silent_redirect_uri: 'http://localhost:5173/silent-renew.html',

    // Token configuration
    includeIdToken: true,
    includeAccessToken: true,
    accessTokenExpiringNotificationTime: 60, // Notify 60 seconds before token expires

    // Optional: Customize token storage
    // storage: localStorage, // or sessionStorage

    // Optional: Customize token validation
    // clockSkew: 60, // in seconds
}

// Helper function to get the full configuration object
export const getAuthConfig = () => {
    return {
        ...authConfig,
        // Add any runtime configuration here
    }
}
