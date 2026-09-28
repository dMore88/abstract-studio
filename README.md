# Abstract Studio 📐✨

Una aplicación web de **diseño generativo paramétrico y arte abstracto por capas**, inspirada en los métodos de transformación acumulativa de Adobe Illustrator (*Efecto > Transformar*), la textura táctil analógica de UJI (*micro-corrugado / papel washi*) y la elegancia geométrica de *Book of Shapes*.

> 🚀 **Demo en vivo (GitHub Pages)**:  
> **[https://dmore88.github.io/abstract-studio/](https://dmore88.github.io/abstract-studio/)**

---

## 🎯 De lo Simple (Generative Artistry) a lo Hiper-Denso (UJI)

La herramienta unifica dos mundos a través de un mismo motor matemático:
1. **Composiciones Mínimas (Bauhaus / Generative Artistry)**: 10 a 20 iteraciones con geometría limpia, trazo nítido y glifos tipográficos en contraste.
2. **Tejidos Complejos (UJI)**: Cientos de iteraciones con escalas sutiles (99.6%), rotación milimétrica y **textura de micro-corrugado** que emula fibras de papel japonés, grabado o seda.

---

## 🏗️ Arquitectura por Capas

### 1. Capa 0: Lienzo & Proporción
- **Aspect Ratio**:
  - `1:1` (Cuadrado / Portadas)
  - `9:16` (Vertical / Stories / Carteles)
  - `16:9` (Panorámico / Fondos)
  - `4:5` (Retrato clásico / Instagram)
  - `4:3` (Editorial estándar)
- **Paletas cromáticas curadas**: *Petróleo & Cian, Medianoche & Carmesí, Ciruela & Terracota, Carbón & Tiza, Abismo Esmeralda, Bauhaus Primario*.

### 2. Capa 1: Arquetipo, Transformación Acumulativa & Textura
- **Arquetipos Base**:
  - **Líneas paralelas**: Densidad, inclinación de ángulo (0° a 180°) y ondulación armónica.
  - **Espiral Nautilus**: Elipse base que se reduce y gira acumulativamente alrededor de un ancla excéntrica (como el panel *Transform* de Illustrator).
  - **Roseta Guilloché**: Pétalos o curvas rotadas radialmente en 360° generando mandalas e interferencias de Moiré.
  - **Vórtice Concéntrico**: Polígonos con ondulación perimetral que se expanden en túnel.
  - **Rejilla Cruzada**: Malla ortogonal.
- **Motor de Transformación Acumulativa (Estilo Illustrator)**:
  - **Copias**: De 5 a 800 repeticiones.
  - **Escala por copia**: Factor de reducción o expansión (88% a 104%).
  - **Giro por copia**: Ángulo incremental de rotación (0° a 30°).
  - **Mover X / Y**: Desplazamiento paso a paso.
  - **Eje de ancla**: Centro, base excéntrica o lateral.
- **Textura Analógica de Papel (Micro-corrugado)**:
  - Slider de **Micro-corrugado (Jitter)**: Añade micro-perturbaciones estocásticas en los vértices del trazo, convirtiendo líneas digitales frías en papel rugoso, hilo de seda o aguafuerte.
- **Herramientas de Esculpido Manual Directo**:
  - `▲ Pico Afilado`: Crestas triangulares agudas con el cursor.
  - `∩ Colina Suave`: Elevaciones orgánicas gaussianas.
  - `🌀 Giro`: Vórtices y pliegues dimensionales.
  - `— Aplanar`: Suavizador / borrador.
  - Botones `↶ Deshacer` y `🗑️ Limpiar Trama`.

### 3. Capa 2: Elementos de Diferencia y Foco (Máximo 3)
- Figuras geométricas (círculos/soles, prismas, marcos translúcidos) o tipografía/glifos.
- Profundidad: **Detrás de la trama** (oculto en segundo plano) o **Delante de la trama** (al frente con modos de mezcla).
- Control de tamaño, posición X/Y porcentual y opacidad.

---

## 📦 Exportación Vectorial

- **Descarga SVG**: Archivo `.svg` vectorial puro, infinito y liviano (listo para abrir y editar en Adobe Illustrator o plotters de plumilla).
- **Copiar SVG**: Código XML copiado al portapapeles con un clic.
- **Ver y Copiar Código**: Snippet reproducible de la composición en JavaScript.

---

## 💻 Ejecución Local

```bash
# Con Python 3
python3 -m http.server 8080

# Abre http://localhost:8080 en tu navegador
```
