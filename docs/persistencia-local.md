# Persistencia local compartida · `persistenciaLocal.js`

> Intervención ISF224 asociada a #124 · Responsable: Vicente Saa (@Reinald-Code)

## Problema

El acceso seguro a `localStorage` estaba implementado por separado en cada consumidor:

| Regla                                                                                  | Dónde estaba repetida                                                 |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Obtener `window.localStorage` sin caerse si no hay `window` o el navegador lo bloquea  | `getStorage()` en `UmbralesProvider.jsx` y en `FavoritosProvider.jsx` |
| Leer JSON sin caerse si no hay almacenamiento, está bloqueado o el texto está corrupto | `readUmbralesStore` y `readFavoritosStore`                            |
| Escribir JSON sin caerse si no hay almacenamiento, está bloqueado o no queda cuota     | `writeUmbralesStore` y `writeFavoritosStore`                          |

Cambiar cualquiera de esas reglas (por ejemplo, registrar cuándo el navegador bloquea el acceso) obligaba a editar cuatro archivos y a mantenerlos iguales a mano.

## Indicadores antes y después

| Indicador                                          | Antes                                      | Después                                   |
| -------------------------------------------------- | ------------------------------------------ | ----------------------------------------- |
| Implementaciones de las reglas de acceso seguro    | 6 (2 de obtener, 2 de leer, 2 de escribir) | 3 (una por operación)                     |
| Archivos que hay que editar para cambiar una regla | 4                                          | 1 (`src/shared/lib/persistenciaLocal.js`) |

## Contrato

| Operación                             | Entrada                                                                         | Salida                                                                         | Errores o respaldo                                                                                                                                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `obtenerAlmacenamientoLocal()`        | —                                                                               | `Storage` o `null`                                                             | `null` si no hay `window` (Node, prerenderizado) o si leer `window.localStorage` lanza `SecurityError`. Nunca lanza.                                                                                              |
| `leerJson(storage, clave)`            | `storage`: objeto con `getItem` o `null`; `clave`: texto                        | `{ ok: true, valor }` con el JSON guardado tal cual, o `{ ok: false, motivo }` | `motivo` es `'no-disponible'` (sin almacenamiento o `getItem` lanzó), `'ausente'` (nada guardado o cadena vacía) o `'ilegible'` (no es JSON). No valida la forma del valor: eso lo hace quien llama. Nunca lanza. |
| `escribirJson(storage, clave, valor)` | `storage`: objeto con `setItem` o `null`; `clave`: texto; `valor`: serializable | `true` si se guardó, `false` si no                                             | `false` sin almacenamiento, si está bloqueado, sin cuota (`QuotaExceededError`) o si el valor no se puede serializar (por ejemplo, una referencia circular). Nunca lanza.                                         |

Consumidores reales (todos llaman a la misma implementación):

- `src/features/aprobaciones/data/umbralesStorage.js` → `leerJson` y `escribirJson`
- `src/features/favoritos/data/favoritosStorage.js` → `leerJson` y `escribirJson`
- `src/app/providers/UmbralesProvider.jsx` y `src/app/providers/FavoritosProvider.jsx` → `obtenerAlmacenamientoLocal`

Llamada real desde otro archivo (`umbralesStorage.js`):

```js
export function readUmbralesStore(storage) {
  const lectura = leerJson(storage, UMBRALES_STORAGE_KEY)
  return lectura.ok ? interpretarUmbrales(lectura.valor) : getUmbralesIniciales()
}
```

## Ejemplo ejecutable

Desde la raíz del repositorio:

```bash
node --input-type=module -e "import { escribirJson, leerJson } from './src/shared/lib/persistenciaLocal.js'; const m = new Map(); const s = { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) }; console.log(escribirJson(s, 'demo', { a: 1 }), leerJson(s, 'demo'), leerJson(s, 'otra'), leerJson(null, 'demo'))"
```

Resultado esperado:

```text
true { ok: true, valor: { a: 1 } } { ok: false, motivo: 'ausente' } { ok: false, motivo: 'no-disponible' }
```

## Cómo se comprobó que el comportamiento no cambió

1. **Antes de extraer**, se agregaron pruebas de caracterización (`tests/accesoLocalStorage.test.js`) que fijan, para umbrales y favoritos, los casos de almacenamiento disponible (con y sin datos), ausente, bloqueado y sin cuota. Pasaron sobre el código original.
2. **Después de extraer**, las mismas pruebas siguen pasando sin modificarlas: las claves (`licitacionesuv-umbrales`, `licitacionesuv-favoritos`), el formato JSON y los respaldos (configuración inicial, sin favoritos) se mantienen.
3. `tests/persistenciaLocal.test.js` prueba el contrato del módulo, incluido `obtenerAlmacenamientoLocal` con y sin `window` y con un acceso bloqueado.

Pendiente de verificación humana: otro integrante debe ejecutar el ejemplo de esta página y comprobar uno de los casos iniciales (por ejemplo, abrir `/configuracion/umbrales` en una ventana privada con el almacenamiento bloqueado y ver que la app carga con la configuración inicial).

## Deuda postergada

- `ThemeProvider.jsx` también accede a `localStorage`, pero guarda texto plano (no JSON) y comparte la clave con el script en línea de `index.html`, que aplica el tema antes de montar React. Migrarlo exigiría cambiar ese script y no aporta a #124. Responsable: Vicente Saa; se revisará al cerrar el Hito 3.
- La reconciliación de favoritos entre pestañas (el mismo problema de #124 en `FavoritosProvider`) queda coordinada con #46, que trabaja el manejo de favoritos.
