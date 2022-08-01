import type { Api as BaseAPI } from 'nocodb-sdk'
import type { I18n } from 'vue-i18n'
import type { UseGlobalReturn } from './composables/useGlobal/types'

import type en from './lang/en.json'

type MessageSchema = typeof en

declare module '#app/nuxt' {
  interface NuxtApp {
    $api: BaseAPI<any>
    /** {@link import('./plugins/tele') Telemetry} */
    $tele: {
      emit: (event: string, data: any) => void
    }
    /** {@link import('./plugins/tele') Telemetry} Emit telemetry event */
    $e: (event: string, data?: any) => void
    $state: UseGlobalReturn
  }
}

declare module '@vue/runtime-core' {
  interface App {
    i18n: I18n<MessageSchema, unknown, unknown, false>['global']
  }
}
