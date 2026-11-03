# Guía de depuración en vivo — Vicente García

> Guía personal para la sesión de depuración del Hito 2.
> La evidencia oficial del equipo está en `docs/depuracion.md`; esta guía es el paso a paso para ejecutar esa misma depuración si te toca.

**Caso:** la búsqueda por palabra clave también miraba la institución, aunque la historia #43 exige buscar **solo en el título**.

**Método:** reproducir → aislar → hipótesis → comprobar → corregir → verificar.

---

## 0. Antes de empezar (2 min)

- [ ] VS Code abierto en `C:\Users\casal\OneDrive\Escritorio\LicitacionesUV`.
- [ ] Terminal en PowerShell.
- [ ] Verifica Node:

```powershell
node -v
```

Debe imprimir `v24.22.0` o similar. Si dice **"no se reconoce"**, ejecuta esto en la misma terminal:

```powershell
$env:Path = "C:\Users\casal\AppData\Local\Temp\opencode\node-portable\node-v24.22.0-win-x64;$env:Path"
```

> Esa ruta es de este PC. Si ya no existe, instala Node LTS o usa la ruta que te indiquen.

- [ ] Ten abierto `docs/depuracion.md` al lado del código (`Ctrl+\` para dividir el editor).

---

## 1. Preparar la rama y el defecto (5 min)

> Esto no aparece en `docs/depuracion.md` porque el documento se escribió **después** de la depuración. Es solo para tener el bug delante.

### 1.1 Crear una rama temporal

```powershell
git status
git fetch origin
git checkout -b debug/practica origin/develop
```

Debe decir `Switched to a new branch 'debug/practica'`.

> Esta rama **no se commitea, no se sube y no se fusiona**. Al final se borra.

### 1.2 Meter el defecto

Abre `backend/src/data/licitaciones.repository.js` y deja la función así:

```js
function matchesKeyword(licitacion, keyword) {
  const k = keyword.toLowerCase()
  return (
    licitacion.title.toLowerCase().includes(k) || licitacion.institution.toLowerCase().includes(k)
  )
}
```

Guarda con **Ctrl+S**.

> El `||` es el defecto: significa "o". Hace que la licitación pase si la palabra está en el título **o** en la institución.

---

## 2. Reproducir (documento, sección 2)

Abre la **JavaScript Debug Terminal**: `Ctrl+Shift+P` → `JavaScript Debug Terminal`.

> Tiene que ser esa terminal. Si levantas el servidor en una terminal normal, el breakpoint **no** se activa.

Ejecuta:

```powershell
cd backend
node src/server.js
```

Espera estas dos líneas:

```text
DATABASE_URL no definida: la API usa los datos mock en memoria
API LicitacionesUV escuchando en http://localhost:3000
```

Abre en el navegador:

```text
http://localhost:3000/api/licitaciones?keyword=universidad
```

| Momento             | Resultado                          |
| ------------------- | ---------------------------------- |
| **Esperado**        | `[]` (la regla dice "solo título") |
| **Observado (bug)** | Un arreglo con `licitacion-001`    |

`licitacion-001` se llama **"Servicio de mantenimiento de infraestructura"** y su institución es **"Universidad de Valparaíso"**. La palabra está en la institución, no en el título.

> Di en voz alta: **"Esperaba cero resultados y obtuve uno."** Eso es reproducir.

### Opcional: ver la prueba de regresión fallar

Si te preguntan cómo lo detecta la suite, con el defecto puesto corre en otra terminal:

```powershell
node --test
```

Debe fallar, entre otras, la prueba:

```text
busca la palabra clave solo en el título, no en la institución
```

> El número de test puede variar; lo importante es el **nombre** de la prueba.

---

## 3. Aislar (documento, sección 3)

Sigue el camino del dato y descarta sospechosos:

| Punto   | Archivo                                                            | Qué se comprueba                             | Estado                |
| ------- | ------------------------------------------------------------------ | -------------------------------------------- | --------------------- |
| Entrada | `backend/src/routes/licitaciones.routes.js:7`                      | `keyword` llega con `.trim()`                | ✅ Bien               |
| Filtro  | `backend/src/data/licitaciones.repository.js` → `list()`           | Llama a `matchesKeyword` por cada licitación | ✅ Bien               |
| Regla   | `backend/src/data/licitaciones.repository.js` → `matchesKeyword()` | Compara título **o** institución             | ❌ Aquí está el error |

**Conclusión:** el único lugar donde entra la institución es `matchesKeyword`.

### Caso mínimo (si quieres explicarlo sin servidor)

> `matchesKeyword({ title: "Servicio de mantenimiento de infraestructura", institution: "Universidad de Valparaíso" }, "universidad")` debería devolver `false` y devuelve `true`.

---

## 4. Hipótesis (documento, sección 4)

Dila en voz alta:

> **"La condición de `matchesKeyword` compara la palabra también con `institution`, no solo con `title`. Para comprobarlo, voy a evaluar por separado las dos partes de la condición."**

Una hipótesis siempre dice **qué crees** y **cómo lo vas a comprobar**.

---

## 5. Breakpoint y Watch (documento, sección 5)

### 5.1 Poner el breakpoint

En `backend/src/data/licitaciones.repository.js`, pon el punto rojo en esta línea:

```js
    licitacion.title.toLowerCase().includes(k) ||
```

Es la **línea 14** si no has movido nada.

> Si haces clic en la línea 13 (`return (`), VS Code lo mueve a la 14. **Está bien**: la 13 no es una instrucción completa. Déjalo en la 14.

### 5.2 Opcional: breakpoint condicional (evita pausas repetidas)

Clic derecho sobre el punto rojo → **Add Conditional Breakpoint** → escribe:

```text
licitacion.id === 'licitacion-001'
```

Así se pausa **una sola vez**, no seis.

### 5.3 Recargar

Vuelve al navegador y recarga:

```text
http://localhost:3000/api/licitaciones?keyword=universidad
```

La página queda **girando**. Es normal: la petición está esperando al depurador.

### 5.4 Ir a VS Code

Haz clic en la ventana de VS Code. Debes ver:

- La línea **14 en amarillo**.
- La barra de depuración activa.
- La barra inferior **naranja**.

### 5.5 Revisar Variables

En el panel **Variables** confirma:

| Variable        | Valor esperado   |
| --------------- | ---------------- |
| `licitacion.id` | `licitacion-001` |
| `keyword`       | `"universidad"`  |
| `k`             | `"universidad"`  |

### 5.6 Agregar las dos expresiones en Watch

En el panel **Watch**, botón `+`, agrega:

```text
licitacion.title.toLowerCase().includes(k)
licitacion.institution.toLowerCase().includes(k)
```

Resultado esperado:

```text
false
true
```

**Esa es la prueba de la hipótesis:** el título no coincide, la institución sí, y el `||` hace que la licitación pase el filtro.

> Si el Watch dice **"not available"**, haz clic en el frame `matchesKeyword` del **Call Stack** y vuelve a mirar.

### 5.7 Mirar el Call Stack

En el panel **Call Stack** debe estar la cadena:

```text
matchesKeyword   ← la función que estás depurando
<anonymous>      ← la flecha (l) => matchesKeyword(...) del filter
Object.list      ← quien pidió el filtrado
```

Eso se lee: **"`matchesKeyword` fue llamada por el filtro, que fue llamado por `list`."**

### 5.8 Soltar la petición

1. **Quita el breakpoint** (clic en el punto rojo).
2. Haz clic en **VS Code** y aprieta **F5** (o el botón verde ▶ de la barra de depuración).
3. Si se vuelve a pausar, F5 otra vez.
4. El navegador debe terminar y mostrar el JSON.

> Quitar el breakpoint **no** reanuda la ejecución: solo evita que se vuelva a pausar. El programa sigue detenido hasta que aprietes **Continue**.

---

## 6. Corregir (documento, sección 6)

1. En la terminal, detén el servidor con **Ctrl+C**.
2. Vuelve a la raíz y restaura el archivo:

```powershell
cd ..
git restore backend/src/data/licitaciones.repository.js
```

3. Abre el archivo y confirma que quedó así:

```js
function matchesKeyword(licitacion, keyword) {
  return licitacion.title.toLowerCase().includes(keyword.toLowerCase())
}
```

4. Levanta el servidor otra vez:

```powershell
cd backend
node src/server.js
```

> Hay que reiniciar porque Node cargó el código defectuoso al arrancar.

---

## 7. Verificar (documento, sección 7)

Prueba las 3 URLs:

| URL                                                            | Esperado         |
| -------------------------------------------------------------- | ---------------- |
| `http://localhost:3000/api/licitaciones?keyword=universidad`   | `[]`             |
| `http://localhost:3000/api/licitaciones?keyword=mantenimiento` | `licitacion-001` |
| `http://localhost:3000/api/licitaciones?keyword=UNIVERSIDAD`   | `[]`             |

Luego detén el servidor con **Ctrl+C**, vuelve a la raíz y corre la suite:

```powershell
cd ..
node --test
```

Debe terminar con:

```text
ℹ tests 124
ℹ pass 124
ℹ fail 0
```

> `node --test` es equivalente a `npm run test`. Se usa así para evitar el problema de PowerShell con `npm.ps1`.

---

## 8. Cerrar la práctica

```powershell
git checkout feat/95-panel-estadisticas
git branch -D debug/practica
```

Verifica que no queden cambios:

```powershell
git status
```

Debe decir `nothing to commit, working tree clean`.

---

## 9. Si algo falla

| Síntoma                                  | Causa probable                                | Solución                                                               |
| ---------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------- |
| `node` no se reconoce                    | Node no está en el PATH                       | Ejecuta la línea de `$env:Path` de la sección 0                        |
| El breakpoint salta de la 13 a la 14     | La 13 es solo `return (`                      | Déjalo en la 14; es correcto                                           |
| El breakpoint no se activa               | El servidor se levantó en una terminal normal | Detén con Ctrl+C y levántalo en la **JavaScript Debug Terminal**       |
| El Watch dice "not available"            | El frame seleccionado no es `matchesKeyword`  | Haz clic en `matchesKeyword` en el Call Stack                          |
| La URL se queda girando                  | El depurador está pausado                     | Ve a VS Code y aprieta **F5** o el botón ▶                             |
| F5 recarga la página en vez de continuar | El foco está en el navegador                  | Haz clic en VS Code y vuelve a apretar F5                              |
| Quitas el breakpoint y sigue amarillo    | Quitar el breakpoint no reanuda               | Aprieta **F5** o el botón ▶                                            |
| Se pausa muchas veces                    | El breakpoint se activa por cada licitación   | Usa un breakpoint condicional o quítalo después de inspeccionar la 001 |
| `EADDRINUSE`                             | Ya hay un servidor en el puerto 3000          | Detén el otro proceso con Ctrl+C o cambia el puerto                    |

---

## 10. Frases para explicar

- **Reproducir:** _"Esperaba cero resultados y obtuve uno: la licitación 001, porque 'universidad' está en la institución y no en el título."_
- **Aislar:** _"Seguí el dato desde la ruta hasta `matchesKeyword`; la ruta limpia bien y el repositorio solo filtra. El error está en la condición."_
- **Hipótesis:** _"Creo que la condición compara también con `institution`."_
- **Comprobar:** _"Con el breakpoint y el Watch vi que el título daba `false` y la institución daba `true`; con el `||`, el resultado era `true`."_
- **Corregir y verificar:** _"Dejé solo la comparación con el título y verifiqué con tres URLs y con la suite completa."_
- **Cierre:** _"El caso queda protegido por dos pruebas de regresión: si alguien vuelve a buscar en la institución, fallan y el CI queda en rojo."_

### Lo que no debes decir

- ❌ _"Yo corregí el bug."_ → Lo corrigió el equipo: **Reinald-Code** en el frontend (PR #71) y **lazo1838k** en la API (PR #88).
- ✅ _"El equipo lo corrigió; yo lo reproduje y lo depuré para la evidencia."_
- ❌ Números de línea memorizados: cambian al editar. Di el **nombre de la función** o de la prueba.

---

## 11. Datos del caso

| Dato                | Valor                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| Historia            | #43 Buscar licitaciones por palabra clave                                                               |
| Regla               | CA1: buscar solo en el título                                                                           |
| Bug                 | `matchesKeyword` comparaba también `institution`                                                        |
| Corrección frontend | commit `9b41879`, PR #71                                                                                |
| Corrección API      | commit `01e02d0`, PR #88                                                                                |
| Archivo del defecto | `backend/src/data/licitaciones.repository.js`                                                           |
| Prueba API          | `backend/tests/licitaciones.test.js` → "busca la palabra clave solo en el título, no en la institución" |
| Prueba frontend     | `tests/licitacionFilters.test.js` → "busca la palabra clave únicamente en el título"                    |
| Evidencia oficial   | `docs/depuracion.md`                                                                                    |

---

## 12. Si preguntan por cobertura (30 segundos)

> _"Usamos la cobertura integrada de Node, sin dependencias extra. `npm run test:coverage` exige 70% de líneas, 70% de funciones y 60% de ramas; `test:coverage:critico` exige 80/80/70 en `licitacionUtils.js`, el módulo crítico, porque decide si una licitación está cerrada y cómo se muestran montos y fechas. Ese módulo pasó de 78/33/60 a 100/100/100. Las pruebas de regresión del bug de búsqueda están en `tests/licitacionFilters.test.js` y `backend/tests/licitaciones.test.js`."_

Si preguntan **por qué no se cubren los `.jsx`**:

> _"Porque Node no ejecuta JSX ni tiene DOM. La lógica de negocio está extraída a funciones puras que sí se prueban; la interfaz se verifica con el build y la demo."_

Más detalle: `docs/cobertura.md`.
