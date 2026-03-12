import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepIndicatorProps {
  currentStep: number
  steps?: string[]
}

const defaultSteps = ['날짜선택', '정보입력', '예약완료']

export default function StepIndicator({ currentStep, steps = defaultSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center w-full max-w-lg mx-auto mb-8">
      {steps.map((label, index) => {
        const stepNum = index + 1
        const isCompleted = stepNum < currentStep
        const isCurrent = stepNum === currentStep

        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                  isCompleted
                    ? 'bg-pension-primary text-white'
                    : isCurrent
                    ? 'bg-pension-primary text-white ring-4 ring-pension-primary/20'
                    : 'bg-gray-200 text-gray-500'
                )}
              >
                {isCompleted ? <Check size={18} /> : stepNum}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium whitespace-nowrap',
                  isCurrent || isCompleted ? 'text-pension-primary' : 'text-gray-400'
                )}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 mt-[-1.25rem]',
                  isCompleted ? 'bg-pension-primary' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
