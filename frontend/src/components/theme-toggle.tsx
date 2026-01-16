import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'

export function ThemeToggle() {
  const { actualTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    // Simple toggle between light and dark
    setTheme(actualTheme === 'light' ? 'dark' : 'light')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={toggleTheme}
      title={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      {actualTheme === 'light' ? (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-transform duration-300 rotate-0" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-transform duration-300 rotate-0" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
