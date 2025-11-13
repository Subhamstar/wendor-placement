import React, { useMemo, useState } from 'react'
import data from '../../data.json'

const CATEGORIES = ['All', 'Snacks', 'Salad', 'Bowls', 'Wraps']

function matchesCategory(item, category) {
  const name = (item.product_name || '').toLowerCase()
  if (category === 'All') return true
  if (category === 'Salad') return name.includes('salad')
  if (category === 'Bowls') return name.includes('bowl')
  if (category === 'Wraps') return name.includes('wrap')
  if (category === 'Snacks') {
    return !(name.includes('salad') || name.includes('bowl') || name.includes('wrap'))
  }
  return true
}

export default function Home({ onOpenVending = () => {} }) {
  const [category, setCategory] = useState('All')

  const products = useMemo(() => {
    return (data || []).map((p, idx) => ({
      id: p.product_id || idx,
      name: p.product_name || 'Unnamed',
      price: Number(p.product_price) || 0,
      image: p.image_mini || p.image || '',
      raw: p
    }))
  }, [])

  const filtered = products.filter(p => matchesCategory(p.raw, category))

  return (
    // <section className="max-w-6xl mx-auto p-6">
    //   {/* Categories */}
    //   <div className="flex flex-wrap justify-center gap-3 mb-8">
    //     {CATEGORIES.map(c => (
    //       <button
    //         key={c}
    //         className={`px-4 py-2 rounded-full border transition-all duration-200 text-sm sm:text-base
    //           ${c === category
    //             ? 'bg-blue-600 text-white shadow-md scale-105'
    //             : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-100'
    //           }`}
    //         onClick={() => setCategory(c)}
    //       >
    //         {c}
    //       </button>
    //     ))}
    //   </div>

    //   {/* Product Grid */}
    //   <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    //     {filtered.map(p => (
    //       <div
    //         key={p.id}
    //         className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
    //       >
    //         {p.image ? (
    //           <img
    //             src={p.image}
    //             alt={p.product_name}
    //             className="w-full h-40 object-cover"
    //           />
    //         ) : (
    //           <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400">
    //             No Image
    //           </div>
    //         )}

    //         <div className="p-4">
    //           <div className="font-semibold text-gray-800 text-lg mb-1 truncate">{p.product_name}</div>
    //           <div className="text-blue-600 font-medium mb-3">${p.price.toFixed(2)}</div>

    //           <button
    //             onClick={() => onOpenVending()}
    //             className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-all duration-200"
    //           >
    //             Open Vending
    //           </button>
    //         </div>
    //       </div>
    //     ))}
    //   </div>
    // </section>
    <>
    </>
  )
}
