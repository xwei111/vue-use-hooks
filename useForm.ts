import { deepCopy } from '@/utils/qjd'
import { reactive, toRefs, Ref } from '@vue/composition-api'

/**
 * 场景：适用于所有表单类提交包括查询，配合components/qjd/form使用，目前组件仅有开发遇到的场景，缺啥补啥，根据实际场景扩展useForm
 * @param formRef form-ref
 * @param formData 初始化数据
 * @param formConfig 表单配置
 * @param formRules 校验规则
 */
export interface otherKeysTypes {
  label: string;
  value: string
}
export interface configTypes {
  type: string;
  key: string;
  kind: string;
  slotName: string;
  label: string;
  labelKey: string;
  valueFormat: string;
  options: Array<object>;
  otherKeys: otherKeysTypes,
  disabled: boolean;
  placeholder: string;
  pickerOptions: object;
  multiple: boolean;
  filterable: boolean;
  remote: boolean;
  loading: boolean;
  clearable: boolean;
  remoteMethod: Function;
  collapseTags: boolean;
  allowCreate: boolean;
  valueKey: string;
  controlsPosition: string;
  min: number;
  max: number;
  precision: number;
  step: number;
  controls: boolean;
  maxlength: number;
  unit: string;
  unitLeft: number,
  props: object;
  width: string | number;
  info: string;
  isHidden: boolean;
  span: number;
  align: string | number;
  minWidth: string | number;
  rangeSeparator: string;
  [key: string]: any;
}

interface reactiveType {
  formData: object;
  formConfig: Array<Partial<configTypes>>;
  formRules?: object
}
interface paramTypes extends reactiveType{
  formRef: Ref
}
export default ({
  formRef,
  formData,
  formConfig,
  formRules
}: paramTypes) => {
  const state = reactive<reactiveType>({
    formData: deepCopy(formData),
    formConfig: deepCopy(formConfig),
    formRules: deepCopy(formRules)
  })
  // 提交表单
  const submitHandle = async (callback: Function = null): Promise<any> => {
    try {
      const { value: { submitHandle: forSubmit } } = formRef
      const valid = await forSubmit()
      valid && callback && callback(state.formData)
      return valid
    } catch (error) {
      console.log(`error: ${error}`)
    }
  }
  // 重置表单
  const resetHandle = () => formRef.value && formRef.value.resetHandle()
  // 校验表单部分字段
  const validateField = (val?: string): void => formRef.value && formRef.value.validateField(val)
  // 清除校验
  const clearValidate = (val?: string): void => formRef.value && formRef.value.clearValidate(val)
  // 查询formConfig-item
  const getConfig = (key: string): object => state.formConfig.find(item => item.key === key) ?? null
  // 更新整个formConfig
  const setConfigs = (vals: Array<Partial<configTypes>>): void => { state.formConfig = deepCopy(vals) }
  /**
   * @param key formConfig - key
   * @param attr formConfig - 属性
   * @param value 设置的值
   */
  const setConfig = (key: string, attr: string, value: any): void => {
    if (!key || !attr) return
    const item = getConfig(key)
    if (!item) return
    item[attr] = value
  }
  // formData单个元素赋值
  const setFormItem = (key: string, value: any): void => {
    if (!key) return
    state.formData[key] = value
  }
  // formRules单个属性配置变更
  const setFormRuleAttr = (key: string, index: number, attr: string, value: any): void => {
    if (!key || !attr) return
    state.formRules[key][index][attr] = value
  }
  // formRules单个配置变更，针对需要动态设置校验规则 | 校验规则依赖于响应式的form数据
  const setFormRule = (key: string, index: number, value: any): void => {
    if (!key) return
    state.formRules[key][index] = value
  }
  // formRules整体配置变更
  const setFormRules = (data: object): void => { state.formRules = deepCopy(data) }
  // 遍历formConfig,通过callbac处理数据
  const loopFormConfig = (callback: Function): void => state.formConfig.forEach(item => callback && callback(item))
  // 遍历formData,通过callbac处理数据
  const loopFormData = (callback: Function): void => Object.keys(state.formData).forEach(key => callback && callback(state.formData, key))
  // 重置formData
  const resetFormData = (): void => { state.formData = deepCopy(formData) }
  // 重置formConfig
  const resetFormConfig = (): void => { state.formConfig = deepCopy(formConfig) }
  // 设置formData
  const setFormData = (data: object): void => { state.formData = deepCopy(data) }
  return {
    submitHandle,
    resetHandle,
    validateField,
    clearValidate,
    setConfigs,
    setConfig,
    getConfig,
    setFormItem,
    setFormRuleAttr,
    setFormRule,
    loopFormConfig,
    loopFormData,
    resetFormData,
    setFormData,
    setFormRules,
    resetFormConfig,
    ...toRefs(state),
  }
}
