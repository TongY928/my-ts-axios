import { CancelExecutor, Canceler, CancelTokenSource } from "../types";

import Cancel from './Cancel'

interface ResolvePromise {
  (reason?: Cancel): void
}
export default class CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel

  constructor (executor: CancelExecutor) {
    let resolvePromise: ResolvePromise

    this.promise = new Promise<Cancel>((resolve) => {
      // 这里存在类型不匹配，先用 any 跳过类型检测
      resolvePromise = resolve as any
    })
    executor ((message) => {
      if (this.reason) {
        return
      }
      this.reason = new Cancel(message)
      resolvePromise(this.reason)
    })
  }
  throwIfRequested () {
    if (this.reason) {
      throw this.reason
    } 
  }
  // 静态 source 方法，类似于一个工厂方法，生成一个对象
  static source (): CancelTokenSource {
    let cancel!: Canceler
    const token = new CancelToken(c => {
      cancel = c
    })
    return {
      cancel,
      token
    }
  }
}