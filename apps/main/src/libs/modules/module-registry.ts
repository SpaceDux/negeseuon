import { container as tsyringeContainer, DependencyContainer } from "tsyringe";
import { IModule } from "./module.interface";

/**
 * Module registry
 * Centralized place to register all application modules
 */
export class ModuleRegistry {
  private modules: IModule[] = [];

  /**
   * Register a module
   */
  registerModule(module: IModule): void {
    this.modules.push(module);
  }

  /**
   * Register all modules with the container
   */
  bootstrap(container: DependencyContainer = tsyringeContainer): void {
    for (const module of this.modules) {
      module.register(container);
    }
  }
}

/**
 * Global module registry instance
 */
export const moduleRegistry = new ModuleRegistry();
