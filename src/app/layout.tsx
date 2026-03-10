import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-context'

export const AppLayout = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const signOut = (): void => {
    logout()
    navigate('/auth', { replace: true })
  }

  return (
    <div className='shell'>
      <header className='shell-header'>
        <div>
          <p className='shell-brand'>GeoTravels</p>
          <p className='shell-subtitle'>Travel tracker MVP</p>
        </div>

        <nav className='shell-nav'>
          <NavLink to='/map' className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Map
          </NavLink>
          <NavLink to='/history' className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            History
          </NavLink>
        </nav>

        <button onClick={signOut} className='logout-button'>
          Logout
        </button>
      </header>

      <main className='shell-content'>
        <Outlet />
      </main>
    </div>
  )
}
