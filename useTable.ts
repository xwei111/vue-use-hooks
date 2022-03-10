import { deepCopy } from '@/utils/qjd'
import { onUnmounted, reactive, ref, toRefs, Ref } from '@vue/composition-api'
import useAsync, { paramsTypes, resTypes, dataTypes, asyncTypes } from './useAsync'
// checkbox-逻辑
import useTableCheckBox, { tableCheckTypes } from './useTableCheckBox'
// 动态表头-逻辑
import useTableColumn, { tableColumnTypes } from './useTableColumn'
// 编辑table-逻辑
import useTableEdit, { tableEditTypes } from './useTableEdit'
// 编辑dataSource-逻辑
import useTableEditDataSource, { tableEditDataSourceTypes } from './useTableEditDataSource'

/** 适用于通用table & page使用，配合components/qjd/table、pagination使用，目前组件仅有开发遇到的场景，缺啥补啥，根据实际场景扩展useTbale
 * @param tableRef 非必传，主要用于useTableEditDataSource提供清除选中的功能
 * @param request 接口或Array<any>
 * @param defaultParams 默认入参
 * @param isInit 是否初始化调用
 * @param isPage 是否有分页
 * @param checkbox 是否开启多选模式，混入多选逻辑
 * @param edit 是否开启编辑模式，混入编辑逻辑
 * @param editDataSource 是否开启编辑dataSource模式，混入编辑逻辑
 * @function callback 若接口返回数据不满足需求提供callback容错机制
 * @param columns 为动态表头时需传入，后续使用useTable表头，若表头为静态不需要传入
 * @param isActiveColumn 是否开启动态表单模式
 */

export interface columnsTypes {
  label: string | number;
  key: string | number;
  width?: number | null;
  fixed?: boolean | string;
  align?: string;
  sortable?: boolean | string;
  minWidth?: number | null;
  customHeader?: string;
  type?: string;
  render?: (row: { [key: string]: any; }, item: string | number) => any;
  options?: Array<{
    label: string | number;
    key?: string | number;
    render?: (row: { [key: string]: any; }) => any;
  }>;
  [key: string]: any;
}

export type callbackTypes = (data: Partial<{ totalCount: number; pagedRecords: Array<any> }> | any) => Partial<{ totalCount: number; pagedRecords: Array<any> }>;

export interface tableParamsTypes {
  tableRef: Ref;
  request: any[] | ((params: paramsTypes) => Promise<resTypes>);
  defaultParams: { [key: string]: any; };
  isInit: boolean;
  isPage: boolean;
  checkbox: boolean;
  edit: boolean;
  editDataSource: boolean;
  callback: callbackTypes;
  columns: Array<columnsTypes>;
  isActiveColumn: boolean;
}

type pageChangeTypes = (page: number, pageSize: number) => void;
type showSizeChangeTypes = (current: number, size: number) => void;

export interface paginationTypes {
  current: Ref<number>;
  pageSize: Ref<number>;
  total: number;
  onChange: (page: number, pageSize: number) => void;
  onShowSizeChange: (current: number, size: number) => void;
}

export interface stateTypes {
  params: object;
  searchInfo: any;
  dataSource: Array<any> | ((params: paramsTypes) => Promise<resTypes>);
  pagination: paginationTypes;
}

const defaultCallBack: callbackTypes = (data = {}) => {
  const { totalCount = 0, pagedRecords = [] } = data || {}
  return {
    totalCount,
    dataSource: pagedRecords || []
  }
}

