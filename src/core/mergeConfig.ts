import { isPlainObject, deepMerge } from "../helpers/util"
import { AxiosRequestConfig } from "../types"


const strats = Object.create(null)

// 如果调用时没有传入参数，则使用内部的默认值
function defaultStrat (val1: any, val2: any): any {
  return typeof val2 !== 'undefined' ? val2 : val1
}

// 只使用传入的参数
function fromVal2Strat (val1: any, val2: any): any {
  if (typeof val2 !== 'undefined') {
    return val2
  }
}

// 不适用默认合并策略的属性 
const stratKeysFromVal2 = ['url', 'params', 'data']

stratKeysFromVal2.forEach((key) => {
  strats[key] = fromVal2Strat
})



function deepMergeStrat (val1: any, val2: any): any {
  // 如果传入的是普通对象
  if (isPlainObject(val2)) {
    // 深拷贝
    return deepMerge(val1, val2)
  } else if (typeof val2 !== 'undefined') {
    // 如果 val2 不为对象且不为空
    return val2
  } else if (isPlainObject(val1)) {
    return deepMerge(val1)
  } else if (typeof val1 !== 'undefined') {
    return val1
  }
}

const stratKeysDeepMerge = ['headers', 'auth']

stratKeysDeepMerge.forEach((key) => {
  strats[key] = deepMergeStrat
})

export default function mergeConfig (config1: AxiosRequestConfig,
  config2?: AxiosRequestConfig): AxiosRequestConfig {
    if(!config2) {
      config2 = {}
    }
    const config = Object.create(null)

    for (let key in config2) {
      mergeField(key)
    }

    for (let key in config1) {
      if (!config2[key]) {
        mergeField(key)
      }
    }

    function mergeField (key: string): void {
      const strat = strats[key] || defaultStrat
      config[key] = strat(config1[key], config2![key])
    }
    return config
}