import deepmerge from "deepmerge"
import { logger } from "logger"
import type { RequestInit as NativeRequestInit } from "node-fetch"
import fetch from "node-fetch"
import { capFirst } from "utils/common"

type RequestInit = NativeRequestInit & {
  /**
   * Whether to hide the 500 error with some generic message e.g "Something went wrong"
   * */
  autoWrap500Error?: boolean
}

type OkPayload = {
  ok: true
  data: Record<string, any>
  error: null
}

type ErrPayload = {
  ok: false
  data: null
  error: string
}

type OkResponse<T> = {
  json: () => Promise<OkPayload & T>
}

type ErrResponse = {
  json: () => Promise<ErrPayload>
}

const defaultInit: RequestInit = {
  autoWrap500Error: true,
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
}

export class Fetcher {
  protected async jsonFetch<T>(
    url: string,
    init: RequestInit = {}
  ): Promise<(OkPayload & T) | ErrPayload> {
    try {
      const mergedInit = deepmerge(defaultInit, init)
      const { autoWrap500Error, ...validInit } = mergedInit
      const res = await fetch(url, validInit)

      if (!res.ok) {
        logger.error(
          `[API failed - ${init.method ?? "GET"}/${
            res.status
          }]: ${url} with params ${validInit.body}`
        )

        const json = await (res as ErrResponse).json()
        if (autoWrap500Error && res.status === 500) {
          json.error =
            "Something went wrong, our team is notified and is working on the fix, stay tuned."
        } else {
          json.error = capFirst(json.error)
        }
        json.ok = false
        return json
      } else {
        logger.info(
          `[API ok - ${init.method ?? "GET"}/${
            res.status
          }]: ${url} with params ${validInit.body ?? "{}"}`
        )
        const json = await (res as OkResponse<T>).json()
        json.ok = true
        return json
      }
    } catch (e: any) {
      logger.error(
        `[API failed ${init.method ?? "GET"}/request_not_sent]: ${e.message}`
      )
      return {
        ok: false,
        data: null,
        error:
          "Something went wrong, our team is notified and is working on the fix, stay tuned.",
      }
    }
  }
}
