import { ref, Ref } from '@vue/composition-api'

export interface tableCheckTypes {
  currentSelects: Ref<Array<object>>;
  setCurrentSelects: (vals: Array<object>) => void
}

export default (): tableCheckTypes => {
  // 存储勾选数据
  const currentSelects = ref([])
  // 设置勾选数据
  const setCurrentSelects = (vals): void => { currentSelects.value = vals }
  /**
   * 改为table自带多选功能，当遇到自定义多选框功能时，element未提供相应的功能，可以参考以下注释逻辑
   */
  // // perTimeout
  // const { perTimeout } = useTimeout()
  // // 存储每一页的勾选数据，键值对形式
  // const selectRows = ref({})
  // // 存储所以勾选数据，数组
  // const currentSelects = ref([])

  // // 获取当前勾选table集合-数组
  // const getCurrentSelects = (data = {}) => {
  //   if (!data) return
  //   try {
  //     const currentSelects = []
  //     Object.values(data).forEach(child => {
  //       child && child.length && child.forEach(item => {
  //         const isHas = currentSelects.find(select => item[key] === select[key])
  //         !isHas && currentSelects.push(item)
  //       })
  //     })
  //     return currentSelects
  //   } catch (error) {
  //     console.log(`error: ${error}`)
  //   }
  // }
  // // 勾选动作触发
  // const selectHandle = (vals = [], currentPage) => {
  //   if (!vals || !currentPage) return
  //   selectRows.value[currentPage] = vals
  //   currentSelects.value = getCurrentSelects(selectRows.value)
  //   return currentSelects.value
  // }
  // // 切换分页，checkbox回显
  // const doCheckboxShow = (current, dataSource) => {
  //   const rows = selectRows.value[current.value] || []
  //   rows.length && rows.map(item => perTimeout(() => {
  //     if (dataSource && dataSource.length) {
  //       const data = dataSource.find(child => child.id === item.id)
  //       data && tableRef.value.toggleRowSelection(data)
  //     }
  //   }))
  // }
  // // 清空勾选数据
  // const clearCheckBox = () => {
  //   selectRows.value = {}
  //   currentSelects.value = []
  // }

  return {
    currentSelects,
    setCurrentSelects
  }
}