function useTable({
  tableRef,
  request,
  defaultParams = {},
  isInit = true,
  isPage = true,
  checkbox = false,
  edit = false,
  editDataSource = false,
  callback = defaultCallBack,
  columns = [],
  isActiveColumn = false
}: Partial<tableParamsTypes>) {
  const c: number = defaultParams && defaultParams.current ? defaultParams.current : 1
  const p: number = defaultParams && defaultParams.pageSize ? defaultParams.pageSize : 10

  const current = ref<number>(c)
  const pageSize = ref<number>(p)
  // 存储防抖函数
  const timer = ref<number | null>(null)

  const state = reactive<stateTypes>({
    params: isPage ? Object.assign({ pageNo: current, pageSize: pageSize }, defaultParams) : defaultParams,
    searchInfo: {},
    dataSource: [],
    pagination: {
      current: current,
      pageSize: pageSize,
      total: 0,
      onChange: (page, pageSize) => pageChange(page, pageSize),
      onShowSizeChange: (current, size) => showSizeChange(current, size)
    }
  })

  // ----------------------------------------- 是否插入动态表头逻辑  start ----------------------------------------------
  const {
    columns: tableColumns,
    setColumns,
  }: tableColumnTypes = isActiveColumn ? useTableColumn({ tableColumns: deepCopy(columns) }) : <tableColumnTypes>{}
  // 动态column出参
  const activeColParams = {
    columns: tableColumns,
    setColumns
  }
  // ----------------------------------------- 是否插入动态表头逻辑  end   ----------------------------------------------

  // ----------------------------------------- 是否插入checkbox多选逻辑  start ----------------------------------------------
  const {
    currentSelects,
    setCurrentSelects
  }: tableCheckTypes = checkbox ? useTableCheckBox() : <tableCheckTypes>{}
  // element-table 勾选多选框触发
  const selectionChange = (vals: Array<object>): void => {
    checkbox && setCurrentSelects(vals)
    // eslint-disable-next-line
    !checkbox && console.warn('未开启多选模式')
  }
  // checkbox相关出参
  const checkBoxParams = checkbox ? {
    currentSelects,
    setCurrentSelects,
    selectionChange
  } : { selectionChange }
  // ----------------------------------------- 是否插入checkbox多选逻辑 end   ----------------------------------------------

  // ----------------------------------------- 是否插入可编辑table逻辑 start ----------------------------------------------
  const {
    editDatas,
    clearEdits,
    setEditHandle,
    setEditDataSource,
  }: tableEditTypes = edit ? useTableEdit() : <tableEditTypes>{}
  // 编辑触发
  const setEditChange = dataSource => {
    if (setEditHandle) {
      setEditHandle(dataSource, current.value)
    } else {
      // eslint-disable-next-line
      console.warn('未开启可编辑模式')
    }
  }
  // 可编辑table相关出参
  const editParams = edit ? {
    editDatas,
    clearEdits,
    setEditChange
  } : { setEditChange }
  // ----------------------------------------- 是否插入可编辑table逻辑 end   ----------------------------------------------

  // ----------------------------------------- 是否插入可编辑table.dataSource逻辑 start ----------------------------------------------
  const editDataSourceParams: tableEditDataSourceTypes = editDataSource ? useTableEditDataSource({
    tableRef,
    tableState: state,
    selectState: { currentSelects, setCurrentSelects },
    columns,
  }) : <tableEditDataSourceTypes>{}
  // ----------------------------------------- 是否插入可编辑table.dataSource逻辑 end ----------------------------------------------

  // 成功回调
  const successCallBack = ({ code, data }: Partial<dataTypes>): void => {
    if (code === '0') {
      // callback回调处理数据
      const result: Partial<{ totalCount: number; dataSource: Array<any> }> = callback ? callback(data) : data
      const { totalCount = 0, dataSource = [] } = result || {}
      state.pagination.total = totalCount || (dataSource ? dataSource.length : 0)
      state.dataSource = dataSource
      // 编辑模式下的数据回显
      edit && setEditDataSource(state.dataSource, current.value)
    }
  }
  // 接口
  const { doResult, loading } = useAsync({
    request,
    init: false,
    params: {},
    successCallBack
  } as Partial<asyncTypes>)
  // api请求或json
  const _request = (params = {}): void => {
    if (Object.prototype.toString.call(request) === '[object Array]') { // 使用定义时传入的json数据
      state.dataSource = request
      state.pagination.total = request.length
    } else if (Object.prototype.toString.call(request) === '[object Function]') { // 使用定义时传入的API请求
      doResult({ ...state.params, ...params })
    }
  }
  // 查询
  const searchHandle = (searchInfo: any = {}): void => {
    // 拷贝数据，防止影响上层数据
    searchInfo = JSON.parse(JSON.stringify(searchInfo))
    current.value = c
    pageSize.value = p
    state.pagination.current = searchInfo.pageNo ? searchInfo.pageNo : c
    state.pagination.pageSize = searchInfo.pageSize ? searchInfo.pageSize : p
    state.searchInfo = searchInfo
    _request(searchInfo)
  }
  // 切换条数时，若当前页不为第一页且切换后数据只有一页showSizeChange触发后会触发pageChange，添加防抖
  const _deferRequest = (): void => {
    timer.value && clearTimeout(timer.value)
    timer.value = window.setTimeout(() => {
      _request(state.searchInfo)
    }, 0)
  }
  // 切换页数
  const pageChange: pageChangeTypes = (page, pageSize) => {
    current.value = page
    state.searchInfo.pageNo = page
    _deferRequest()
  }
  // 切换条数
  const showSizeChange: showSizeChangeTypes = (current, size) => {
    pageSize.value = current
    state.searchInfo.pageSize = current
    _deferRequest()
  }
  // 重置
  const resetHandle = (searchInfo: object = {}): void => {
    state.searchInfo = searchInfo
    current.value = c
    pageSize.value = p
    _request(searchInfo)
  }
  // 清空数据
  const clearHandle = (): void => {
    state.dataSource = []
    current.value = c
    pageSize.value = p
  }
  // 清空默认参数
  const clearDefaultParams = (): void => { state.params = isPage ? Object.assign({ pageNo: current, pageSize: pageSize }, {}) : {} }
  // 初始化数据
  isInit && _request(state.params)
  // 清除定时器
  onUnmounted(() => {
    if (timer.value) {
      clearTimeout(timer.value)
      timer.value = null
    }
  })

  return {
    ...toRefs(state),
    loading,
    searchHandle,
    resetHandle,
    clearHandle,
    clearDefaultParams,
    // checkbox多选相关状态 & 接口
    ...checkBoxParams,
    // 可编辑table相关状态 & 接口
    ...editParams,
    // 可编辑table dataSource相关状态 & 接口
    ...editDataSourceParams,
    // 动态表头相关状态 & 接口
    ...activeColParams,
  }
}

export default useTable
