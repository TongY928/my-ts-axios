const toString = Object.prototype.toString


// 返回值使用谓词保护，这样原代码中可以正确得到 Date 类型
export function isDate (val: any): val is Date {
  return toString.call(val) === '[object Date]'
}

// 通用对象
export function isObject (val: any): val is Object {
  return typeof val === 'object' && val !== null
}
// 普通对象
export function isPlainObject (val: any): val is Object {
  return toString.call(val) === '[object Object]'
}

// 把参数转化为 encode 格式
export function encode (val: string): string {
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/ig, ':')
    .replace(/$24/g, '$')
    .replace(/%2C/ig, ',')
    // 空格变加号
    .replace(/%20/g, '+')
    .replace(/%5B/ig, '[')
    .replace(/%5D/ig, ']')
}

// 实现两个对象合并
export function extend<T, U> (to: T, from: U): T & U {
  for (const key in from) {
    (to as T & U)[key] = from[key] as any
  }
  return to as T & U
}

// 两个普通对象的深拷贝
export function deepMerge(...objs: any[]): any {
  const result = Object.create(null)

  objs.forEach(obj => {
    if (obj) {
      Object.keys(obj).forEach(key => {
        const val = obj[key]
        if (isPlainObject(val)) {
          if (isPlainObject(result[key])) {
            result[key] = deepMerge(result[key], val)
          } else {
            result[key] = deepMerge(val)
          }
        } else {
          result[key] = val
        }
      })
    }
  })

  return result
}

// 判断数据是否为 formData 类型
export function isFormData (val: any): val is FormData {
  return typeof val !== 'undefined' && val instanceof FormData
}

export function isURLSearchParams (val: any): val is URLSearchParams {
  return typeof val !== 'undefined' && val instanceof URLSearchParams
}