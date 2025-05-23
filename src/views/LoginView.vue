<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import authService from '../services/auth.service'

const router = useRouter()

onMounted(async () => {
  // Check if user is already authenticated
  const isAuthenticated = await authService.isAuthenticated()
  if (isAuthenticated) {
    router.push('/dashboard')
  }
})

const handleLogin = async () => {
  try {
    await authService.login()
  } catch (error) {
    console.error('Login error:', error)
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h1>Login</h1>
      <button @click="handleLogin" class="login-button">Login with OIDC</button>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  background-color: var(--background);
  margin: 0;
  padding: 0;
}

.login-box {
  background-color: var(--off);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  margin: 0 20px;
}

h1 {
  text-align: center;
  color: #fff;
  margin-bottom: 2rem;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--on);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.login-button:hover {
  background-color: var(--line-on);
}

/* Reset default margins and padding */
:root {
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}
</style>
