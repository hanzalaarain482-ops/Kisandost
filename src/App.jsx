import { useEffect, useState } from 'react'
import Language from './screens/Language.jsx'
import Login from './screens/Login.jsx'
import Home from './screens/Home.jsx'
import Scan from './screens/Scan.jsx'
import Mandi from './screens/Mandi.jsx'
import Weather from './screens/Weather.jsx'
import Help from './screens/Help.jsx'
import AdminLogin from './admin/AdminLogin.jsx'
import AdminDashboard from './admin/AdminDashboard.jsx'
import BottomNav from './BottomNav.jsx'
import { crops } from './data.js'
import { stopSpeaking } from './speak.js'

// Chhota sa localStorage helper (kuch browsers mein band hota hai, is liye try/catch)
const store = {
  get(k, fallback) {
    try {
      const v = localStorage.getItem(k)
      return v ? JSON.parse(v) : fallback
    } catch {
      return fallback
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v))
    } catch {
      /* ignore */
    }
  },
}

function useHash() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const on = () => setHash(window.location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash
}

export default function App() {
  const hash = useHash()
  const [rates, setRatesState] = useState(() => store.get('kd_rates', crops))
  const setRates = (r) => {
    setRatesState(r)
    store.set('kd_rates', r)
  }

  // ---------- Admin panel: /#admin ----------
  // Admin session sirf is tab tak (sessionStorage) — password local storage mein nahi rakhte
  const [admin, setAdminState] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('kd_admin') || 'null')
    } catch {
      return null
    }
  })
  const setAdmin = (a) => {
    setAdminState(a)
    try {
      if (a) sessionStorage.setItem('kd_admin', JSON.stringify(a))
      else sessionStorage.removeItem('kd_admin')
    } catch {
      /* ignore */
    }
  }
  if (hash === '#admin') {
    if (!admin) return <AdminLogin onLogin={setAdmin} />
    return (
      <AdminDashboard
        rates={rates}
        setRates={setRates}
        session={admin}
        setSession={setAdmin}
        onLogout={() => setAdmin(null)}
      />
    )
  }

  return <FarmerApp rates={rates} />
}

function FarmerApp({ rates }) {
  const [user, setUser] = useState(() => store.get('kd_user', null))
  const [screen, setScreen] = useState(user ? 'home' : 'language')

  const go = (s) => {
    stopSpeaking()
    setScreen(s)
    window.scrollTo(0, 0)
  }
  const home = () => go('home')

  let view
  switch (screen) {
    case 'language':
      view = <Language onDone={(lang) => { store.set('kd_lang', lang); go('login') }} />
      break
    case 'login':
      view = (
        <Login
          onBack={() => go('language')}
          onLogin={(phone, session, via) => {
            const u = { phone, session, via }
            setUser(u)
            store.set('kd_user', u)
            go('home')
          }}
        />
      )
      break
    case 'scan':
      view = <Scan onBack={home} />
      break
    case 'mandi':
      view = <Mandi onBack={home} rates={rates} />
      break
    case 'weather':
      view = <Weather onBack={home} />
      break
    case 'help':
      view = <Help onBack={home} />
      break
    default:
      view = (
        <Home
          go={go}
          onLogout={() => {
            setUser(null)
            store.set('kd_user', null)
            go('language')
          }}
        />
      )
  }

  const showNav = !['language', 'login'].includes(screen)
  return (
    <div className="app" dir="rtl" lang="ur">
      <main className="app-body">{view}</main>
      {showNav && <BottomNav active={screen} go={go} />}
    </div>
  )
}
