import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import { md3 } from 'vuetify/blueprints'
import { theme } from './styles/theme.ts'

import App from './App.vue'
import router from './router'

import { h } from 'vue'
import IconSac from '@/components/icons/vmsIcon.vue'
import type { IconProps } from 'vuetify'

const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)

const app = createApp(App)

const vuetify = createVuetify({
  components,
  directives,
  blueprint: md3,
  theme: {
    ...theme,
    defaultTheme: isMobile ? 'dark' : 'dark-web',
  },
  icons: {
    defaultSet: 'mdi',
    sets: {
      custom: {
        component: (_props: IconProps) => h(IconSac),
      },
    },
  },
})

app.use(createPinia().use(piniaPluginPersistedstate))
app.use(router)
app.use(vuetify)

app.mount('#app')
