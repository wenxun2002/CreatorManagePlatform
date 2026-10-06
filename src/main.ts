import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { i18n } from './locales'
import { useAuthStore } from './stores/useAuthStore'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

const auth = useAuthStore(pinia)

async function bootstrap() {
  // Never block first paint forever if /api/user hangs (CORS / backend down).
  await Promise.race([
    auth.hydrate(),
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, 2500)
    }),
  ])

  await router.isReady()
  app.mount('#app')
}

void bootstrap()
