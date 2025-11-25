import type { interfaces } from 'inversify';
import type { LazyServiceIdentifer } from 'inversify';

type DecoratorTarget = (target: object, targetKey: PropertyKey | undefined, index?: number | PropertyDescriptor) => void;

declare module 'inversify' {
  export function inject(serviceIdentifier: interfaces.ServiceIdentifier<any> | LazyServiceIdentifer): DecoratorTarget;
  export function named(name: string | number | symbol): DecoratorTarget;
  export function optional(): DecoratorTarget;
}
