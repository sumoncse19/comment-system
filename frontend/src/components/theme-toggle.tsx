import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

export function ThemeToggle() {
  const { actualTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    // Simple toggle between light and dark
    setTheme(actualTheme === 'light' ? 'dark' : 'light')
  }

  return (
    <button
      className="navbar__theme-toggle"
      onClick={toggleTheme}
      title={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      {actualTheme === 'light' ? (
        <Moon className="transition" />
      ) : (
        <Sun className="transition" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
