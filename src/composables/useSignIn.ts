import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useNotifier } from '@/composables/useNotifier'

export function useSignIn() {
  const { notify } = useNotifier()
  const loading = ref(false)

  async function signIn() {
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
