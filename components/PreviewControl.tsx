'use client'

import { useState } from 'react'
import { Type, Minus, Plus } from 'lucide-react'

interface PreviewControlProps {
  onTextChange: (text: string) => void
  onSizeChange: (size: number) => void
  defaultText?: string
  defaultSize?: number
}

export default function PreviewControl({
  onTextChange,
  onSizeChange,
  defaultText = '',
  defaultSize = 28,
}: PreviewControlProps) {
  const [text, setText] = useState(defaultText)
  const [size, setSize] = useState(defaultSize)

  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
    onTextChange(e.target.value)
  }

  const changeSize = (delta: number) => {
    const next = Math.min(72, Math.max(16, size + delta))
    setSize(next)
    onSizeChange(next)
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.3)',
        border: '1px solid var(--border)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Type size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />

      <input
        type="text"
        value={text}
        onChange={handleText}
        placeholder="미리볼 텍스트를 입력하세요..."
        className="flex-1 bg-transparent text-sm outline-none"
        style={{ color: 'var(--text-primary)' }}
      />

      {/* 크기 조절 */}
      <div
        className="flex items-center gap-1 pl-3"
        style={{ borderLeft: '1px solid var(--border)' }}
      >
        <button
          onClick={() => changeSize(-4)}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
          style={{ color: 'var(--text-muted)' }}
        >
          <Minus size={12} />
        </button>
        <span
          className="w-8 text-center text-xs font-medium tabular-nums"
          style={{ color: 'var(--text-secondary)' }}
        >
          {size}
        </span>
        <button
          onClick={() => changeSize(4)}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
          style={{ color: 'var(--text-muted)' }}
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  )
}
