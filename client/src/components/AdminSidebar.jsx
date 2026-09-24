import {
  BarChart3,
  BookOpen,
  Inbox,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Users,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { Button } from './ui/button.jsx'

const links = [
  { to: '/admin', label: 'Dashboard', end: true, icon: LayoutDashboard },
  { to: '/admin/info', label: 'Manage Info', icon: BookOpen },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/admin/unanswered', label: 'Unanswered Queue', icon: Inbox },
  { to: '/admin/reports', label: 'Chat History & Reports', icon: BarChart3 },
  { to: '/admin/users', label: 'Users', icon: Users },
]

export default function AdminSidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 border-b border-sidebar-border bg-sidebar p-4 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-2 px-1">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#162a4a] text-white">
          <LayoutDashboard className="size-4" />
        </span>
        <span className="font-display text-base font-bold text-sidebar-foreground">
          CampusConnect Admin
        </span>
      </div>

      <nav className="flex flex-1 flex-wrap gap-1 lg:flex-col lg:flex-nowrap">
        {links.map(({ to, label, end, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center justify-between gap-2 border-t border-sidebar-border pt-4">
        <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={handleLogout}>
          <LogOut className="size-4" />
          Logout
        </Button>
        <ThemeToggle />
      </div>
    </aside>
  )
}
