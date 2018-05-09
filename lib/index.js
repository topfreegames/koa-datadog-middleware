const StatsD = require("hot-shots")

module.exports = function(options) {
  options = options || {}
  const metric = options.metric || "koa.response_time_ms"

  options.maxBufferSize = options.maxBufferSize || 1000
  options.bufferFlushInterval = options.bufferFlushInterval || 1000
  options.cacheDns = (options.cacheDns != undefined) ? options.cacheDns : true
  options.sampleRate = options.sampleRate || 1

  console.log("Criando cliente statsd");
  const client = new StatsD(options);
  console.log("Cliente statsd criado");
  console.log(client);
  client.increment("start");

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
  console.log("METODO REPORT FOI")
  console.log("MATCHED ROUTE", ctx._matchedRoute)
  console.log("MATCHED ROUTE NAME", ctx._matchedRouteName)
  //console.log("CTX", ctx)
  //console.log("REQUEST", ctx.)
  let matchedRoute = ctx._matchedRoute
  if (!matchedRoute && ctx.matched && ctx.matched.length > 0) {
    matchedRoute = ctx.matched[0].path
  } else if (!matchedRoute) {
    matchedRoute = ctx.path
  }

  const status = err
    ? (err.status || 500)
    : (ctx.status || 404);
  const error = status > 399
  const duration = new Date - start;
  const tags = [
    `status:${status}`,
    `route:${ctx.method.toUpperCase()} ${matchedRoute}`,
    `error:${error}`,
    "type:http"
  ]
  client.timing(metric, duration, tags)
}
