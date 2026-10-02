import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
  storageKey: 'color-scheme',
})

const toggleDark = useToggle(isDark)

export function useTheme() {
  function toggleTheme() {
    toggleDark()
  }

  return {
    isDark,
    toggleTheme,
  }
}
