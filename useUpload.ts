import { ref, Ref } from '@vue/composition-api'
import { Message } from 'element-ui'
import { toPrefixUrl } from '@/utils/util'
// 静态文件上传(多处用到，抽离作为公共部分)
interface paramsTypes {
  [key: string]: any;
}
interface uploadTypes {
  uploadRef: Ref;
  formApis?: any;
  key?: string;
  cName?: string;
  cKey?: string;
  otherParams?: paramsTypes;
  callback?: (params: { [key: string]: any; }) => void;
}
export default ({
  uploadRef,
  formApis,
  key,
  cName = 'name',
  cKey = 'key',
  otherParams = {},
  callback = null
}: uploadTypes) => {
  // loading
  const loading = ref<boolean>(false)
  // 记录上传文件
  const fileLists = ref<any[]>([])
  // 设置文件参数
  const _setFile = (files: any) => {
    if (callback) {
      // 自定义文件处理逻辑
      files = callback(files)
    } else {
      // 通用文件处理逻辑，otherParams：额外参数
      files = files?.map(file => {
        const { fileName, key } = file?.response ?? {}
        return { [cName]: fileName, [cKey]: key, ...otherParams }
      })
    }
    fileLists.value = files
    formApis && formApis.setFormItem(key, files || null)
  }
  // 上传文件前
  const beforeUpload = (): void => { loading.value = true }
  // 文件改变触发校验
  const onChange = ({ files }): void => {
    _setFile(files ?? [])
  }
  // 移除
  const onRemove = ({ files }): void => _setFile(files ?? [])
  // 错误
  const onError = ({ err }: any): void => {
    loading.value = false
    Message.error(err)
  }
  // 成功
  const onSuccess = (): void => {
    loading.value = false
  }
  // 预览
  const onPreview = ({ response: { key } }) => window.open(toPrefixUrl(`/fs/file/download?fileKey=${key}`))
  // 设置文件
  const setFileList = (files: any) => uploadRef.value && uploadRef.value.setFileList(files)
  // 清空文件
  const clearFiles = (): void => uploadRef.value && uploadRef.value.clearFiles()

  return {
    loading,
    fileLists,
    onChange,
    onRemove,
    onPreview,
    onError,
    onSuccess,
    beforeUpload,
    setFileList,
    clearFiles
  }
}
