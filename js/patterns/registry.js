/**
 * Registro y catálogo de patrones generativos
 * Permite agregar nuevos patrones sin modificar la interfaz
 */

import { phyllotaxisPattern } from './phyllotaxis.js';
import { branchingTreePattern } from './branching-tree.js';
import { flowFieldPattern } from './flow-field.js';

class PatternRegistry {
  constructor() {
    this.patterns = new Map();
    this.activePatternId = null;

    // Registrar patrones en un único catálogo accesible
    this.register(phyllotaxisPattern);
    this.register(branchingTreePattern);
    this.register(flowFieldPattern);
    this.activePatternId = flowFieldPattern.id;
  }

  /**
   * Registra un nuevo patrón en el sistema
   */
  register(pattern) {
    if (!pattern.id || !pattern.name || !pattern.generateSVG) {
      throw new Error(`El patrón no cumple con la interfaz requerida: ${pattern.id}`);
    }
    this.patterns.set(pattern.id, pattern);
  }

  /**
   * Devuelve todos los patrones disponibles
   */
  getAll() {
    return Array.from(this.patterns.values());
  }

  /**
   * Obtiene un patrón por su ID
   */
  get(id) {
    return this.patterns.get(id);
  }

  /**
   * Obtiene el patrón activo actual
   */
  getActive() {
    return this.patterns.get(this.activePatternId);
  }

  /**
   * Cambia el patrón activo
   */
  setActive(id) {
    if (this.patterns.has(id)) {
      this.activePatternId = id;
      return this.get(id);
    }
    throw new Error(`Patrón no encontrado: ${id}`);
  }
}

export const registry = new PatternRegistry();
