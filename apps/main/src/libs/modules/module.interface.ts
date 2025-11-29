import { DependencyContainer } from "tsyringe";

/**
 * Interface for modules that can register their own dependencies
 */
export interface IModule {
  /**
   * Register all dependencies for this module
   * @param container The TSyringe container to register dependencies with
   */
  register(container: DependencyContainer): void;
}

/**
 * Base class for modules
 * Provides a convenient way to create modules
 */
export abstract class BaseModule implements IModule {
  abstract register(container: DependencyContainer): void;
}
