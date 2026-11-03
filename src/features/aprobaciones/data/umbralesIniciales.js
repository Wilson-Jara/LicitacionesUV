/**
 * Configuración inicial de umbrales de aprobación por unidad (US-10, CR-302).
 *
 * Es un dato, no lógica: representa el punto de partida editable del panel de
 * configuración. Los valores vigentes se persisten en `localStorage` (CA2/REF-14)
 * y se ajustan desde la interfaz sin tocar código.
 *
 * El rango de cada umbral es `[montoMinimo, montoMaximo)`: el mínimo es
 * inclusivo, el máximo es exclusivo y `null` en el máximo significa «sin tope».
 */
export const umbralesIniciales = [
  {
    id: 'unidad-1',
    nombre: 'Facultad de Ingeniería',
    tipo: 'facultad',
    umbrales: [
      {
        id: 'umbral-1',
        idUnidad: 'unidad-1',
        montoMinimo: 0,
        montoMaximo: 10000001,
        nivelAprobador: 'jefe_unidad',
      },
      {
        id: 'umbral-2',
        idUnidad: 'unidad-1',
        montoMinimo: 10000001,
        montoMaximo: 50000001,
        nivelAprobador: 'direccion_economica',
      },
      {
        id: 'umbral-3',
        idUnidad: 'unidad-1',
        montoMinimo: 50000001,
        montoMaximo: null,
        nivelAprobador: 'rectoria',
      },
    ],
  },
  {
    id: 'unidad-2',
    nombre: 'Facultad de Ciencias',
    tipo: 'facultad',
    umbrales: [
      {
        id: 'umbral-4',
        idUnidad: 'unidad-2',
        montoMinimo: 0,
        montoMaximo: 5000001,
        nivelAprobador: 'jefe_unidad',
      },
      {
        id: 'umbral-5',
        idUnidad: 'unidad-2',
        montoMinimo: 5000001,
        montoMaximo: 30000001,
        nivelAprobador: 'direccion_economica',
      },
      {
        id: 'umbral-6',
        idUnidad: 'unidad-2',
        montoMinimo: 30000001,
        montoMaximo: null,
        nivelAprobador: 'rectoria',
      },
    ],
  },
  {
    id: 'unidad-3',
    nombre: 'Rectoría',
    tipo: 'rectoria',
    umbrales: [
      {
        id: 'umbral-7',
        idUnidad: 'unidad-3',
        montoMinimo: 0,
        montoMaximo: 20000001,
        nivelAprobador: 'jefe_unidad',
      },
      {
        id: 'umbral-8',
        idUnidad: 'unidad-3',
        montoMinimo: 20000001,
        montoMaximo: 80000001,
        nivelAprobador: 'direccion_economica',
      },
      {
        id: 'umbral-9',
        idUnidad: 'unidad-3',
        montoMinimo: 80000001,
        montoMaximo: null,
        nivelAprobador: 'rectoria',
      },
    ],
  },
]
