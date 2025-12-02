import { useSyncExternalStore } from 'react'
import { ObservableController } from '../mobx-lite'

export function useController<T extends ObservableController>(controller: T): T {
  useSyncExternalStore(controller.subscribe, () => controller.snapshot)
  return controller
}
