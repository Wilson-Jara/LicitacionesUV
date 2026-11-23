# Contraste de la implementación en React

Mediciones de los colores definidos en `src/index.css` para la paleta **Índigo-Morado UV y Arena** (#145), calculadas con luminancia relativa sRGB según WCAG 2.2. Cada par muestra el color de primer plano y el fondo.

| Par de tokens                            | Claro                            | Oscuro                           | Mínimo |
| ---------------------------------------- | -------------------------------- | -------------------------------- | ------ |
| `--text-h` / `--bg`                      | `#191627` / `#f6f6fa` · 16,43:1  | `#f2effa` / `#110f1b` · 16,70:1  | 4,5:1  |
| `--text-h` / `--card-bg`                 | `#191627` / `#ffffff` · 17,72:1  | `#f2effa` / `#1a1728` · 15,46:1  | 4,5:1  |
| `--text` / `--bg`                        | `#47425d` / `#f6f6fa` · 8,83:1   | `#c6c0dc` / `#110f1b` · 10,81:1  | 4,5:1  |
| `--text` / `--card-bg`                   | `#47425d` / `#ffffff` · 9,52:1   | `#c6c0dc` / `#1a1728` · 10,00:1  | 4,5:1  |
| `--primary` / `--bg`                     | `#4e2a84` / `#f6f6fa` · 9,80:1   | `#cbb4ff` / `#110f1b` · 10,39:1  | 4,5:1  |
| `--primary` / `--card-bg`                | `#4e2a84` / `#ffffff` · 10,56:1  | `#cbb4ff` / `#1a1728` · 9,62:1   | 4,5:1  |
| `--primary` / `--hero`                   | `#4e2a84` / `#eeebf7` · 8,98:1   | `#cbb4ff` / `#211c34` · 8,99:1   | 4,5:1  |
| `--primary` / `--accent-bg`              | `#4e2a84` / `#e2dbf5` · 7,89:1   | `#cbb4ff` / `#2c2445` · 7,96:1   | 4,5:1  |
| `--primary-contrast` / `--primary`       | `#ffffff` / `#4e2a84` · 10,56:1  | `#1c0f33` / `#cbb4ff` · 9,88:1   | 4,5:1  |
| `--primary-contrast` / `--primary-hover` | `#ffffff` / `#3b1d69` · 13,41:1  | `#1c0f33` / `#dfd0ff` · 12,53:1  | 4,5:1  |
| `--hero-ink` / `--hero`                  | `#1c1330` / `#eeebf7` · 15,07:1  | `#f5f1fc` / `#211c34` · 14,74:1  | 4,5:1  |
| `--hero-ink` / `--accent-bg`             | `#1c1330` / `#e2dbf5` · 13,23:1  | `#f5f1fc` / `#2c2445` · 13,06:1  | 4,5:1  |
| `--hero-muted` / `--hero`                | `#43375c` / `#eeebf7` · 9,21:1   | `#d0c8e6` / `#211c34` · 10,22:1  | 4,5:1  |
| `--hero-muted` / `--accent-bg`           | `#43375c` / `#e2dbf5` · 8,09:1   | `#d0c8e6` / `#2c2445` · 9,05:1   | 4,5:1  |
| `--highlight-ink` / `--highlight`        | `#261e12` / `#f6dc7a` · 12,09:1  | `#221b10` / `#f0d470` · 11,65:1  | 4,5:1  |
| `--success-text` / `--success-bg`        | `#174f30` / `#dff1e5` · 8,12:1   | `#bcecc9` / `#193a2b` · 9,50:1   | 4,5:1  |
| `--success-text` / `--bg`                | `#174f30` / `#f6f6fa` · 8,87:1   | `#bcecc9` / `#110f1b` · 14,42:1  | 4,5:1  |
| `--success-text` / `--card-bg`           | `#174f30` / `#ffffff` · 9,56:1   | `#bcecc9` / `#1a1728` · 13,35:1  | 4,5:1  |
| `--closed-text` / `--closed-bg`          | `#454059` / `#eceaf2` · 8,27:1   | `#e0dbed` / `#2e2940` · 10,30:1  | 4,5:1  |
| `--danger` / `--danger-bg`               | `#911c24` / `#fde8e8` · 7,47:1   | `#ffc4c8` / `#441f25` · 9,52:1   | 4,5:1  |
| `--danger` / `--card-bg`                 | `#911c24` / `#ffffff` · 8,77:1   | `#ffc4c8` / `#1a1728` · 11,68:1  | 4,5:1  |
| `--selection-ink` / `--selection`        | `#1c1330` / `#dcd2f7` · 12,32:1  | `#1c0f33` / `#c5b0f5` · 9,35:1   | 4,5:1  |
| `--border-strong` / `--card-bg`          | `#5f5878` / `#ffffff` · 6,66:1   | `#9189b0` / `#1a1728` · 5,35:1   | 3:1    |
| `--border-strong` / `--hero`             | `#5f5878` / `#eeebf7` · 5,66:1   | `#9189b0` / `#211c34` · 5,01:1   | 3:1    |
| `--border-strong` / `--bg`               | `#5f5878` / `#f6f6fa` · 6,18:1   | `#9189b0` / `#110f1b` · 5,78:1   | 3:1    |
| `--border-focus` / `--card-bg`           | `#4e2a84` / `#ffffff` · 10,56:1  | `#d6c4ff` / `#1a1728` · 11,03:1  | 3:1    |
| `--border-focus` / `--bg`                | `#4e2a84` / `#f6f6fa` · 9,80:1   | `#d6c4ff` / `#110f1b` · 11,91:1  | 3:1    |
| `--hero-focus` / `--hero`                | `#432175` / `#eeebf7` · 10,43:1  | `#e2d4ff` / `#211c34` · 11,79:1  | 3:1    |

Todos los pares de texto, enlaces, estados y selección alcanzan **WCAG 2.2 AAA (`≥ 7,47:1`)** en ambos temas; todos los bordes de controles (`≥ 5,01:1`) y anillos de foco (`≥ 9,80:1`) superan con holgura el mínimo **`3:1`**. La escala tipográfica usa unidades relativas con referencia mínima de **`1rem` (16 px)**.
