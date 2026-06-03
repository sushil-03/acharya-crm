'use client'

import React, { useState, useMemo } from 'react'
import { Check, Eye, EyeOff, X } from 'lucide-react'
import { useController } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

// --- Constants ---
const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, text: 'At least 8 characters' },
  { regex: /[0-9]/, text: 'At least 1 number' },
  { regex: /[a-z]/, text: 'At least 1 lowercase letter' },
  { regex: /[A-Z]/, text: 'At least 1 uppercase letter' },
  { regex: /[!-\/:-@[-`{-~]/, text: 'At least 1 special character' },
] as const

type StrengthScore = 0 | 1 | 2 | 3 | 4 | 5

// --- Type Definitions ---
interface PasswordStrengthFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label: string
  placeholder?: string
}

// --- Component ---
export function PasswordStrengthField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
}: PasswordStrengthFieldProps<TFieldValues>) {
  const [isVisible, setIsVisible] = useState(false)
  const {
    field,
    fieldState: { error },
  } = useController({ name, control })

  const strength = useMemo(() => {
    const value = field.value || ''
    const requirements = PASSWORD_REQUIREMENTS.map(req => ({
      met: req.regex.test(value),
      text: req.text,
    }))
    const score = requirements.filter(req => req.met).length as StrengthScore
    return { score, requirements }
  }, [field.value])

  const strengthColorClasses = [
    'bg-border', // Score 0: Default border color
    'bg-destructive', // Score 1: Weakest, uses destructive color (red)
    'bg-destructive', // Score 2: Still weak, uses destructive color (red)
    'bg-warning', // Score 3: Medium, uses warning color (orange/yellow)
    'bg-success', // Score 4: Strong, uses success color (green)
    'bg-success', // Score 5: Strongest, uses success color (green)
  ]

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <Input
          {...field}
          id={name}
          type={isVisible ? 'text' : 'password'}
          placeholder={placeholder}
          className={error ? 'border-destructive' : ''}
          aria-invalid={!!error}
        />
        <button
          type="button"
          onClick={() => setIsVisible(prev => !prev)}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex w-10 items-center justify-center"
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Strength Indicator Bar */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              strength.score > index
                ? strengthColorClasses[strength.score]
                : 'bg-border'
            }`}
          />
        ))}
      </div>

      {/* Validation Checklist */}
      {field.value && (
        <ul className="mt-2 space-y-1.5" aria-label="Password requirements">
          {strength.requirements.map((req, index) => (
            <li key={index} className="flex items-center space-x-2">
              {req.met ? (
                <Check size={16} className="text-success" />
              ) : (
                <X size={16} className="text-muted-foreground/80" />
              )}
              <span
                className={`text-sm ${req.met ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {req.text}
              </span>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p className="text-destructive mt-1 text-sm">{error.message}</p>
      )}
    </div>
  )
}
