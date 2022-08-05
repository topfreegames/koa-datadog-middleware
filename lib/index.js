const StatsD = require("hot-shots")

module.exports = function(options) {
  options = options || {}

  const metric = options.metric || "koa.router.response_time_ms"
  const reportingMethod = options.reportingMethod || "histogram"

  options.maxBufferSize = options.maxBufferSize || 1000
  options.bufferFlushInterval = options.bufferFlushInterval || 1000
  options.cacheDns = (options.cacheDns != undefined) ? options.cacheDns : true
  options.sampleRate = options.sampleRate || 1

  const client = new StatsD(options)

  return function *reporter(next) {
    const start = process.hrtime()
    try {
      yield next
    } catch(err) {
      report(client, metric, reportingMethod, this, start, err)
      throw err
    }
    report(client, metric, reportingMethod, this, start, null)
  }
}

function report(client, metric, reportingMethod, ctx, start, err) {
  let matchedRoute = ctx._matchedRoute
  if (!matchedRoute && ctx.matched && ctx.matched.length > 0) {
    matchedRoute = ctx.matched[0].path
  } else if (!matchedRoute && ctx.method !== 'OPTIONS') {
    // TODO: remove dirty OPTIONS validation and fix it properly
    matchedRoute = ctx.path
  }

  const status = err
    ? (err.status || 500)
    : (ctx.status || 404);

  // get duration in milliseconds
  const diff = process.hrtime(start);
  const seconds = diff[0];
  const nanoseconds = diff[1];
  const duration = (seconds * 1000) + (nanoseconds / 1E6);

  let tags = [
    `status_code:${status}`,
    `path:${matchedRoute}`,
    `method:${ctx.method}`
  ]
  if (ctx.state && ctx.state.datadog && Array.isArray(ctx.state.datadog)) {
    tags = tags.concat(ctx.state.datadog)
  }

  if (reportingMethod === "histogram") {
    client.histogram(metric, duration, tags)
  } else {
    client.distribution(metric, duration, tags)
  }
}
