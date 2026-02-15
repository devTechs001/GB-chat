import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Conditionally render ReactQueryDevtools only in development
const AppWithDevtools = () => (
  <>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          style: {
            background: '#10b981',
          },
        },
        error: {
          style: {
            background: '#ef4444',
          },
        },
      }}
    />
    {process.env.NODE_ENV === 'development' && (
      <React.Suspense fallback={null}>
        <DevtoolsWrapper />
      </React.Suspense>
    )}
  </>
);

const DevtoolsWrapper = () => {
  const [devtools, setDevtools] = React.useState(null);

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('@tanstack/react-query-devtools').then((module) => {
        setDevtools(module.ReactQueryDevtools);
      });
    }
  }, []);

  if (process.env.NODE_ENV !== 'development' || !devtools) {
    return null;
  }

  return React.createElement(devtools, { initialIsOpen: false });
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppWithDevtools />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)