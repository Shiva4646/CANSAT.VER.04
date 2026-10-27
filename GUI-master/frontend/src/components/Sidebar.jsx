import {
  Activity,
  Compass,
  LayoutDashboard,
  Navigation,
  Radio,
  Rocket,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navigationItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Sensors', to: '/sensors', icon: Activity },
  { label: 'GPS', to: '/gps', icon: Navigation },
  { label: 'Gyro', to: '/gyro', icon: Compass },
  { label: 'Communication', to: '/communication', icon: Radio },
]

function Sidebar({ isOpen }) {
  return (
    <aside
      className={`sidebar collapsed${isOpen ? '' : ' is-closed'}`}
      id="sidebar"
    >
      <div className="sidebar-head">
        <div className="sidebar-brand">
          <Rocket size={18} className="sidebar-logo" aria-hidden="true" />
          <span className="sidebar-title">CANSAT GCS</span>
        </div>
      </div>

      <nav className="nav-list" aria-label="Main navigation">
        {navigationItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            className={({ isActive }) =>
              `nav-item${isActive ? ' active' : ''}`
            }
            key={to}
            to={to}
            title={label}
          >
            <Icon className="nav-icon" size={18} strokeWidth={1.8} aria-hidden="true" />
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>

    </aside>
  )
}

export default Sidebar
