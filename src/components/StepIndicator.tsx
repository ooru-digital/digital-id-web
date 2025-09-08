import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center space-x-3">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        
        return (
          <React.Fragment key={stepNumber}>
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 text-xs font-semibold
              ${isCompleted 
                ? 'bg-[#5D5FEF] border-[#5D5FEF] text-white shadow-md' 
                : isCurrent 
                  ? 'bg-[#5D5FEF] border-[#5D5FEF] text-white shadow-md' 
                  : 'bg-white border-gray-300 text-gray-500'
              }
            `}>
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                <span>{stepNumber}</span>
              )}
            </div>
            {stepNumber < totalSteps && (
              <div className={`
                w-12 h-0.5 rounded-full transition-all duration-300
                ${stepNumber < currentStep ? 'bg-[#5D5FEF]' : 'bg-gray-300'}
              `} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}