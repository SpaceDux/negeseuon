import { container } from "tsyringe";
import { initTRPC, type Router } from "@trpc/server";

/**
 * Custom decorator for TRPC routers
 * Registers the router class with TSyringe and provides dependency injection
 */
export function TRPCRouter(token?: string) {
  return function <T extends { new (...args: any[]): any }>(constructor: T) {
    // Register the class with TSyringe
    const tokenToUse = token || constructor.name;
    container.register(tokenToUse, {
      useClass: constructor,
    });

    // Return the constructor with metadata
    return constructor;
  };
}

/**
 * Base class for TRPC routers with dependency injection support
 */
export abstract class BaseTRPCRouter {
  protected t = initTRPC.create();

  /**
   * Build and return the router
   * Must be implemented by subclasses
   */
  abstract build(): Router<any>;
}
