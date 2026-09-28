# Abstract Studio 📐✨

Una aplicación web de **arte abstracto paramétrico y diseño generativo por capas**, diseñada para crear composiciones geométricas vectoriales combinando tramas matemáticas, esculpido manual directo con el cursor y elementos de contraste o tipografía.

> 🚀 **Demo en vivo (GitHub Pages)**:  
> **[https://dmore88.github.io/nature-gen-art/](https://dmore88.github.io/nature-gen-art/)**

---

## 🎯 Propósito del Proyecto

El objetivo es ofrecer un estudio de **composición gráfica abstracta y exploración visual** que cierre la brecha entre la precisión del código generativo y la intuición del dibujo a mano alzada. 

En lugar de limitarse a generar formas cerradas, la herramienta funciona como un instrumento de diseño donde el algoritmo genera la estructura base y tú esculpes, deformas y compones directamente sobre el lienzo.

---

## 🏗️ Sistema de Composición por Capas

La arquitectura visual está organizada en 3 capas de composición armónica:

### 1. Capa 0: Lienzo, Formato y Color
- **Control de Aspect Ratio**:
  - `1:1` (Cuadrado / Portadas)
  - `9:16` (Vertical / Stories / Carteles)
  - `16:9` (Panorámico / Fondos de pantalla)
  - `4:5` (Retrato clásico / Instagram)
  - `4:3` (Editorial estándar)
- **Paletas cromáticas seleccionadas**: *Petróleo & Cian, Medianoche & Carmesí, Ciruela & Terracota, Carbón & Tiza, Abismo Esmeralda, Bauhaus Primario*.

### 2. Capa 1: Trama de Repetición y Esculpido Directo
- **Geometrías de repetición**:
  - **Líneas paralelas**: con rotación continua de ángulo (0° a 180°), densidad y grosor de trazo.
  - **Polígonos concéntricos**: conos y prismas apilados (triángulos, rombos, hexágonos, círculos).
  - **Rejilla cruzada**: trama ortogonal dinámica.
- **Herramientas de Esculpido Manual (Directo en Pantalla)**:
  - `▲ Pico Afilado`: deforma las líneas en crestas triangulares agudas (estilo cordilleras o picos rocosos).
  - `∩ Colina Suave`: eleva abultamientos orgánicos continuos con caída gaussiana suave.
  - `🌀 Torsión`: retuerce las trayectorias en remolinos y pliegues dimensionales.
  - `— Aplanar`: borrador que calma zonas y restablece las líneas a su geometría base.
  - Botones de acción: `↶ Deshacer último trazo` y `🗑️ Limpiar Trama`.

### 3. Capa 2: Elementos de Diferencia y Enfoque (Máximo 3)
Permite agregar capas focales para generar contraste geométrico o editorial:
- **Formas**: Círculos (soles/lunas), marcos rectangulares translúcidos, polígonos regulares y tipografía/glifos.
- **Profundidad de capa**:
  - **Detrás de la trama**: el elemento queda en segundo plano, recortado u ocluido parcialmente por las líneas.
  - **Delante de la trama**: se superpone al frente con modos de mezcla y opacidades.
- **Controles**: Posición `(X, Y)` porcentual, tamaño y opacidad.

---

## 📦 Exportación de Alta Calidad

- **Descarga SVG**: Archivo `.svg` vectorial puro, ligero e infinitamente escalable (listo para abrir y editar en Adobe Illustrator, o enviar a corte láser y plotters de plumilla como Axidraw).
- **Copiar SVG**: Copia el código XML directamente al portapapeles.
- **Ver y Copiar Código**: Muestra el snippet JavaScript autónomo para reproducir la composición en cualquier proyecto web.

---

## 💻 Ejecución Local

```bash
# Con Python 3
python3 -m http.server 8080

# Luego abre http://localhost:8080 en tu navegador
```
