import { createApp, h } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {
  VFileUpload,
  VFileUploadDropzone,
  VFileUploadItem,
  VFileUploadList,
} from 'vuetify/labs/VFileUpload'

import '@mdi/font/css/materialdesignicons.css'
import { md3 } from 'vuetify/blueprints'
import { theme } from './styles/theme.ts'

import App from './App.vue'
import router from './router'
import IconSac from '@/components/icons/vmsIcon.vue'
import type { IconProps } from 'vuetify'

const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)

const app = createApp(App)

const vuetify = createVuetify({
  components: {
    ...components,
    VFileUpload,
    VFileUploadDropzone,
    VFileUploadItem,
    VFileUploadList,
  },
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
        component: (props: IconProps) => h(IconSac, props),
      },
    },
  },
})

app.use(createPinia().use(piniaPluginPersistedstate))
app.use(router)
app.use(vuetify)

app.mount('#app')
