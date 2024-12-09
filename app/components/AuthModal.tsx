"use client"

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'

type AuthMode = 'login' | 'register'

export function AuthModal() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement actual authentication logic
    console.log(mode, { email, password, name })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{mode === 'login' ? '로그인' : '회원가입'}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'login' ? '로그인' : '회원가입'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {mode === 'register' && (
            <Input
              type="text"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <Button type="submit" className="w-full">
            {mode === 'login' ? '로그인' : '회원가입'}
          </Button>
        </form>
        <Button
          variant="link"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? '회원가입으로 전환' : '로그인으로 전환'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

