import React, { useState, useEffect } from 'react'
import Rates from './Rates'

const API_BASE = 'http://localhost:3000/api'

export default function App() {
  const [email, setEmail] = useState('admin@teste.com')
  const [password, setPassword] = useState('123456')
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [favorites, setFavorites] = useState([])
  const [newSymbol, setNewSymbol] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
      fetchFavorites()
    }
  }, [token])

  async function login(e) {
    e.preventDefault()
    setMessage('')
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) throw new Error('Credenciais inválidas')
      const data = await res.json()
      setToken(data.token)
      setMessage('Login realizado com sucesso')
    } catch (err) {
      setMessage(err.message)
    }
  }

  async function fetchFavorites() {
    setMessage('')
    try {
      const res = await fetch(`${API_BASE}/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Erro ao buscar favoritos')
      const data = await res.json()
      setFavorites(data)
    } catch (err) {
      setMessage(err.message)
    }
  }

  async function addFavorite(e) {
    e.preventDefault()
    if (!newSymbol) return
    try {
      const res = await fetch(`${API_BASE}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ symbol: newSymbol.toUpperCase() })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro')
      }
      setNewSymbol('')
      fetchFavorites()
    } catch (err) {
      setMessage(err.message)
    }
  }

  async function removeFavorite(symbol) {
    try {
      const res = await fetch(`${API_BASE}/favorites/${symbol}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Erro ao remover')
      fetchFavorites()
    } catch (err) {
      setMessage(err.message)
    }
  }

  function logout() {
    setToken('')
    localStorage.removeItem('token')
    setFavorites([])
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Desafio Câmbio — Frontend</h1>

      {!token ? (
        <form onSubmit={login} className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Login</h2>
          <label className="block mb-2">
            <span className="text-sm">Email</span>
            <input className="w-full border rounded px-2 py-1" value={email} onChange={e => setEmail(e.target.value)} />
          </label>
          <label className="block mb-2">
            <span className="text-sm">Senha</span>
            <input type="password" className="w-full border rounded px-2 py-1" value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Entrar</button>
        </form>
      ) : (
        <div>
          <div className="bg-white p-4 rounded shadow mb-4 flex justify-between items-center">
            <h2 className="font-semibold">Favoritos</h2>
            <div>
              <button onClick={fetchFavorites} className="mr-2 bg-gray-200 px-2 py-1 rounded">Atualizar</button>
              <button onClick={logout} className="bg-red-500 text-white px-2 py-1 rounded">Sair</button>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow mb-4">
            <h3 className="font-medium mb-2">Seus favoritos</h3>
            <ul>
              {favorites.length === 0 && <li className="text-sm text-gray-500">Nenhum favorito</li>}
              {favorites.map(s => (
                <li key={s} className="flex justify-between items-center py-1 border-b">
                  <span>{s}</span>
                  <button onClick={() => removeFavorite(s)} className="text-red-500">Remover</button>
                </li>
              ))}
            </ul>
          </div>

          <Rates token={token} favorites={favorites} onFavoriteChange={fetchFavorites} />
        </div>
      )}

      {message && <p className="mt-4 text-sm text-red-600">{message}</p>}

      <p className="mt-6 text-xs text-gray-500">Backend devendo em http://localhost:3000 — faça login com admin@teste.com / 123456</p>
    </div>
  )
}
