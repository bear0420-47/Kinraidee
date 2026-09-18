import type { Response } from 'express'

type Meta = Record<string, unknown>

export function ok<T>(response: Response, data: T, meta?: Meta) {
  return response.status(200).json(buildBody(data, meta))
}

export function created<T>(response: Response, data: T, meta?: Meta) {
  return response.status(201).json(buildBody(data, meta))
}

export function noContent(response: Response) {
  return response.status(204).send()
}

function buildBody<T>(data: T, meta?: Meta) {
  if (meta) {
    return { data, meta }
  }

  return { data }
}
