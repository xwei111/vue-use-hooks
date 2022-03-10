import { deepCopy, uuid, isObject } from '@/utils/qjd'

export interface tableEditDataSourceTypes {
  addRow: (normalizeRow: Function, insertFirst: boolean) => void;
  delSelectedRows: (primaryKey: string) => void;
  addDataSource: (value: object, key: string, type: string) => void;
  deleteDataSource: (value: object, key: string) => void;
  resetDataSource: (newDataSource: Array<object>) => void;
}

export default function ({ tableRef, tableState, selectState, columns }): tableEditDataSourceTypes {
  /**
   * @param {Function} normalizeRow 个性化转换函数
   * @param {Boolean} isShift 是否在首位插入，否则从末尾插入
   */
  const addRow = (normalizeRow: Function, insertFirst: boolean = false): void => {
    let row = {}
    columns.forEach(item => (row[item.key] = undefined))
    row = normalizeRow ? normalizeRow(row) : row
    if (insertFirst) tableState.dataSource.unshift(row)
    else tableState.dataSource.push(row)
  }

  /**
   * @param String primaryKey 用来区分行数据唯一性的属性的名字
   */
  const delSelectedRows = (primaryKey: string): void => {
    selectState.currentSelects.value.forEach(item => {
      const index = tableState.dataSource.findIndex(child => child[primaryKey] === item[primaryKey])
      tableState.dataSource.splice(index, 1)
    })
    selectState.setCurrentSelects([])
    tableRef.value.clearSelection()
  }

  // 单条新增
  const addDataSource = (value: object, key: string = '_id', type: string = 'push'): void => {
    if (!isObject(value)) return
    value[key] = uuid()
    tableState.dataSource[type](deepCopy(value))
  }
  // 单条删除
  const deleteDataSource = (value: object | string, key: string = '_id'): void => {
    const index = tableState.dataSource?.findIndex(item => item[key] === value)
    if (!index && index !== 0) return
    tableState.dataSource.splice(index, 1)
  }

  const resetDataSource = (newDataSource: Array<object>): void => { tableState.dataSource = deepCopy(newDataSource) }

  return {
    addRow,
    delSelectedRows,
    resetDataSource,
    addDataSource,
    deleteDataSource
  }
}
