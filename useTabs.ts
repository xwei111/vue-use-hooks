import { reactive, toRefs } from '@vue/composition-api'
import { valueTypes, dataSourceTypes } from '@/types'

export interface tabsTypes {
  dataSource?: dataSourceTypes;
  currentTab?: valueTypes
}

export default ({ dataSource, currentTab }: tabsTypes) => {
  const state = reactive<tabsTypes>({ dataSource, currentTab })
  // 切换tabs
  const tabCLick = (val: valueTypes): void => { state.currentTab = val }

  return {
    ...toRefs(state),
    tabCLick
  }
}
