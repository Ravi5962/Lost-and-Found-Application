import React, { useEffect, useMemo, useState } from 'react'
import { clsx } from 'clsx'
import { items as seedItems } from './data/items.js'
import {
  getSession,
  hashPassword,
  readUsers,
  setSession,
  validatePassword,
  validateUsername,
  writeUsers
} from './data/auth.js'

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash || '#/')
  useEffect(() => {
    const onHash = () => setHash(window.location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return hash
}

function parseRoute(hash) {
  // #/ -> '/'
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  const [path, qs = ''] = raw.split('?')
  const query = Object.fromEntries(
    qs
      .split('&')
      .filter(Boolean)
      .map((kv) => {
        const [k, v] = kv.split('=')
        return [decodeURIComponent(k), decodeURIComponent(v || '')]
      })
  )
  return { path: path || '/', query }
}

function formatDate(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
  } catch {
    return iso
  }
}

function Icon({ name, className }) {
  const common = 'inline-block align-text-bottom'
  const cls = clsx(common, className)
  switch (name) {
    case 'search':
      return (
        <svg className={cls} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" />
          <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'spark':
      return (
        <svg className={cls} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l1.2 6.2L20 10l-6.8 1.8L12 18l-1.2-6.2L4 10l6.8-1.8L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M19 14l.6 2.8L22 18l-2.4 1.2L19 22l-.6-2.8L16 18l2.4-1.2L19 14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      )
    case 'tag':
      return (
        <svg className={cls} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 13 11 22 2 13V2h11l7 7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M7.5 7.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'plus':
      return (
        <svg className={cls} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'close':
      return (
        <svg className={cls} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    default:
      return null
  }
}

function Modal({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm fade-enter-active" onClick={() => onClose?.()} />
      <div className="relative w-full max-w-3xl glass rounded-2xl shadow-glow border border-slate-400/10 fade-enter-active">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/5">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 animate-popIn">
              <Icon name="spark" className="text-violet-300" />
            </span>
            <h2 className="text-base sm:text-lg font-semibold">{title}</h2>
          </div>
          <button onClick={() => onClose?.()} className="ring-glow rounded-xl p-2 text-slate-200/80 hover:bg-white/5 hover:text-slate-100" aria-label="Close modal">
            <Icon name="close" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'ring-glow rounded-full px-3.5 py-1.5 text-sm transition',
        active
          ? 'bg-violet-500/15 text-violet-200 border border-violet-500/30 shadow-[0_0_18px_rgba(124,58,237,0.18)]'
          : 'bg-white/4 text-slate-300 border border-slate-200/10 hover:bg-white/6'
      )}
    >
      {label}
    </button>
  )
}

function ItemCard({ item, onOpen }) {
  return (
    <button onClick={() => onOpen?.(item)} className="text-left group w-full" aria-label={`Open ${item.title}`}>
      <div className="glass rounded-2xl overflow-hidden border border-slate-200/10 transform-gpu transition duration-300 group-hover:-translate-y-1 group-hover:border-slate-200/20">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <img src={item.images[0]} alt={item.title} className="h-44 w-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span
              className={clsx(
                'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border',
                item.type === 'lost'
                  ? 'bg-rose-500/15 border-rose-500/25 text-rose-200'
                  : 'bg-emerald-500/15 border-emerald-500/25 text-emerald-200'
              )}
            >
              {item.type === 'lost' ? 'Lost' : 'Found'}
            </span>
            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-white/5 border border-slate-200/10 text-slate-200">
              {item.category}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-100">{item.title}</div>
              <div className="text-xs text-slate-300/80 mt-0.5 flex items-center gap-2">
                <Icon name="tag" className="text-slate-300/80" />
                <span>{item.location}</span>
              </div>
            </div>
            <div className="hidden sm:block text-slate-200/80 text-xs">{formatDate(item.date)}</div>
          </div>
        </div>
        <div className="px-4 py-4">
          <div className="flex flex-wrap gap-2">
            {item.tags.slice(0, 3).map((t) => (
              <span key={t} className="text-xs rounded-full bg-white/4 border border-slate-200/10 text-slate-300 px-2 py-1">
                {t}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="text-xs rounded-full bg-white/4 border border-slate-200/10 text-slate-300 px-2 py-1">+{item.tags.length - 3}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

function Toast({ text, show }) {
  if (!show) return null
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60]" aria-live="polite">
      <div className="glass rounded-2xl border border-slate-200/10 px-4 py-3 shadow-glow flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-200 animate-pulseSoft">
          <Icon name="spark" className="text-violet-200" />
        </span>
        <div className="text-sm">{text}</div>
      </div>
    </div>
  )
}

function AvatarBadge({ user }) {
  const role = user?.role || 'user'
  const label = role === 'admin' ? 'Admin' : 'User'
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/10 bg-white/4 px-3 py-1">
      <span
        className={clsx(
          'inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
          role === 'admin'
            ? 'bg-violet-500/20 text-violet-200 border border-violet-500/30'
            : 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/25'
        )}
      >
        {(user?.username || '?').slice(0, 1).toUpperCase()}
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold truncate">{user?.username || 'Guest'}</div>
        <div className={clsx('text-xs', role === 'admin' ? 'text-violet-200/80' : 'text-emerald-200/80')}>{label}</div>
      </div>
    </div>
  )
}

function AuthForm({ mode, onSuccess, showToast, navigate }) {
  const isRegister = mode === 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    setError('')

    if (isRegister) {
      const uErr = validateUsername(username)
      if (uErr) return setError(uErr)
      const pErr = validatePassword(password)
      if (pErr) return setError(pErr)

      const users = readUsers()
      const exists = users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())
      if (exists) return setError('Username already exists.')

      const hashed = hashPassword(password)
      const newUser = {
        username: username.trim(),
        role: role === 'admin' ? 'admin' : 'user',
        password: hashed
      }
      writeUsers([newUser, ...users])

      const session = { username: newUser.username, role: newUser.role }
      setSession(session)
      showToast('Account created!')
      onSuccess?.(session)
      navigate('#/')
      return
    }

    const u = username.trim()
    if (!u) return setError('Username is required.')
    if (!password) return setError('Password is required.')

    const users = readUsers()
    const found = users.find((x) => x.username.toLowerCase() === u.toLowerCase())
    if (!found) return setError('Invalid username or password.')

    const hashed = hashPassword(password)
    if (found.password !== hashed) return setError('Invalid username or password.')

    const session = { username: found.username, role: found.role }
    setSession(session)
    showToast('Welcome back!')
    onSuccess?.(session)
    navigate('#/')
  }

  return (
    <section className="max-w-2xl mx-auto px-4 pt-10 pb-14">
      <div className="glass rounded-3xl p-6 sm:p-8 border border-slate-200/10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-slate-200/10 px-3 py-1 text-xs text-slate-300">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/15 text-violet-200 border border-violet-500/30">
              <Icon name="spark" />
            </span>
            {isRegister ? 'Create an account' : 'Sign in'}
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold">{isRegister ? 'Register' : 'Login'}</h2>
          <p className="mt-2 text-slate-300/80">Frontend-only demo using localStorage.</p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-slate-300/90">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full ring-glow rounded-2xl bg-white/4 border border-slate-200/10 px-4 py-3 text-sm outline-none focus:border-violet-400/40"
              placeholder="e.g. alex_01"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300/90">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full ring-glow rounded-2xl bg-white/4 border border-slate-200/10 px-4 py-3 text-sm outline-none focus:border-violet-400/40"
              placeholder="At least 6 characters"
            />
          </div>

          {isRegister && (
            <div>
              <label className="text-sm text-slate-300/90">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-2 w-full ring-glow rounded-2xl bg-white/4 border border-slate-200/10 px-4 py-3 text-sm outline-none"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          {error && <div className="text-sm text-rose-200/90">{error}</div>}

          <button
            type="submit"
            className="w-full ring-glow rounded-2xl bg-violet-500/25 border border-violet-500/40 px-5 py-3 text-sm font-semibold hover:bg-violet-500/30 transition flex items-center justify-center gap-2"
          >
            <Icon name="spark" />
            {isRegister ? 'Create account' : 'Login'}
          </button>

          <div className="text-center text-sm text-slate-300/80">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => navigate('#/login')} className="text-violet-200 hover:underline">
                  Login
                </button>
              </>
            ) : (
              <>
                No account yet?{' '}
                <button type="button" onClick={() => navigate('#/register')} className="text-violet-200 hover:underline">
                  Register
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}

export default function App() {
  const hash = useHashRoute()
  const { path, query } = useMemo(() => parseRoute(hash), [hash])

  const [items, setItems] = useState(seedItems)
  const [activeType, setActiveType] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [selected, setSelected] = useState(null)
  const [toastText, setToastText] = useState('')
  const [toastShow, setToastShow] = useState(false)

  const [currentUser, setCurrentUser] = useState(() => getSession())

  useEffect(() => {
    const sess = getSession()
    setCurrentUser(sess)
  }, [hash, path])

  useEffect(() => {
    const id = query.id
    if (path === '/detail' && id) {
      const found = items.find((x) => x.id === id)
      setSelected(found || null)
    } else {
      setSelected(null)
    }
  }, [path, query.id, items])

  function navigate(next) {
    window.location.hash = next
  }

  function logout() {
    setSession(null)
    setCurrentUser(null)
    showToast('Logged out.')
    navigate('#/')
  }

  function showToast(text) {
    setToastText(text)
    setToastShow(true)
    window.setTimeout(() => setToastShow(false), 2000)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = items
    if (activeType !== 'all') list = list.filter((x) => x.type === activeType)
    if (q) {
      list = list.filter((x) => {
        const blob = [x.title, x.category, x.location, x.description, ...x.tags].join(' ').toLowerCase()
        return blob.includes(q)
      })
    }
    list = [...list].sort((a, b) => {
      if (sort === 'newest') return new Date(b.date) - new Date(a.date)
      if (sort === 'oldest') return new Date(a.date) - new Date(b.date)
      if (sort === 'title') return a.title.localeCompare(b.title)
      return 0
    })
    return list
  }, [items, activeType, search, sort])

  function openItem(item) {
    setSelected(item)
    navigate(`#/detail?id=${encodeURIComponent(item.id)}`)
  }

  // Post form state (frontend-only)
  const [postType, setPostType] = useState('lost')
  const [postTitle, setPostTitle] = useState('')
  const [postCategory, setPostCategory] = useState('Accessories')
  const [postLocation, setPostLocation] = useState('')
  const [postDate, setPostDate] = useState(new Date().toISOString().slice(0, 10))
  const [postDesc, setPostDesc] = useState('')
  const [postTags, setPostTags] = useState('')

  const categories = ['Accessories', 'Electronics', 'Documents', 'Home & Travel', 'Clothing', 'Keys', 'Other']

  function submitPost(e) {
    e.preventDefault()
    if (!currentUser) {
      showToast('Login required to post.')
      navigate('#/login')
      return
    }

    const title = postTitle.trim()
    const loc = postLocation.trim()
    if (!title || !loc) {
      showToast('Add title and location to post.')
      return
    }

    const tags = postTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 6)

    const newItem = {
      id: `i-${Math.floor(Math.random() * 900000 + 100000)}`,
      type: postType,
      title,
      category: postCategory,
      location: loc,
      date: postDate,
      priceHint: '$',
      description: postDesc.trim() || 'No extra details provided.',
      tags: tags.length ? tags : ['new'],
      images: ['https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=70'],
      status: 'unverified'
    }

    setItems((prev) => [newItem, ...prev])
    setPostTitle('')
    setPostLocation('')
    setPostDesc('')
    setPostTags('')
    showToast('Posted! Your item is now visible.')
    navigate('#/search')
    setActiveType('all')
    setSearch('')
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 gradient-flow">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl animate-floaty" />
        <div className="absolute top-32 right-0 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl animate-floaty [animation-delay:900ms]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-80 w-[48rem] rounded-full bg-emerald-500/10 blur-3xl animate-floaty [animation-delay:400ms]" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-noise" />

      <header className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <div className="glass rounded-3xl px-4 sm:px-5 py-3 border border-slate-200/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-11 w-11 rounded-2xl bg-violet-500/15 border border-violet-500/30 shadow-glow flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-300/35 to-transparent -translate-x-full animate-shimmer" />
                  <span className="relative z-10 font-bold text-violet-200">LF</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-300/80">Lost & Found</div>
                <div className="text-base font-semibold">Find it faster</div>
              </div>
            </div>

            <nav className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => navigate('#/')}
                className={clsx(
                  'ring-glow rounded-xl px-3 py-2 text-sm border transition',
                  path === '/' ? 'bg-white/7 border-white/10' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-slate-200/10'
                )}
              >
                Home
              </button>
              <button
                onClick={() => navigate('#/search')}
                className={clsx(
                  'ring-glow rounded-xl px-3 py-2 text-sm border transition',
                  path === '/search' ? 'bg-white/7 border-white/10' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-slate-200/10'
                )}
              >
                Search
              </button>

              <button
                onClick={() => {
                  if (!currentUser) return navigate('#/login')
                  navigate('#/post')
                }}
                className="ring-glow rounded-xl px-3 py-2 text-sm bg-violet-500/15 border border-violet-500/30 hover:bg-violet-500/20 transition flex items-center gap-2"
              >
                <Icon name="plus" /> Post
              </button>

              {!currentUser ? (
                <>
                  <button
                    onClick={() => navigate('#/login')}
                    className={clsx(
                      'ring-glow rounded-xl px-3 py-2 text-sm border transition',
                      path === '/login' ? 'bg-white/7 border-white/10' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-slate-200/10'
                    )}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('#/register')}
                    className="ring-glow rounded-xl px-3 py-2 text-sm bg-white/5 border border-slate-200/10 hover:bg-white/7 transition"
                  >
                    Register
                  </button>
                </>
              ) : (
                <button onClick={logout} className="ring-glow rounded-xl px-3 py-2 text-sm bg-white/5 border border-slate-200/10 hover:bg-white/7 transition">
                  Logout
                </button>
              )}
            </nav>

            <div className="sm:hidden">
              <button
                onClick={() => {
                  if (!currentUser) return navigate('#/login')
                  navigate('#/post')
                }}
                className="ring-glow rounded-xl px-3 py-2 text-sm bg-violet-500/15 border border-violet-500/30 hover:bg-violet-500/20 transition flex items-center gap-2"
              >
                <Icon name="plus" /> Post
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {path === '/' && (
          <section className="max-w-6xl mx-auto px-4 pt-10 pb-14">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-slate-200/10 px-3 py-1 text-xs text-slate-300">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/15 text-violet-200">
                    <Icon name="spark" className="text-violet-200" />
                  </span>
                  Match by title, tags, and location
                </div>

                <h1 className="mt-5 text-3xl sm:text-5xl font-bold leading-tight">
                  Lost something?<br />
                  Found something?<br />
                  <span className="text-violet-200">Let’s connect.</span>
                </h1>

                <p className="mt-5 text-slate-300/85 text-base sm:text-lg leading-relaxed max-w-xl">
                  Search, open details, and post items with a UI that feels alive—dark, sleek, and animated.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate('#/search')}
                    className="ring-glow rounded-2xl bg-violet-500/20 border border-violet-500/35 px-5 py-3 text-sm font-semibold hover:bg-violet-500/25 transition flex items-center justify-center gap-2"
                  >
                    <Icon name="search" />
                    Search lost/found items
                  </button>

                  <button
                    onClick={() => navigate('#/post')}
                    className="ring-glow rounded-2xl bg-white/5 border border-slate-200/10 px-5 py-3 text-sm font-semibold hover:bg-white/7 transition"
                  >
                    Post an item
                  </button>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  {currentUser ? (
                    <AvatarBadge user={currentUser} />
                  ) : (
                    <div className="text-sm text-slate-300/80">Sign in to post items.</div>
                  )}
                </div>

                <div className="mt-10 grid sm:grid-cols-3 gap-3">
                  {[{ k: '0.3s', t: 'fast search UI' }, { k: '3D', t: 'card micro-interactions' }, { k: 'ESC', t: 'keyboard modal close' }].map((x) => (
                    <div key={x.t} className="glass rounded-2xl p-4 border border-slate-200/10 animate-[popIn_240ms_ease-out_forwards] opacity-100">
                      <div className="text-violet-200 font-semibold">{x.k}</div>
                      <div className="text-xs text-slate-300/80 mt-1">{x.t}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="glass rounded-3xl p-4 border border-slate-200/10 overflow-hidden">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-violet-500/12 via-transparent to-transparent" />
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-300/80">Trending matches</div>
                        <div className="text-xs text-slate-300/70">Today</div>
                      </div>

                      <div className="mt-4 grid gap-3">
                        {items.slice(0, 3).map((it) => (
                          <button
                            key={it.id}
                            onClick={() => openItem(it)}
                            className="group flex items-center gap-3 rounded-2xl border border-slate-200/10 bg-white/3 hover:bg-white/5 transition p-3 text-left"
                          >
                            <div className="h-11 w-11 rounded-xl overflow-hidden border border-slate-200/10">
                              <img src={it.images[0]} alt={it.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold truncate">{it.title}</div>
                              <div className="text-xs text-slate-300/80 truncate">{it.location}</div>
                            </div>
                            <div className="ml-auto text-xs text-slate-300/60">{formatDate(it.date)}</div>
                          </button>
                        ))}
                      </div>

                      <div className="mt-4 h-10 overflow-hidden rounded-2xl border border-slate-200/10 bg-white/3">
                        <div className="h-full w-full bg-gradient-to-r from-transparent via-violet-300/20 to-transparent shimmer" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {path === '/search' && (
          <section className="max-w-6xl mx-auto px-4 pt-10 pb-14">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Search</h2>
                <p className="text-slate-300/80 mt-2">Filter lost & found items with animated chips and instant results.</p>
              </div>

              <button
                onClick={() => navigate('#/post')}
                className="ring-glow rounded-2xl bg-violet-500/20 border border-violet-500/35 px-4 py-2.5 text-sm font-semibold hover:bg-violet-500/25 transition flex items-center gap-2"
              >
                <Icon name="plus" /> Post
              </button>
            </div>

            <div className="mt-7 glass rounded-3xl p-4 sm:p-5 border border-slate-200/10">
              <div className="grid lg:grid-cols-12 gap-4 items-center">
                <div className="lg:col-span-6">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300/70">
                      <Icon name="search" />
                    </span>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by title, tag, category, or location..."
                      className="w-full ring-glow rounded-2xl bg-white/4 border border-slate-200/10 pl-11 pr-4 py-3 text-sm outline-none placeholder:text-slate-400/70 focus:border-violet-400/40"
                    />
                  </div>
                </div>

                <div className="lg:col-span-3 flex flex-wrap gap-2">
                  {[{ v: 'all', l: 'All' }, { v: 'lost', l: 'Lost' }, { v: 'found', l: 'Found' }].map((x) => (
                    <Chip key={x.v} label={x.l} active={activeType === x.v} onClick={() => setActiveType(x.v)} />
                  ))}
                </div>

                <div className="lg:col-span-3">
                  <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full ring-glow rounded-2xl bg-white/4 border border-slate-200/10 px-4 py-3 text-sm outline-none">
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="title">Title A-Z</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm text-slate-300/80">
                  Showing <span className="text-slate-100 font-semibold">{filtered.length}</span> results
                </div>
                <button
                  onClick={() => {
                    setActiveType('all')
                    setSearch('')
                    setSort('newest')
                    showToast('Filters reset.')
                  }}
                  className="ring-glow rounded-2xl bg-white/4 border border-slate-200/10 px-4 py-2 text-sm hover:bg-white/6 transition"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((it, idx) => (
                <div key={it.id} className="animate-[gridReveal_360ms_ease-out_forwards]" style={{ animationDelay: `${idx * 45}ms` }}>
                  <ItemCard item={it} onOpen={openItem} />
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="glass sm:col-span-2 lg:col-span-3 rounded-3xl border border-slate-200/10 p-8 text-center">
                  <div className="text-violet-200 font-semibold">No matches</div>
                  <div className="text-slate-300/80 mt-2">Try removing filters or searching a different keyword.</div>
                </div>
              )}
            </div>
          </section>
        )}

        {path === '/register' && (
          <AuthForm
            mode="register"
            showToast={showToast}
            navigate={navigate}
            onSuccess={(u) => setCurrentUser(u)}
          />
        )}

        {path === '/login' && (
          <AuthForm
            mode="login"
            showToast={showToast}
            navigate={navigate}
            onSuccess={(u) => setCurrentUser(u)}
          />
        )}

        {path === '/post' && (
          !currentUser ? (
            <section className="max-w-2xl mx-auto px-4 pt-10 pb-14">
              <div className="glass rounded-3xl p-6 sm:p-8 border border-slate-200/10 text-center">
                <div className="text-violet-200 font-semibold">Login required</div>
                <div className="text-slate-300/80 mt-2">Please sign in before posting an item.</div>
                <button
                  onClick={() => navigate('#/login')}
                  className="mt-5 ring-glow rounded-2xl bg-violet-500/20 border border-violet-500/35 px-5 py-3 text-sm font-semibold hover:bg-violet-500/25 transition"
                >
                  Go to Login
                </button>
              </div>
            </section>
          ) : (
            <section className="max-w-6xl mx-auto px-4 pt-10 pb-14">
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold">Post an item</h2>
                  <p className="text-slate-300/80 mt-2">Frontend-only submission. Your post appears instantly.</p>
                </div>
                <button onClick={() => navigate('#/search')} className="ring-glow rounded-2xl bg-white/5 border border-slate-200/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/7 transition">
                  Back to search
                </button>
              </div>

              <div className="mt-7 grid lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7">
                  <div className="glass rounded-3xl p-4 sm:p-6 border border-slate-200/10">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-300/80">Step 1 of 3</div>
                      <div className="text-xs rounded-full bg-violet-500/15 border border-violet-500/30 px-3 py-1 text-violet-200">Quick & beautiful</div>
                    </div>

                    <form onSubmit={submitPost} className="mt-5 space-y-4">
                      <div className="flex gap-2">
                        {[
                          { v: 'lost', l: 'Lost' },
                          { v: 'found', l: 'Found' }
                        ].map((x) => (
                          <button
                            key={x.v}
                            type="button"
                            onClick={() => setPostType(x.v)}
                            className={clsx(
                              'flex-1 ring-glow rounded-2xl px-4 py-3 text-sm font-semibold border transition',
                              postType === x.v
                                ? 'bg-violet-500/20 border-violet-500/35 text-violet-200 shadow-[0_0_18px_rgba(124,58,237,0.22)]'
                                : 'bg-white/4 border-slate-200/10 text-slate-300 hover:bg-white/6'
                            )}
                          >
                            {x.l}
                          </button>
                        ))}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-slate-300/90">Title</label>
                          <input
                            value={postTitle}
                            onChange={(e) => setPostTitle(e.target.value)}
                            className="mt-2 w-full ring-glow rounded-2xl bg-white/4 border border-slate-200/10 px-4 py-3 text-sm outline-none focus:border-violet-400/40"
                            placeholder="e.g. Blue Umbrella"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-300/90">Category</label>
                          <select value={postCategory} onChange={(e) => setPostCategory(e.target.value)} className="mt-2 w-full ring-glow rounded-2xl bg-white/4 border border-slate-200/10 px-4 py-3 text-sm outline-none">
                            {categories.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-slate-300/90">Location</label>
                          <input
                            value={postLocation}
                            onChange={(e) => setPostLocation(e.target.value)}
                            className="mt-2 w-full ring-glow rounded-2xl bg-white/4 border border-slate-200/10 px-4 py-3 text-sm outline-none focus:border-violet-400/40"
                            placeholder="Where it was lost/found"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-300/90">Date</label>
                          <input type="date" value={postDate} onChange={(e) => setPostDate(e.target.value)} className="mt-2 w-full ring-glow rounded-2xl bg-white/4 border border-slate-200/10 px-4 py-3 text-sm outline-none" />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-slate-300/90">Description</label>
                        <textarea
                          value={postDesc}
                          onChange={(e) => setPostDesc(e.target.value)}
                          className="mt-2 w-full ring-glow rounded-2xl bg-white/4 border border-slate-200/10 px-4 py-3 text-sm outline-none min-h-[110px] focus:border-violet-400/40"
                          placeholder="Any distinguishing details?"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-slate-300/90">Tags (comma separated)</label>
                        <input
                          value={postTags}
                          onChange={(e) => setPostTags(e.target.value)}
                          className="mt-2 w-full ring-glow rounded-2xl bg-white/4 border border-slate-200/10 px-4 py-3 text-sm outline-none focus:border-violet-400/40"
                          placeholder="e.g. wallet, leather, cards"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full ring-glow rounded-2xl bg-violet-500/25 border border-violet-500/40 px-5 py-3 text-sm font-semibold hover:bg-violet-500/30 transition flex items-center justify-center gap-2"
                      >
                        <Icon name="spark" />
                        Publish post
                      </button>
                    </form>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="glass rounded-3xl p-4 sm:p-6 border border-slate-200/10">
                    <div className="text-sm text-slate-300/80">Live preview</div>
                    <div className="mt-4 rounded-3xl border border-slate-200/10 bg-white/3 overflow-hidden">
                      <div className="h-40 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/25 via-transparent to-cyan-500/15" />
                        <div className="absolute inset-0 bg-noise opacity-20" />
                        <div className="absolute left-4 bottom-4 right-4">
                          <div className="text-sm font-semibold">{postTitle.trim() || 'Your item title'}</div>
                          <div className="text-xs text-slate-300/80 mt-1">
                            {postLocation.trim() || 'Location'} · {postCategory}
                          </div>
                        </div>
                        <div className="absolute top-3 left-3">
                          <span
                            className={clsx(
                              'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border',
                              postType === 'lost'
                                ? 'bg-rose-500/15 border-rose-500/25 text-rose-200'
                                : 'bg-emerald-500/15 border-emerald-500/25 text-emerald-200'
                            )}
                          >
                            {postType === 'lost' ? 'Lost' : 'Found'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-xs text-slate-300/80">{postDesc.trim() ? postDesc.trim() : 'Add description to improve match quality.'}</div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {(postTags.trim() ? postTags.split(',').map((t) => t.trim()).filter(Boolean) : ['new']).slice(0, 4).map((t) => (
                            <span key={t} className="text-xs rounded-full bg-white/4 border border-slate-200/10 text-slate-300 px-2 py-1">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 text-xs text-slate-400/80">Tip: The matching engine (future backend) will use title + tags + location.</div>
                  </div>
                </div>
              </div>
            </section>
          )
        )}

        {path === '/detail' && (
          <section className="max-w-6xl mx-auto px-4 pt-10 pb-14">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Item details</h2>
                <p className="text-slate-300/80 mt-2">Preview the lost/found match and contact later (backend not included).</p>
              </div>
              <button onClick={() => navigate('#/search')} className="ring-glow rounded-2xl bg-white/5 border border-slate-200/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/7 transition">Back</button>
            </div>

            <div className="mt-7">
              <Modal
                open={!!selected}
                title={selected ? selected.title : 'Item'}
                onClose={() => {
                  navigate('#/search')
                }}
              >
                {selected && (
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="rounded-2xl overflow-hidden border border-slate-200/10">
                      <img src={selected.images[0]} alt={selected.title} className="h-64 w-full object-cover" />
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={clsx(
                            'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border',
                            selected.type === 'lost'
                              ? 'bg-rose-500/15 border-rose-500/25 text-rose-200'
                              : 'bg-emerald-500/15 border-emerald-500/25 text-emerald-200'
                          )}
                        >
                          {selected.type === 'lost' ? 'Lost' : 'Found'}
                        </span>
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-white/5 border border-slate-200/10 text-slate-200">{selected.category}</span>
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-white/5 border border-slate-200/10 text-slate-200">{formatDate(selected.date)}</span>
                      </div>

                      <div className="mt-3 text-slate-300/85 text-sm">
                        <div className="font-semibold text-slate-100">Location</div>
                        <div className="mt-1 text-slate-300/80">{selected.location}</div>
                      </div>

                      <div className="mt-5">
                        <div className="font-semibold text-slate-100 text-sm">Description</div>
                        <p className="text-slate-300/80 mt-2 text-sm leading-relaxed">{selected.description}</p>
                      </div>

                      <div className="mt-5">
                        <div className="font-semibold text-slate-100 text-sm">Tags</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selected.tags.map((t) => (
                            <span key={t} className="text-xs rounded-full bg-white/4 border border-slate-200/10 text-slate-300 px-2 py-1">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => showToast('Contact feature is backend-only in this demo.')}
                          className="ring-glow rounded-2xl bg-violet-500/25 border border-violet-500/40 px-4 py-3 text-sm font-semibold hover:bg-violet-500/30 transition"
                        >
                          Contact owner
                        </button>
                        <button
                          onClick={() => {
                            navigate('#/search')
                            setSearch(selected.title)
                            setActiveType('all')
                            showToast('Searching similar items...')
                          }}
                          className="ring-glow rounded-2xl bg-white/5 border border-slate-200/10 px-4 py-3 text-sm font-semibold hover:bg-white/7 transition"
                        >
                          Find similar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Modal>
            </div>
          </section>
        )}

        {path !== '/' && path !== '/search' && path !== '/post' && path !== '/detail' && path !== '/login' && path !== '/register' && (
          <section className="max-w-6xl mx-auto px-4 pt-10 pb-14">
            <div className="glass rounded-3xl p-8 border border-slate-200/10 text-center">
              <div className="text-violet-200 font-semibold">Page not found</div>
              <div className="text-slate-300/80 mt-2">Use the navigation to continue.</div>
              <button onClick={() => navigate('#/')} className="mt-5 ring-glow rounded-2xl bg-violet-500/20 border border-violet-500/35 px-5 py-3 text-sm font-semibold hover:bg-violet-500/25 transition">
                Go Home
              </button>
            </div>
          </section>
        )}
      </main>

      <Toast text={toastText} show={toastShow} />
    </div>
  )
}

