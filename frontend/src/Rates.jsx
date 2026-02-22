import React, { useState, useEffect } from 'react'

const API_BASE = 'http://localhost:3000/api'

export default function Rates({ token, favorites, onFavoriteChange }) {
  const [rates, setRates] = useState([])
  const [loading, setLoading] = useState(false)

  const symbolsList = ['USD','EUR','GBP','JPY','CAD','ARS','AUD','CHF','CNY','INR']

  useEffect(() => {
    if (token) fetchRates()
  }, [token])

  async function fetchRates() {
    setLoading(true)
    try {
      const symbols = symbolsList.join(',')
      const res = await fetch(`${API_BASE}/rates?symbols=${symbols}&to=BRL&amount=1`)
      if (!res.ok) throw new Error('Erro ao buscar cotações')
      const data = await res.json()
      setRates(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  
  async function toggleFavorite(symbol) {
    if (!token) return
    try {
      if (favorites.includes(symbol)) {
        const res = await fetch(`${API_BASE}/favorites/${symbol}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Erro ao remover favorito')
      } else {
        const res = await fetch(`${API_BASE}/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ symbol })
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Erro ao adicionar favorito')
        }
      }
      onFavoriteChange()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Cotações (BRL)</h3>
        <div>
          <button onClick={fetchRates} className="bg-gray-200 px-2 py-1 rounded">Atualizar</button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-gray-600">
              <th className="pb-2">Moeda</th>
              <th className="pb-2">Valor (BRL)</th>
              <th className="pb-2">Favorito</th>
            </tr>
          </thead>
          <tbody>
            {rates.map(r => (
              <tr key={r.symbol} className="border-t">
                <td className="py-2">{r.symbol}</td>
                <td className="py-2">{r.rate}</td>
                <td className="py-2">
                  <button onClick={() => toggleFavorite(r.symbol)} className="px-2 py-1">
                    {favorites.includes(r.symbol) ? '★' : '☆'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
