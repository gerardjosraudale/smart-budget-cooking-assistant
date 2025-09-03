import { useEffect, useState } from 'react'
import { db } from '../utils/firebase'
import { collection, onSnapshot, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { Card, CardBody, CardHeader } from './ui/Card'
import Button from './ui/Button'

function Chip({ children }) {
  return <span className="inline-flex items-center h-7 px-3 rounded-2xl bg-silver text-ink text-xs dark:bg-white/10 dark:text-silver">{children}</span>
}

export default function RecipeList() {
  const { currentUser } = useAuth()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return
    const q = query(
      collection(db, 'recipes'),
      where('uid', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, snap => {
      setRecipes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [currentUser])

  const remove = async (id) => {
    if (!confirm('Delete this recipe?')) return
    await deleteDoc(doc(db, 'recipes', id))
  }

  if (loading) return <Card><CardBody>Loading your recipes…</CardBody></Card>
  if (!recipes.length) return (
    <Card>
      <CardBody>
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold">No recipes yet</h3>
          <p className="text-neutral-600 dark:text-neutral-400">Add your first recipe above to start planning and budgeting.</p>
        </div>
      </CardBody>
    </Card>
  )

  const totalCost = recipes.reduce((sum, r) => sum + (typeof r.cost === 'number' ? r.cost : 0), 0)

  return (
    <Card>
      <CardHeader
        title="Your recipes"
        subtitle={`Budget total (est): $${totalCost.toFixed(2)}`}
      />
      <CardBody>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map(r => (
            <li key={r.id} className="p-4 rounded-2xl card-border bg-white/70 dark:bg-white/5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-base">{r.title}</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(Array.isArray(r.ingredients) ? r.ingredients : String(r.ingredients).split(',')).map((i, idx) => (
                      <Chip key={idx}>{String(i).trim()}</Chip>
                    ))}
                  </div>
                </div>
                <div className="text-right text-sm text-neutral-600 dark:text-neutral-300 min-w-[90px]">
                  {r.time && <div>⌚ {r.time}</div>}
                  {typeof r.cost === 'number' && <div>💵 ${r.cost.toFixed(2)}</div>}
                </div>
              </div>

              {Array.isArray(r.steps) && r.steps.length > 0 && (
                <ol className="mt-3 list-decimal list-inside text-sm text-neutral-700 dark:text-neutral-300 space-y-1">
                  {r.steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              )}

              <div className="mt-4 flex justify-end">
                <Button variant="ghost" onClick={() => remove(r.id)}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}
