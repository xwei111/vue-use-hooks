import { useMousePressed, useMouse, VueInstance } from '@vueuse/core'
import { reactive, toRefs, watch, Ref } from '@vue/composition-api'
import useClient from '@/hooks/useClient'

/**
 * 元素可拖拽时，计算元素位置，left和right取其一，top和bottom取其一
 * @param right 元素初始化right位置
 * @param left 元素初始化left位置
 * @param top 元素初始化top位置
 * @param bottom 元素初始化bottom位置
 * @param target 元素ref
 * @param refWidth 元素宽度
 * @param refHeight 元素高度
 */

interface posTypes {
  right: number;
  left: number;
  top: number;
  bottom: number;
}

interface paramsTypes extends posTypes {
  refWidth: number;
  refHeight: number;
  target: Ref<HTMLElement | SVGElement | VueInstance>;
}

export default ({
  right,
  left,
  top,
  bottom,
  target,
  refWidth = 0,
  refHeight = 0
}: Partial<paramsTypes>) => {
  // state
  const { clientWidth, clientHeight } = useClient()
  // state
  const state = reactive<Partial<posTypes>>({
    right,
    left,
    top,
    bottom
  })
  // useMousePressed
  const { pressed } = useMousePressed({ target })
  // useMouse
  const { x, y } = useMouse()
  // watch：监听鼠标移动计算left,top,right,bottom
  watch(
    [x, y],
    ([x1, y1], [x2, y2]) => {
      try {
        // 鼠标按下后移动开始计算位置
        if (pressed.value) {
          const right = state.right - (x1 - x2)
          const left = state.right - (x1 - x2)
          const top = state.top + (y1 - y2)
          const bottom = state.bottom - (y1 - y2)
          const availableClientWidth = clientWidth.value - refWidth
          const availableClientHeight = clientHeight.value - refHeight
          state.right = right >= 0 && right <= availableClientWidth ? right : right < 0 ? 0 : availableClientWidth
          state.left = left >= 0 && left <= availableClientWidth ? left : left < 0 ? 0 : availableClientWidth
          state.top = top >= 0 && top <= availableClientHeight ? top : top < 0 ? 0 : availableClientHeight
          state.bottom = bottom >= 0 && bottom <= availableClientHeight ? bottom : bottom < 0 ? 0 : availableClientHeight
        }
      } catch (error) {
        console.error(`error: ${error}`)
      }
    }
  )

  return {
    ...toRefs(state)
  }
}
