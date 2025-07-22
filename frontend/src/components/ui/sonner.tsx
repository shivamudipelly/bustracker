import { useEffect, useState } from 'react';
import { Toaster as Sonner, toast, ToastT } from 'sonner';
import { X } from 'lucide-react';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const YouTubeToaster = ({ ...props }: ToasterProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Sonner
      className="youtube-toaster"
      position="bottom-left"
      visibleToasts={3}
      offset={16}
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-[#0f0f0f] text-white border border-[#303030] shadow-lg " +
            "rounded-lg px-4 py-3 pr-8 text-sm font-normal w-full max-w-xs " +
            "transition-all duration-300 ease-out " +
            "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] " +
            "data-[swipe=cancel]:translate-x-0 " +
            "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] " +
            "data-[state=open]:animate-in data-[state=open]:fade-in-90 " +
            "data-[state=open]:slide-in-from-left-full " +
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-80 " +
            "data-[state=closed]:slide-out-to-left-full",
          title: "font-normal text-sm flex items-center",
          description: "text-sm opacity-90",
          actionButton: "px-3 py-1 rounded text-xs font-medium bg-[#272727] hover:bg-[#3f3f3f]",
          cancelButton: "px-3 py-1 rounded text-xs font-medium bg-[#272727] hover:bg-[#3f3f3f]",
          closeButton:
            "absolute right-2 top-2 rounded-full p-1 text-white/50 hover:text-white " +
            "hover:bg-[#272727] transition-colors",
        },
        unstyled: false,
        duration: 5000,
      }}
      {...props}
    />
  );
};

// YouTube-style toast functions
const youtubeToast = {
  success: (message: string, options?: Partial<ToastT>) => {
    return toast.success(message, {
      icon: <span className="text-green-500">✓</span>,
      style: {
        background: '#0f0f0f',
        color: 'white',
        border: '1px solid #303030'
      },
      ...options,
    });
  },
  error: (message: string, options?: Partial<ToastT>) => {
    return toast.error(message, {
      icon: <span className="text-red-500">✕</span>,
      style: {
        background: '#0f0f0f',
        color: 'white',
        border: '1px solid #303030'
      },
      ...options,
    });
  },
  info: (message: string, options?: Partial<ToastT>) => {
    return toast(message, {
      icon: <span className="text-blue-500">i</span>,
      style: {
        background: '#0f0f0f',
        color: 'white',
        border: '1px solid #303030'
      },
      ...options,
    });
  },
  loading: (message: string, options?: Partial<ToastT>) => {
    return toast.loading(message, {
      icon: <span className="animate-spin">↻</span>,
      style: {
        background: '#0f0f0f',
        color: 'white',
        border: '1px solid #303030'
      },
      ...options,
    });
  },
  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },
  promise: <T,>(promise: Promise<T>, options: {
    loading: string | Partial<ToastT>;
    success: string | ((data: T) => string | Partial<ToastT>);
    error: string | ((error: any) => string | Partial<ToastT>);
  }) => {
    return toast.promise(promise, {
      loading: {
        ...(typeof options.loading === 'string' ? { message: options.loading } : options.loading),
        icon: <span className="animate-spin">↻</span>,
        style: {
          background: '#0f0f0f',
          color: 'white',
          border: '1px solid #303030'
        },
      },
      success: (data) => ({
        ...(typeof options.success === 'function' 
          ? options.success(data) 
          : { message: options.success }
        ),
        icon: <span className="text-green-500">✓</span>,
        style: {
          background: '#0f0f0f',
          color: 'white',
          border: '1px solid #303030'
        },
      }),
      error: (err) => ({
        ...(typeof options.error === 'function' 
          ? options.error(err) 
          : { message: options.error }
        ),
        icon: <span className="text-red-500">✕</span>,
        style: {
          background: '#0f0f0f',
          color: 'white',
          border: '1px solid #303030'
        },
      }),
    });
  },
};

export { YouTubeToaster as Toaster, youtubeToast as toast };