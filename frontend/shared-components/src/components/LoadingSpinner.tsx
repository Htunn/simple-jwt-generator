import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-solid border-current border-r-transparent',
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        default: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
        '2xl': 'h-16 w-16',
      },
      variant: {
        default: 'text-gray-900 dark:text-gray-100',
        primary: 'text-blue-600 dark:text-blue-400',
        secondary: 'text-gray-600 dark:text-gray-400',
        success: 'text-green-600 dark:text-green-400',
        warning: 'text-yellow-600 dark:text-yellow-400',
        destructive: 'text-red-600 dark:text-red-400',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
  showLabel?: boolean;
  centered?: boolean;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, variant, label, showLabel = false, centered = false, ...props }, ref) => {
    const spinnerElement = (
      <div
        className={cn(spinnerVariants({ size, variant }), className)}
        role="status"
        aria-label={label || 'Loading'}
      />
    );

    const content = (
      <>
        {spinnerElement}
        {(showLabel || label) && (
          <span className={cn(
            'text-sm text-gray-600 dark:text-gray-400',
            size === 'xs' && 'text-xs',
            size === 'sm' && 'text-xs',
            size === 'lg' && 'text-base',
            size === 'xl' && 'text-lg',
            size === '2xl' && 'text-xl'
          )}>
            {label || 'Loading...'}
          </span>
        )}
      </>
    );

    if (centered) {
      return (
        <div
          ref={ref}
          className={cn('flex items-center justify-center', 
            (showLabel || label) && 'flex-col space-y-2'
          )}
          {...props}
        >
          {content}
        </div>
      );
    }

    if (showLabel || label) {
      return (
        <div
          ref={ref}
          className="flex items-center space-x-2"
          {...props}
        >
          {content}
        </div>
      );
    }

    return (
      <div ref={ref} {...props}>
        {spinnerElement}
      </div>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

// Skeleton Loading Component
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  circle?: boolean;
  lines?: number;
  className?: string;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, width, height, rounded = true, circle = false, lines = 1, style, ...props }, ref) => {
    if (lines > 1) {
      return (
        <div ref={ref} className="space-y-2" {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'animate-pulse bg-gray-200 dark:bg-gray-800',
                rounded && 'rounded',
                className
              )}
              style={{
                width: index === lines - 1 ? '75%' : '100%',
                height: height || '1rem',
                ...style,
              }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse bg-gray-200 dark:bg-gray-800',
          circle ? 'rounded-full' : rounded ? 'rounded' : '',
          className
        )}
        style={{
          width: circle ? (height || width || '2rem') : width,
          height: height || '1rem',
          ...style,
        }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Page Loading Component
export interface PageLoadingProps {
  title?: string;
  description?: string;
  className?: string;
}

const PageLoading = React.forwardRef<HTMLDivElement, PageLoadingProps>(
  ({ title, description, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center min-h-[400px] space-y-4',
          className
        )}
        {...props}
      >
        <LoadingSpinner size="xl" variant="primary" />
        {title && (
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
            {description}
          </p>
        )}
      </div>
    );
  }
);

PageLoading.displayName = 'PageLoading';

// Inline Loading Component for buttons and forms
export interface InlineLoadingProps {
  size?: VariantProps<typeof spinnerVariants>['size'];
  text?: string;
  className?: string;
}

const InlineLoading = React.forwardRef<HTMLDivElement, InlineLoadingProps>(
  ({ size = 'sm', text, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center space-x-2', className)}
        {...props}
      >
        <LoadingSpinner size={size} />
        {text && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {text}
          </span>
        )}
      </div>
    );
  }
);

InlineLoading.displayName = 'InlineLoading';

export { LoadingSpinner, Skeleton, PageLoading, InlineLoading };
