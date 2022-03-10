import { ref, onUnmounted } from '@vue/composition-api'

/**
 * 场景：适用于setTimeout，使用完毕组件卸载时清除setTimeout
 * @param callback 执行主函数
 * @param time 时间
 */

export default () => {
  const timer = ref<number | null>(null)
  // perTimeout
  const perTimeout = (callback: () => void | null = null, time: number = 0) => {
    timer.value = window.setTimeout(() => {
      callback && callback()
    }, time)
    return timer.value
  }
  // 组件卸载若存在清除
  onUnmounted(() => {
    if (timer.value) {
      clearTimeout(timer.value)
      timer.value = null
    }
  })

  return {
    perTimeout,
    timer
  }
}
