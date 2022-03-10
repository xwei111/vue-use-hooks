import { ref, Ref } from '@vue/composition-api'

/** 可编辑带分页，编辑与后端有实时交互无需使用，无分页无需使用 */

export interface tableEditTypes {
  editDatas: Ref<object>;
  clearEdits: () => void;
  setEditHandle: (dataSource: Array<object>, currentPage: number) => void;
  setEditDataSource: <T>(dataSource: T, currentPage: number) => T
}

export default (): tableEditTypes => {
  // 存储被编辑的数据
  const editDatas = ref<object>({})
  // 触发编辑时开始收集数据
  const setEditHandle = (dataSource: Array<object>, currentPage: number): void => {
    if (!dataSource || !currentPage) return
    editDatas.value[currentPage] = dataSource
  }
  // 分页切换时设置已编辑的table数据
  const setEditDataSource = <T>(dataSource: T, currentPage: number): T => {
    if (!dataSource || !currentPage) return dataSource
    const currentData = editDatas.value[currentPage] || []
    if (!currentData || !currentData.length) return dataSource

    currentData.forEach((item, index) => {
      if (item) {
        Object.keys(item).forEach(key => { dataSource[index][key] = currentData[index][key] })
      }
    })
    return dataSource
  }
  // 清空编辑信息
  const clearEdits = (): void => { editDatas.value = {} }

  return {
    editDatas,
    clearEdits,
    setEditHandle,
    setEditDataSource
  }
}
