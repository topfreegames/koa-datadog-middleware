const StatsD = require("hot-shots")

module.exports = function(options) {
  options = options || {}
  const metric = options.metric || "koa.router.response_time_ms"

  options.maxBufferSize = options.maxBufferSize || 1000
  options.bufferFlushInterval = options.bufferFlushInterval || 1000
  options.cacheDns = (options.cacheDns != undefined) ? options.cacheDns : true
  options.sampleRate = options.sampleRate || 1

  const client = new StatsD(options)
  
  return function *reporter(next) {
    const start = Date.now()
    try {
      yield next
    } catch(err) {
      report(client, metric, this, start, err)
      throw err
    }
    report(client, metric, this, start, null)
  }
}

function report(client, metric, ctx, start, err) {
  const status = err
    ? (err.status || 500)
    : (ctx.status || 404);

  const duration = new Date - start;
  const tags = [
    `status_code:${status}`,
    `path:${ctx.path}`,
    `method:${ctx.method}`
  ]
  client.histogram(metric, duration, tags)
}
