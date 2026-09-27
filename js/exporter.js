/**
 * Módulo de Exportación: SVG y Código
 */

export class Exporter {
  /**
   * Descarga el string SVG como un archivo descargable en el navegador
   */
  static downloadSVG(svgString, filename = 'nature-art.svg') {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Copia el código SVG directamente al portapapeles
   */
  static async copySVGToClipboard(svgString) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(svgString);
      return true;
    } else {
      // Fallback para entornos restrictivos
      const textarea = document.createElement('textarea');
      textarea.value = svgString;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  }

  /**
   * Copia texto genérico al portapapeles
   */
  static async copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  }
}
