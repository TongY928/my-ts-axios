import { isPlainObject, deepMerge } from './util'
import { Method } from '../types'

// 我们在调用 api 书写时，都是写的小写，这里我们要内部判断并转换
function normalizeHeaderName (headers: any, normalizedName: string): void {
  if (!headers) {
    return
  }
  Object.keys(headers).forEach((name) => {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = headers[name]
      delete headers[name]
    }
  })
}
// 格式化请求头
export function processHeaders (headers: any, data: any): any {
  normalizeHeaderName(headers, 'Content-Type')

  // 如果 data 是普通对象，并且参数没有设置 Content-Type，我们要赋一个默认值
  if (isPlainObject(data)) {
    if (headers && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=utf-8'
    }
    return headers
  }
}

export function parseHeaders (headers: string): any {
    let parsed = Object.create(null)
    if (!headers) {
      return parsed
    }
    // 响应头的内容是一段字符串，可以用空格 + 换行识别每一条属性
    headers.split('\r\n').forEach((line) => {
      let [key, ...vals] = line.split(':')
      key = key.trim().toLowerCase()
      if (!key) {
        return
      }
      const val = vals.join(':').trim()
      parsed[key] = val
    })
    
    return parsed
}

// 把默认的配置和传入的配置合并，主要是处理默认配置中的 common 属性
export function flattenHeaders (headers: any, method: Method): any {
  if (!headers) {
    return headers
  }
  headers = deepMerge(headers.common, headers[method], headers)

  const methodsToDelete = ['delete', 'get', 'head', 'options', 'post', 'put', 'patch', 'common']

  methodsToDelete.forEach(method => {
    delete headers[method]
  })

  return headers
}