export type Listener = () => void

/**
 * A tiny observable helper that mimics the parts of MobX we need for the demo.
 * It exposes a subscribe hook and a notify method to trigger React updates.
 */
export class ObservableController {
  private listeners = new Set<Listener>()
  private version = 0

  subscribe = (listener: Listener) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  protected notify() {
    this.version += 1
    for (const listener of this.listeners) {
      listener()
    }
  }

  protected update(mutator: () => void) {
    mutator()
    this.notify()
  }

  get snapshot() {
    return this.version
  }
}

// Stubbed helpers to keep the example aligned with MobX terminology.
export function makeAutoObservable<T extends object>(target: T): T {
  return target
}

export function runInAction(action: () => void) {
  action()
}
