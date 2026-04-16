import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: 'red' }}>¡Algo salió mal en la aplicación!</h2>
          <p>La aplicación falló al intentar dibujar esta pantalla. Por favor, toma una captura de este error para corregirlo:</p>
          <pre style={{ background: '#f5f5f5', padding: '15px', overflowX: 'auto', borderRadius: '5px', marginTop: '10px' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button onClick={() => window.location.href = '/home'} style={{ marginTop: '20px', padding: '10px 15px', background: 'blue', color: 'white', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>
            Volver al Inicio
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
