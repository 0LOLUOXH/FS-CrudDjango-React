import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Componente "bomba" que lanza un error al renderizarse
function Bomb() {
  throw new Error('💥 Error simulado para probar el ErrorBoundary');
}

// Silenciar los console.error que React emite en cada captura de error
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

describe('CP-MAN-04: ErrorBoundary captura errores de React', () => {
  
  test('Muestra un fallback cuando un componente hijo lanza un error', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    // Verificar que se muestra el mensaje de error en lugar de la app vacía
    expect(screen.getByText(/Algo salió mal/i)).toBeInTheDocument();
    expect(screen.getByText(/Error simulado para probar el ErrorBoundary/i)).toBeInTheDocument();
    
    // Verificar que existe el botón para volver al inicio
    expect(screen.getByText(/Volver al Inicio/i)).toBeInTheDocument();
    
    console.log('\n✅ CP-MAN-04: ErrorBoundary capturó el error y mostró el fallback correctamente');
  });

  test('Renderiza los hijos correctamente cuando NO hay errores', () => {
    render(
      <ErrorBoundary>
        <div>Contenido seguro</div>
      </ErrorBoundary>
    );

    // No debe mostrar el fallback cuando todo funciona
    expect(screen.getByText('Contenido seguro')).toBeInTheDocument();
    expect(screen.queryByText(/Algo salió mal/i)).not.toBeInTheDocument();
    
    console.log('✅ CP-MAN-04: ErrorBoundary renderiza hijos sin errores correctamente');
  });

  test('El fallback incluye un botón para recuperarse', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    const boton = screen.getByText(/Volver al Inicio/i);
    expect(boton).toBeInTheDocument();
    expect(boton.tagName).toBe('BUTTON');
    
    console.log('✅ CP-MAN-04: El botón de recuperación está presente en el fallback');
  });
});