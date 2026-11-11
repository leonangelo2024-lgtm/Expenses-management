import { useState } from 'react'
import { createAccount, hasAccounts, signIn } from '../lib/auth.js'

const MODES = [
  { id: 'signin', label: 'Sign in' },
  { id: 'create', label: 'Create account' },
]

export default function Login({ onSignedIn }) {
  const [mode, setMode] = useState(() => (hasAccounts() ? 'signin' : 'create'))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const creating = mode === 'create'

  function switchMode(next) {
    setMode(next)
    setError('')
    setPassword('')
    setConfirm('')
  }

  function validate() {
    if (!creating) return ''
    if (!/^[A-Za-z0-9._-]{3,30}$/.test(username.trim())) {
      return 'Username must be 3–30 letters, numbers, dots, dashes or underscores.'
    }
    if (password.length < 6) return 'Password must be at least 6 characters.'
    if (password !== confirm) return "Passwords don't match."
    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (busy) return
    const problem = validate()
    if (problem) return setError(problem)
    setBusy(true)
    setError('')
    try {
      const id = creating ? await createAccount(username, password) : await signIn(username, password)
      onSignedIn(id) // This screen unmounts on success.
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <form className="card form auth-card" onSubmit={handleSubmit} noValidate>
        <div className="auth-head">
          <h1>Expenses</h1>
          <p>{creating ? 'Create an account to start tracking.' : 'Sign in to see your money.'}</p>
        </div>

        <div className="tabs" role="tablist" aria-label="Account">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={m.id === mode}
              className="tab"
              onClick={() => switchMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <label className="field">
          <span>Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            autoFocus
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={creating ? 'new-password' : 'current-password'}
            required
          />
        </label>

        {creating && (
          <label className="field">
            <span>Confirm password</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
        )}

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn primary" disabled={busy}>
          {busy ? 'Please wait…' : creating ? 'Create account' : 'Sign in'}
        </button>

        <p className="auth-note">Your account and data are stored only in this browser.</p>
      </form>
    </div>
  )
}
