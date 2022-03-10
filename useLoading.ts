// loading 状态
import { ref, Ref } from '@vue/composition-api'

export interface loadingTypes {
  loading: Ref<boolean>;
  checkLoading: (value: boolean) => void;
}

export default (): loadingTypes => {
  const loading = ref<boolean>(false)

  // loading切换
  const checkLoading = (value: boolean): void => { loading.value = value }

  return {
    loading,
    checkLoading
  }
}
