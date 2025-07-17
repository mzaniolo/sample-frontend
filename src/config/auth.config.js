// Helper function to get the base URL dynamically
const getBaseUrl = () => {
    // In development, use localhost
    if (import.meta.env.DEV) {
        return 'http://localhost:5173'
    }

    // In production, use the current origin
    return window.location.origin + (import.meta.env.BASE_URL || '')
}

export const authConfig = {
    // OIDC Provider configuration
    authority: 'https://zitadel.scada.mzaniolo.net', // Replace with your Keycloak realm URL
    client_id: '321035155483469052', // Replace with your client ID
    redirect_uri: `${getBaseUrl()}/#/callback`, // Dynamic redirect URI
    post_logout_redirect_uri: getBaseUrl(), // Dynamic post-logout redirect

    // Project ID for the SCADA roles
    project_id: '310606429645972425',

    // PKCE configuration
    response_type: 'code',
    scope: `openid profile email urn:zitadel:iam:org:project:id:${project_id}:aud urn:zitadel:iam:org:projects:roles`,

    // Additional settings
    loadUserInfo: true,
    automaticSilentRenew: true,
    silent_redirect_uri: `${getBaseUrl()}/silent-renew.html`,

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
