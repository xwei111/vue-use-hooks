
import { ref, Ref } from '@vue/composition-api'
import { columnsTypes } from './useTable'

/**
 * @param columns 表头
 */

export interface tableColumnTypes {
  columns: Ref<Array<columnsTypes>>;
  setColumns: (vals: Array<columnsTypes>) => void
}

export default ({
  tableColumns = []
}: {
  tableColumns: Array<columnsTypes>
}): tableColumnTypes => {
  const columns = ref<Array<columnsTypes>>(tableColumns)

  // 动态控制表单
  const setColumns = (vals: Array<columnsTypes>): void => { columns.value = vals }

  return {
    columns,
    setColumns
  }
}
