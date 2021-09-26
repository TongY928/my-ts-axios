import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { isFormData } from '../helpers/util'
import { parseHeaders } from '../helpers/headers'
import  { createError } from '../helpers/error'
import { isURLSameOrigin } from '../helpers/url'
import cookie from '../helpers/cookie'

// 返回一个 Promise
export default function xhr (config: AxiosRequestConfig): AxiosPromise {

  return new Promise((resolve, reject) => {
    const {
      data = null,
      method = 'get',
      url,
      headers,
      responseType,
      timeout,
      cancelToken,
      withCredentials,
      xsrfCookieName,
      xsrfHeaderName,
      onDownloadProgress,
      onUploadProgress,
      auth,
      validateStatus
    } = config

    // 创建 xhr 对象
    const request = new XMLHttpRequest()

    // 配置;;; 参数三 true 表示异步
    request.open(method.toUpperCase(), url!, true)

    configureRequest()
    addEvents()
    processHeaders()
    processCancel()

    // 发送请求
    request.send(data)

    function configureRequest (): void {
      // 如果设置了响应数据的类型，则赋值
      if (responseType) {
        request.responseType = responseType
      }
      // 设置超时时间
      if (timeout) {
        request.timeout = timeout
      }
      // 跨域请求是否携带 cookie
      if (withCredentials) {
        request.withCredentials = withCredentials
      }
    }

    function addEvents (): void {
      // 监听下载进度
      if (onDownloadProgress) {
        request.onprogress = onDownloadProgress
      }
      // 监听上传进度
      if (onUploadProgress) {
        request.upload.onprogress = onUploadProgress
      }
      // 监听错误事件
      request.onerror = function handleError () {
        reject(createError('Network Error', config, null, request))
      }
      // 监听超时
      request.ontimeout = function handleTimeout () {
        reject(createError(`Timeout of ${timeout} ms exceeded`, config, 'ECONNABORTED', request))
      }
      // 监听发送请求的过程
      request.onreadystatechange = function handleLoad () {
        // 当 state 不为 4 时，说明请求还没有成功
        if (request.readyState !== 4) {
          return
        }
        // 处理状态码
        if (request.status === 0) {
          return
        }
        // 获取响应头信息，这里获取到的是一串字符串，我们把它转换为 key value 形式
        const responseHeaders = parseHeaders(request.getAllResponseHeaders())
        // 根据响应结果的类型，来对 data 做处理
        const responseData = responseType !== 'text' ? request.response : request.responseText
        // 响应体结构
        const response: AxiosResponse = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config,
          request
        }
        handleResponse(response)
      }
    }

    function processHeaders (): void {
      // 跨域时是否携带 cookie
      if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
        const xsrfValue = cookie.read(xsrfCookieName)
        if (xsrfValue && xsrfHeaderName) {
          headers[xsrfHeaderName] = xsrfValue
        }
      }

      // 如果数据是 formData 类型，我们把 Content-Type 属性删除，让浏览器自己去识别
      if (isFormData(data)) {
        delete headers['Content-Type']
      }

      // 验证用户代理身份
      if (auth) {
        // btoa 方法是基于一个 string 来生成一个 base64 编码的 ASCLL 字符串
        headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password)
      }

      // 设置请求头
      data && Object.keys(headers).forEach((name) => {
        request.setRequestHeader(name, headers[name])
      })
    }

    function processCancel (): void {
      // 是否取消请求
      if (cancelToken) {
        cancelToken.promise.then(reason => {
          // 调用 abort 方法终止一个已经发出的请求
          request.abort()
          reject(reason)
        })
      }
    }

     // 处理状态码
    function handleResponse (response: AxiosResponse): void {
      if (validateStatus && validateStatus(response.status)) {
        resolve(response)
      } else {
        reject(createError(`Request failed with status code ${response.status}`, config, null,    request, response))
      }
    }

  })
}