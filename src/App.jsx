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
  const [adminIn, setAdminIn] = useState(() => store.get('kd_admin', false))
  if (hash === '#admin') {
    if (!adminIn)
      return (
        <AdminLogin
          onLogin={() => {
            setAdminIn(true)
            store.set('kd_admin', true)
          }}
        />
      )
    return (
      <AdminDashboard
        rates={rates}
        setRates={setRates}
        onLogout={() => {
          setAdminIn(false)
          store.set('kd_admin', false)
        }}
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
          onLogin={(phone) => {
            const u = { phone }
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

  return (
    <div className="app" dir="rtl" lang="ur">
      {view}
    </div>
  )
}
