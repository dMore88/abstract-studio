# Nature Gen Art 🌿✨

Una aplicación web de **arte generativo** enfocada en la exploración visual de patrones inspirados en la naturaleza, con controles interactivos para modular parámetros en tiempo real y opciones de exportación en SVG y código.

> 🚀 **Demo en vivo (GitHub Pages)**:  
> **[https://dmore88.github.io/nature-gen-art/](https://dmore88.github.io/nature-gen-art/)**

---

## 🎯 Propósito del Proyecto

El objetivo principal es ofrecer un espacio de **exploración visual interactiva** donde las matemáticas y los algoritmos que dan forma al mundo natural se conviertan en lienzos dinámicos vectoriales.

### Pilares Clave

1. **Inspiración Natural**:
   Algoritmos y modelos basados en fenómenos biológicos, botánicos, geológicos y físicos (morfogénesis, crecimiento, dinámica de fluidos y ramificaciones).
2. **Exploración Paramétrica en Tiempo Real**:
   Controles interactivos e intuitivos (sliders, selectores morfológicos, paletas botánicas armónicas, mutación armónica) que permiten descubrir variantes estéticas de cada patrón.
3. **Exportación Versátil**:
   - **Vectorial (SVG)**: Ideal para ploteo de plumillas (pen plotters como Axidraw), corte láser, diseño gráfico o impresión en alta resolución sin pérdida de calidad.
   - **Código**: Exportación de fragmentos de JavaScript limpios y autónomos para integrar o estudiar el algoritmo.
   - Copiar al portapapeles o descargar directamente en `.svg`.

---

## 🧩 Patrones Implementados y en Desarrollo

- [x] **Filotaxis y Espirales de Fermat**: Disposición de semillas de girasol, piñas y suculentas basada en la fórmula polar de Vogel y el ángulo áureo (~137.508°), con variación morfológica de pétalos, círculos y diamantes.
- [x] **Ramificaciones Fractales (Árboles Botánicos)**: Sistemas de bifurcación orgánica recursiva (L-Systems) con control de profundidad, apertura angular, tasa de reducción de rama, follaje y fototropismo/viento.
- [ ] **Campos de Flujo y Ruido Orgánico (Perlin / Simplex Flow Fields)**: Movimientos de viento, corrientes marinas, estelas y dunas de arena.
- [ ] **Reacción-Difusión (Patrones de Turing)**: Simulación morfogénica similar a la pigmentación de pieles de animales (manchas de leopardo, rayas de pez cebra).
- [ ] **Diagramas de Voronoi y Teselaciones**: Estructuras celulares parecidas a panales de abejas o alas de libélula.
- [ ] **Atractores Extraños y Ondas**: Patrones de interferencia y resonancia armónica.

---

## 🏛️ Arquitectura Modular (Estratégica / Plugins)

El proyecto utiliza una arquitectura desacoplada para permitir agregar decenas de patrones sin tocar la interfaz ni el motor de exportación:

```
nature-gen-art/
├── index.html                 # Interfaz de usuario y visor vectorial responsivo
├── css/
│   └── style.css              # Tema oscuro y controles táctiles/sliders
├── js/
│   ├── app.js                 # Orquestador de eventos y renderizado
│   ├── ui.js                  # Generador dinámico reactivo de controles según el esquema del patrón
│   ├── exporter.js            # Motor de exportación y descarga SVG / código
│   └── patterns/              # Módulos de patrones independientes
│       ├── registry.js        # Catálogo donde se registran los patrones
│       ├── phyllotaxis.js     # Patrón de filotaxis
│       └── branching-tree.js  # Patrón de árbol fractal
```

---

## 💻 Ejecución Local

Para ejecutarlo localmente en cualquier máquina:

```bash
# Con Python 3
python3 -m http.server 8080

# Luego abre http://localhost:8080 en tu navegador
```
