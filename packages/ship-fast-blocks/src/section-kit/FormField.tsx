import * as React from 'react'

import { cn } from '#/lib/utils.ts'

/**
 * FormField — a labeled form field wrapper that supports input, select,
 * and textarea elements. Used by ConstructionQuote, EventPlannerContact,
 * FoodTruckCatering, HotelResortBooking.
 *
 * The `inputClassName` prop is applied to the input/select/textarea element.
 * The `labelClassName` prop is applied to the label element.
 */
export function FormField(props: {
  id: string
  name: string
  label: string
  type?: 'text' | 'email' | 'tel' | 'date' | 'password' | 'number' | 'url'
  as?: 'input' | 'select' | 'textarea'
  placeholder?: string
  required?: boolean
  rows?: number
  options?: string[]
  inputClassName?: string
  labelClassName?: string
  className?: string
}) {
  const Tag = props.as ?? 'input'
  const labelCls = cn('mb-2 block text-sm font-medium', props.labelClassName)
  const inputCls = cn(props.inputClassName, {
    'appearance-none': props.as === 'select',
    'resize-none': props.as === 'textarea',
  })
  return (
    <div className={props.className}>
      <label htmlFor={props.id} className={labelCls}>
        {props.label}
      </label>
      {props.as === 'select' ? (
        <select
          id={props.id}
          name={props.name}
          required={props.required}
          className={inputCls}
        >
          {(props.options ?? []).map((opt) => (
            <option key={opt} className="bg-background">
              {opt}
            </option>
          ))}
        </select>
      ) : props.as === 'textarea' ? (
        <textarea
          id={props.id}
          name={props.name}
          rows={props.rows ?? 4}
          placeholder={props.placeholder}
          className={inputCls}
        />
      ) : (
        <input
          id={props.id}
          name={props.name}
          type={props.type ?? 'text'}
          required={props.required}
          placeholder={props.placeholder}
          className={inputCls}
        />
      )}
    </div>
  )
}
