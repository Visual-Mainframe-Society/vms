import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useNotifier } from '@/composables/useNotifier'

// Declared at module scope so every component that calls useSignIn()
// shares the exact same ref. When any button triggers signIn(), all
// other sign-in buttons see loading = true and disable themselves.
// On success the page redirects, so loading stays true until then.
// It only resets to false if an error occurs before the redirect.
const loading = ref(false)

export function useSignIn() {
  const { notify } = useNotifier()

  async function signIn() {
    if (loading.value) return
    loading.value = true
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.href },
      })
      if (error) {
        notify({ message: `Sign in failed: ${error.message}`, color: 'error' })
        loading.value = false
      }
      // No else — on success the browser redirects, loading stays true.
    } catch (err) {
      notify({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
        color: 'error',
      })
      loading.value = false
    }
  }

  return { signIn, loading }
}
