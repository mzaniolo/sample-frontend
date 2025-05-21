<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import authService from '../services/auth.service'

const router = useRouter()

onMounted(async () => {
  try {
    await authService.handleCallback()
    router.push('/dashboard')
  } catch (error) {
    console.error('Error handling callback:', error)
    router.push('/')
  }
})
</script>

<template>
  <div class="callback-container">
    <div class="loading-spinner">
      Processing login...
    </div>
  </div>
</template>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--background);
}

.loading-spinner {
  color: #fff;
  font-size: 1.2rem;
}
</style>
