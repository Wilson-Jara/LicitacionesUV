# Avisos de terceros · Frontend LicitacionesUV

Este proyecto se distribuye bajo la licencia MIT (ver [LICENSE](LICENSE)). Incluye o usa en ejecución los paquetes de terceros de esta lista, cada uno bajo su propia licencia. Las de desarrollo (ESLint, Prettier, Vite y sus complementos) no se distribuyen y no se listan.

Paquetes directos: React, React Router, jsPDF, Motion, lucide-react y prop-types. jsPDF arrastra html2canvas, DOMPurify, canvg, pako y core-js, que quedan dentro del bundle del worker de PDF.

Lista generada el 24-11-2026 desde `package-lock.json` (dependencias que no son de desarrollo). Para regenerarla tras cambiar dependencias, revisar el campo `license` de cada paquete en `package-lock.json`.

| Paquete                                                                    | Versión | Licencia                           | Tipo       |
| -------------------------------------------------------------------------- | ------- | ---------------------------------- | ---------- |
| [@babel/runtime](https://www.npmjs.com/package/@babel/runtime)             | 7.29.10 | MIT                                | transitiva |
| [@types/pako](https://www.npmjs.com/package/@types/pako)                   | 2.0.4   | MIT                                | transitiva |
| [@types/raf](https://www.npmjs.com/package/@types/raf)                     | 3.4.3   | MIT                                | transitiva |
| [@types/trusted-types](https://www.npmjs.com/package/@types/trusted-types) | 2.0.7   | MIT                                | transitiva |
| [base64-arraybuffer](https://www.npmjs.com/package/base64-arraybuffer)     | 1.0.2   | MIT                                | transitiva |
| [canvg](https://www.npmjs.com/package/canvg)                               | 3.0.11  | MIT                                | transitiva |
| [cookie](https://www.npmjs.com/package/cookie)                             | 1.1.1   | MIT                                | transitiva |
| [core-js](https://www.npmjs.com/package/core-js)                           | 3.50.0  | MIT                                | transitiva |
| [css-line-break](https://www.npmjs.com/package/css-line-break)             | 2.1.0   | MIT                                | transitiva |
| [dompurify](https://www.npmjs.com/package/dompurify)                       | 3.4.16  | (MPL-2.0 OR Apache-2.0)            | transitiva |
| [fast-png](https://www.npmjs.com/package/fast-png)                         | 6.4.0   | MIT                                | transitiva |
| [fflate](https://www.npmjs.com/package/fflate)                             | 0.8.3   | MIT                                | transitiva |
| [framer-motion](https://www.npmjs.com/package/framer-motion)               | 14.14.0 | MIT                                | transitiva |
| [html2canvas](https://www.npmjs.com/package/html2canvas)                   | 1.4.1   | MIT                                | transitiva |
| [iobuffer](https://www.npmjs.com/package/iobuffer)                         | 5.4.0   | MIT                                | transitiva |
| [js-tokens](https://www.npmjs.com/package/js-tokens)                       | 4.0.0   | MIT                                | transitiva |
| [jspdf](https://www.npmjs.com/package/jspdf)                               | 4.2.1   | MIT                                | directa    |
| [loose-envify](https://www.npmjs.com/package/loose-envify)                 | 1.4.0   | MIT                                | transitiva |
| [lucide-react](https://www.npmjs.com/package/lucide-react)                 | 1.77.0  | ISC                                | directa    |
| [motion](https://www.npmjs.com/package/motion)                             | 14.14.0 | MIT                                | directa    |
| [motion-dom](https://www.npmjs.com/package/motion-dom)                     | 14.14.0 | MIT                                | transitiva |
| [motion-utils](https://www.npmjs.com/package/motion-utils)                 | 14.7.0  | MIT                                | transitiva |
| [object-assign](https://www.npmjs.com/package/object-assign)               | 4.1.1   | MIT                                | transitiva |
| [pako](https://www.npmjs.com/package/pako)                                 | 2.2.0   | (MIT AND Zlib)                     | transitiva |
| [performance-now](https://www.npmjs.com/package/performance-now)           | 2.1.0   | MIT                                | transitiva |
| [prop-types](https://www.npmjs.com/package/prop-types)                     | 15.8.1  | MIT                                | directa    |
| [raf](https://www.npmjs.com/package/raf)                                   | 3.4.1   | MIT                                | transitiva |
| [react](https://www.npmjs.com/package/react)                               | 19.2.8  | MIT                                | directa    |
| [react-dom](https://www.npmjs.com/package/react-dom)                       | 19.2.8  | MIT                                | directa    |
| [react-is](https://www.npmjs.com/package/react-is)                         | 16.13.1 | MIT                                | transitiva |
| [react-router](https://www.npmjs.com/package/react-router)                 | 7.18.2  | MIT                                | transitiva |
| [react-router-dom](https://www.npmjs.com/package/react-router-dom)         | 7.18.2  | MIT                                | directa    |
| [regenerator-runtime](https://www.npmjs.com/package/regenerator-runtime)   | 0.13.11 | MIT                                | transitiva |
| [rgbcolor](https://www.npmjs.com/package/rgbcolor)                         | 1.0.1   | MIT OR SEE LICENSE IN FEEL-FREE.md | transitiva |
| [scheduler](https://www.npmjs.com/package/scheduler)                       | 0.27.0  | MIT                                | transitiva |
| [set-cookie-parser](https://www.npmjs.com/package/set-cookie-parser)       | 2.7.2   | MIT                                | transitiva |
| [stackblur-canvas](https://www.npmjs.com/package/stackblur-canvas)         | 2.7.0   | MIT                                | transitiva |
| [svg-pathdata](https://www.npmjs.com/package/svg-pathdata)                 | 6.0.3   | MIT                                | transitiva |
| [text-segmentation](https://www.npmjs.com/package/text-segmentation)       | 1.0.3   | MIT                                | transitiva |
| [tslib](https://www.npmjs.com/package/tslib)                               | 2.9.1   | 0BSD                               | transitiva |
| [utrie](https://www.npmjs.com/package/utrie)                               | 1.0.2   | MIT                                | transitiva |

## Obligaciones

- **MIT, ISC y 0BSD:** conservar el aviso de copyright y de licencia en las copias. El build de Vite mantiene los comentarios `@license` (por ejemplo, el de jsPDF en `dist/assets/exportLicitacionPdf.worker-*.js`).
- **DOMPurify** (MPL-2.0 o Apache-2.0, a elección): se usa sin modificar bajo Apache-2.0; si se modificara su código, habría que publicar esos cambios.
- **pako** (MIT y Zlib): no tergiversar el origen del software ni presentar versiones modificadas como el original.
- **rgbcolor** (MIT o el texto de su `FEEL-FREE.md`): se usa bajo MIT.
