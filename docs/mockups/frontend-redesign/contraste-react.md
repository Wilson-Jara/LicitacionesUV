# Contraste de la implementación en React

Mediciones de los colores computados de la aplicación compilada, realizadas con luminancia relativa sRGB en Chrome 157.0.8103.79. Cada par muestra el color de primer plano y el fondo.

| Par de tokens | Claro | Oscuro | Mínimo |
| --- | --- | --- | --- |
| `--text-h` / `--bg` | `#252127` / `#faf9f6` · 15,05:1 | `#f1eaf3` / `#1b171f` · 14,97:1 | 4,5:1 |
| `--text-h` / `--card-bg` | `#252127` / `#fffefa` · 15,70:1 | `#f1eaf3` / `#25202a` · 13,50:1 | 4,5:1 |
| `--text` / `--bg` | `#615964` / `#faf9f6` · 6,39:1 | `#c2b6c6` / `#1b171f` · 9,08:1 | 4,5:1 |
| `--text` / `--card-bg` | `#615964` / `#fffefa` · 6,67:1 | `#c2b6c6` / `#25202a` · 8,19:1 | 4,5:1 |
| `--primary` / `--bg` | `#603489` / `#faf9f6` · 8,49:1 | `#dbb5fb` / `#1b171f` · 10,11:1 | 4,5:1 |
| `--primary` / `--card-bg` | `#603489` / `#fffefa` · 8,86:1 | `#dbb5fb` / `#25202a` · 9,11:1 | 4,5:1 |
| `--primary` / `--hero` | `#603489` / `#eee7f3` · 7,39:1 | `#dbb5fb` / `#32243e` · 8,24:1 | 4,5:1 |
| `--primary` / `--accent-bg` | `#603489` / `#e6d9ee` · 6,61:1 | `#dbb5fb` / `#402e4d` · 7,00:1 | 4,5:1 |
| `--primary-contrast` / `--primary` | `#fff` / `#603489` · 8,94:1 | `#281635` / `#dbb5fb` · 9,56:1 | 4,5:1 |
| `--primary-contrast` / `--primary-hover` | `#fff` / `#4b246f` · 11,79:1 | `#281635` / `#edcffd` · 11,89:1 | 4,5:1 |
| `--hero-ink` / `--hero` | `#2e1c3b` / `#eee7f3` · 12,90:1 | `#f5eaf8` / `#32243e` · 12,35:1 | 4,5:1 |
| `--hero-ink` / `--accent-bg` | `#2e1c3b` / `#e6d9ee` · 11,54:1 | `#f5eaf8` / `#402e4d` · 10,49:1 | 4,5:1 |
| `--hero-muted` / `--hero` | `#564361` / `#eee7f3` · 7,32:1 | `#dac9e0` / `#32243e` · 9,20:1 | 4,5:1 |
| `--hero-muted` / `--accent-bg` | `#564361` / `#e6d9ee` · 6,55:1 | `#dac9e0` / `#402e4d` · 7,82:1 | 4,5:1 |
| `--highlight-ink` / `--highlight` | `#3b292e` / `#f9e481` · 10,66:1 | `#3b292e` / `#f3d97f` · 9,75:1 | 4,5:1 |
| `--success-text` / `--success-bg` | `#245534` / `#e1efde` · 7,26:1 | `#bde7c3` / `#233c30` · 8,74:1 | 4,5:1 |
| `--success-text` / `--bg` | `#245534` / `#faf9f6` · 8,23:1 | `#bde7c3` / `#1b171f` · 12,94:1 | 4,5:1 |
| `--success-text` / `--card-bg` | `#245534` / `#fffefa` · 8,58:1 | `#bde7c3` / `#25202a` · 11,66:1 | 4,5:1 |
| `--closed-text` / `--closed-bg` | `#544959` / `#ece7ed` · 6,96:1 | `#e1d4e6` / `#3d3344` · 8,41:1 | 4,5:1 |
| `--danger` / `--danger-bg` | `#9b272f` / `#fce9e7` · 6,59:1 | `#ffc2c6` / `#41252c` · 9,03:1 | 4,5:1 |
| `--danger` / `--card-bg` | `#9b272f` / `#fffefa` · 7,64:1 | `#ffc2c6` / `#25202a` · 10,45:1 | 4,5:1 |
| `--border-strong` / `--card-bg` | `#807383` / `#fffefa` · 4,43:1 | `#928399` / `#25202a` · 4,50:1 | 3:1 |
| `--border-strong` / `--hero` | `#807383` / `#eee7f3` · 3,70:1 | `#928399` / `#32243e` · 4,07:1 | 3:1 |
| `--border-strong` / `--bg` | `#807383` / `#faf9f6` · 4,25:1 | `#928399` / `#1b171f` · 4,99:1 | 3:1 |
| `--border-focus` / `--card-bg` | `#63308c` / `#fffefa` · 8,92:1 | `#e1bafa` / `#25202a` · 9,56:1 | 3:1 |
| `--border-focus` / `--bg` | `#63308c` / `#faf9f6` · 8,55:1 | `#e1bafa` / `#1b171f` · 10,60:1 | 3:1 |
| `--hero-focus` / `--hero` | `#552577` / `#eee7f3` · 9,05:1 | `#edcdfd` / `#32243e` · 10,12:1 | 3:1 |

axe dejó tres elementos del modal de escritorio por revisar en cada tema debido a la superposición con el fondo. Para esos elementos, el aviso y los dos textos del panel de contexto, la inspección de sus superficies y colores corresponde a los pares `--hero-ink` y `--hero-muted` sobre `--hero` de esta tabla.
