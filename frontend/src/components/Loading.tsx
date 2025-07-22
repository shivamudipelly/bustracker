import { Bus } from 'lucide-react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loading = ({ message = 'Loading...', size = 'md' }: LoadingProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Bus className={`${sizeClasses[size]} text-primary animate-pulse mb-4`} />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
};
