import { isDate, isPlainObject, encode, isURLSearchParams } from './util'

interface urlOrigin {
  protocol: string,
  host: string
}

export function isAbsoluteURL (url: string): boolean {
  // 以 http 或者 https 开头的为绝对 url
  return /(^[a-z][a-z\d\+\-\.]*:)?\/\//i.test(url)
}

export function combineURL (baseURL: string, relativeURL?: string): string {
  return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + 
  relativeURL.replace(/^\/+/, '') : baseURL
}

export function buildURL (url: string, params?: any,
   paramsSerializer?: (params: any) => string): string {
  if(!params) {
    return url
  }

  let serializedParams

  if (paramsSerializer) {
    // 如果用户传入自定义序列化方式
    serializedParams = paramsSerializer(params)
  } else if (isURLSearchParams(params)) {
    // 如果参数本身就为 URLSearchParams 格式
    serializedParams = params.toString()
  } else {
    // 把参数拼接为字符串的 key=value 形式存放
    const parts: string[] = []

    Object.keys(params).forEach((key) => {
      const val = params[key]
      if(val === null || typeof val === 'undefined') {
        return
      }
      let values = []
      // 把 val 转换为数组格式， 方便后续统一处理
      if(Array.isArray(val)) {
        values = val
        key += '[]'
      } else {
        values = [val]
      }

      // 把参数转化为键值对格式的字符串
      values.forEach((val) => {
        if(isDate(val)) {
          val = val.toISOString()
        } else if(isPlainObject(val)) {
          val = JSON.stringify(val)
        }
        parts.push(`${encode(key)}=${encode(val)}`)
      })

    })
    // 用 & 来拼接参数
    serializedParams = parts.join('&')
  }

  if(serializedParams) {
    const hashMarkIndex = url.indexOf('#')
    if(hashMarkIndex !== -1) {
      // 请求时，连接中不能有 hash 值
      url = url.slice(0, hashMarkIndex)
    }
    
    // 判断 url 本身是否已经存在参数
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
  }
  return url
}

// 判断两个 url 是否同源，通过协议和域名判断
export function isURLSameOrigin (requestURL: string): boolean {
  const parseOrigin = resolveURL(requestURL)
  return (parseOrigin.host === currentOrigin.host && 
    parseOrigin.protocol === currentOrigin.protocol)
}

const urlParsingNode = document.createElement('a')
const currentOrigin = resolveURL(window.location.href)

function resolveURL (url: string): urlOrigin {
  urlParsingNode.setAttribute('href', url)
  const { protocol, host } = urlParsingNode

  return {
    protocol,
    host
  }
}
