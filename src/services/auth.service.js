import { UserManager, WebStorageStateStore } from 'oidc-client-ts'
import { getAuthConfig } from '../config/auth.config'

class AuthService {
    constructor() {
        const config = getAuthConfig()
        this.userManager = new UserManager({
            ...config,
            userStore: new WebStorageStateStore({ store: window.localStorage })
        })

        // Set up event handlers
        this.userManager.events.addUserLoaded(this.handleUserLoaded.bind(this))
        this.userManager.events.addUserUnloaded(this.handleUserUnloaded.bind(this))
        this.userManager.events.addSilentRenewError(this.handleSilentRenewError.bind(this))
        this.userManager.events.addAccessTokenExpiring(this.handleAccessTokenExpiring.bind(this))
        this.userManager.events.addAccessTokenExpired(this.handleAccessTokenExpired.bind(this))
    }

    // Initialize the auth service
    async init() {
        try {
            const user = await this.userManager.getUser()
            return user
        } catch (error) {
            console.error('Error initializing auth service:', error)
            return null
        }
    }

    // Start the login process
    async login() {
        try {
            await this.userManager.signinRedirect()
        } catch (error) {
            console.error('Error during login:', error)
            throw error
        }
    }

    // Handle the redirect callback
    async handleCallback() {
        try {
            const user = await this.userManager.signinRedirectCallback()
            return user
        } catch (error) {
            console.error('Error handling callback:', error)
            throw error
        }
    }

    // Logout the user
    async logout() {
        try {
            await this.userManager.signoutRedirect()
        } catch (error) {
            console.error('Error during logout:', error)
            throw error
        }
    }

    // Get the current user
    async getUser() {
        try {
            return await this.userManager.getUser()
        } catch (error) {
            console.error('Error getting user:', error)
            return null
        }
    }

    // Get the access token
    async getAccessToken() {
        try {
            const user = await this.getUser()
            return user?.access_token
        } catch (error) {
            console.error('Error getting access token:', error)
            return null
        }
    }

    // Check if the user is authenticated
    async isAuthenticated() {
        const user = await this.getUser()
        return !!user && !user.expired
    }

    // Event handlers
    handleUserLoaded(user) {
        console.log('User loaded:', user)
    }

    handleUserUnloaded() {
        console.log('User unloaded')
    }

    handleSilentRenewError(error) {
        console.error('Silent renew error:', error)
    }

    handleAccessTokenExpiring() {
        console.log('Access token is expiring')
    }

    handleAccessTokenExpired() {
        console.log('Access token has expired')
        // You might want to trigger a re-authentication here
        this.login()
    }
}

// Create a singleton instance
const authService = new AuthService()
export default authService
