import { reactive, toRefs } from '@vue/composition-api'

/** 场景：适用于弹窗类, 根据实际场景扩展useModal
 * @param visible 显示、隐藏
 * @param title 标题
 * @function detail 打开弹窗传入的详细数据
 */

interface stateTypes {
  visible: boolean;
  title: string;
  detail?: unknown;
}

export default (title: string) => {
  const state = reactive<stateTypes>({
    visible: false,
    title,
    detail: null
  })
  // 关闭弹窗
  const cancleHandle = (): void => { state.visible = false }
  // 打开弹窗
  const openHandle = (): void => { state.visible = true }
  // 弹窗内详细数据或参数设置
  const setDetail = (detail: unknown = null): void => { state.detail = detail }
  // 设置标题
  const setTitle = (title: string): void => { state.title = title }

  return {
    ...toRefs(state),
    cancleHandle,
    openHandle,
    setDetail,
    setTitle
  }
}
