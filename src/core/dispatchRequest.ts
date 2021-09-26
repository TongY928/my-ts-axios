import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import xhr from './xhr'
import { buildURL, isAbsoluteURL, combineURL } from '../helpers/url'
import { flattenHeaders } from '../helpers/headers'
import transform from './transform'

export default function dispatchRequest (config: AxiosRequestConfig): AxiosPromise {
  // 发送请求前，查看是否有取消请求的需要
  throwIfCancellationRequested(config)
  // 处理配置参数
  processConfig(config)
  return xhr(config).then((res) => {
    return transformResponseData(res)
  })
}

function processConfig (config: AxiosRequestConfig): void {
  // 处理 prams 和 url
  config.url = transformURL(config)
  // 处理 data
  config.data = transform(config.data, config.headers, config.transformRequest)
  // 把默认值展平
  config.headers = flattenHeaders(config.headers, config.method!)
}

// 拼接 url 和 params
export function transformURL (config: AxiosRequestConfig): string {
  let { url, params, paramsSerializer, baseURL } =config
  // 如果配置了 baseURL，那么就需要判断是否合并 url
  if (baseURL && !isAbsoluteURL(url!)) {
    url = combineURL(baseURL, url)
  }
  return buildURL(url!, params, paramsSerializer)
}


// 如果响应的数据是 JSON 格式，我们要转化为对象
function transformResponseData (res: AxiosResponse): AxiosResponse {
  res.data = transform(res.data, res.headers, res.config.transfromResponse)
  return res
}

function throwIfCancellationRequested (config: AxiosRequestConfig): void {
  if (config.concelToken) {
    config.cancelToken?.throwIfRequested
  }
}