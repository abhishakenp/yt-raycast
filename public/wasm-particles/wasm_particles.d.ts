/* tslint:disable */
/* eslint-disable */

export class ParticleSystem {
  free(): void
  [Symbol.dispose](): void
  constructor(count: number, width: number, height: number)
  resize(width: number, height: number): void
  update(dt: number): void
  readonly particle_count: number
  readonly particles: number
}
