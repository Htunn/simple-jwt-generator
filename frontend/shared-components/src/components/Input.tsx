import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const inputVariants = cva(
  'flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300',
  {
    variants: {
      variant: {
        default: 'border-gray-200 focus-visible:ring-gray-950',
        destructive:
          'border-red-300 focus-visible:ring-red-500 dark:border-red-800 dark:focus-visible:ring-red-400',
        success:
          'border-green-300 focus-visible:ring-green-500 dark:border-green-800 dark:focus-visible:ring-green-400',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        default: 'h-10 px-3',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  description?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  loading?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, type, label, description, error, startIcon, endIcon, loading, disabled, ...props }, ref) => {
    const inputId = React.useId();
    const descriptionId = React.useId();
    const errorId = React.useId();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {startIcon}
            </div>
          )}
          
          <input
            id={inputId}
            type={type}
            className={cn(
              inputVariants({ variant: error ? 'destructive' : variant, size, className }),
              startIcon && 'pl-10',
              (endIcon || loading) && 'pr-10'
            )}
            ref={ref}
            disabled={disabled || loading}
            aria-describedby={
              description ? descriptionId : error ? errorId : undefined
            }
            aria-invalid={error ? 'true' : undefined}
            {...props}
          />
          
          {(endIcon || loading) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600" />
              ) : (
                endIcon
              )}
            </div>
          )}
        </div>
        
        {description && !error && (
          <p
            id={descriptionId}
            className="text-sm text-gray-500 dark:text-gray-400 mt-1"
          >
            {description}
          </p>
        )}
        
        {error && (
          <p
            id={errorId}
            className="text-sm text-red-600 dark:text-red-400 mt-1"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea component
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, description, error, ...props }, ref) => {
    const textareaId = React.useId();
    const descriptionId = React.useId();
    const errorId = React.useId();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block"
          >
            {label}
          </label>
        )}
        
        <textarea
          id={textareaId}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300',
            error && 'border-red-300 focus-visible:ring-red-500 dark:border-red-800 dark:focus-visible:ring-red-400',
            className
          )}
          ref={ref}
          aria-describedby={
            description ? descriptionId : error ? errorId : undefined
          }
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />
        
        {description && !error && (
          <p
            id={descriptionId}
            className="text-sm text-gray-500 dark:text-gray-400 mt-1"
          >
            {description}
          </p>
        )}
        
        {error && (
          <p
            id={errorId}
            className="text-sm text-red-600 dark:text-red-400 mt-1"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Input, Textarea };
