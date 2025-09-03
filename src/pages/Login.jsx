import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Input, Label } from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try { await login(email, password) } finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader title="Log in" subtitle="Welcome back" />
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pw">Password</Label>
              <Input id="pw" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading? 'Signing in…':'Sign in'}</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
