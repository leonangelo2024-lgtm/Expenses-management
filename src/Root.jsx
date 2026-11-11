import { useState } from 'react'
import App from './App.jsx'
import Login from './components/Login.jsx'
import { clearSession, getSession, setSession } from './lib/auth.js'

export default function Root() {
  const [user, setUser] = useState(getSession)

  function handleSignedIn(id) {
    setSession(id)
    setUser(id)
  }

  function handleSignOut() {
    clearSession()
    setUser(null)
  }

  // Keyed by user so all of App's state resets when the account changes.
  return user ? (
    <App key={user} user={user} onSignOut={handleSignOut} />
  ) : (
    <Login onSignedIn={handleSignedIn} />
  )
}
