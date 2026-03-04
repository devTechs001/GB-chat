import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900 text-red-800 rounded">
          <p>Something went wrong.</p>
          <pre className="text-xs mt-2">{this.state.error?.message}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
