import { createGlobalState } from '@vueuse/core'
import { ref } from 'vue'

interface NotificationOptions {
  message: string
  color?: 'success' | 'error' | 'info' | 'warning'
  timeout?: number
}

// ── Shared global state ───────────────────────────────────────────────────────

const useNotifierState = createGlobalState(() => {
  const isActive = ref(false)
  const message = ref('')
  const color = ref<'success' | 'error' | 'info' | 'warning'>('info')
  const timeout = ref(3000)
  const queue = ref<NotificationOptions[]>([])
  return { isActive, message, color, timeout, queue }
})

// ── Internal helpers ──────────────────────────────────────────────────────────

function showNext() {
  const { isActive, message, color, timeout, queue } = useNotifierState()
  if (queue.value.length === 0) {
    isActive.value = false
    return
  }
  const next = queue.value.shift()!
  message.value = next.message
  color.value = next.color ?? 'info'
  timeout.value = next.timeout ?? 3000
  isActive.value = true
}

// ── Public composable ─────────────────────────────────────────────────────────

export function useNotifier() {
  const { isActive, message, color, timeout, queue } = useNotifierState()

  function notify(options: NotificationOptions) {
    if (isActive.value) {
      queue.value.push(options)
    } else {
      message.value = options.message
      color.value = options.color ?? 'info'
      timeout.value = options.timeout ?? 3000
      isActive.value = true
    }
  }

  // Called by AppSnackbar when the snackbar finishes closing
  function onClosed() {
    setTimeout(showNext, 300)
  }

  return { isActive, message, color, timeout, queue, notify, onClosed }
}
