import pino from 'pino'
import invariant from 'tiny-invariant'

// Also pino should be initialized with the payload config so it has to use a singleton pattern

let __logger: pino.Logger | undefined

export const getLogger = () => {
  invariant(__logger, 'Logger not initialized')
  return __logger
}

export type LoggerConfig = {
  level: pino.Level
}

export const initLogger = (config: LoggerConfig) => {
  __logger = pino({
    level: config.level,
  })
  return __logger
}

// export const logger = getLogger()
