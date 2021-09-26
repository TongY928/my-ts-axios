import { isPlainObject } from "./util";


// 请求的数据格式化
export function transformRequest (data: any): any {
  if(isPlainObject(data)) {
    return JSON.stringify(data)
  }
   
  return data
}

// 响应的数据对象化
export function transformResponse (data: any): any {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch (error) {
      // do nothing
    }
  }
  return data
}