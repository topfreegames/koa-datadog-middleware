koa-datadog-middleware
======================

This middleware will report metrics to datadog regarding an app's response time and number of requisitions spplited by the tags (status_code, path and method).

It reports metrics using dogstatsd [histograms](https://docs.datadoghq.com/developers/dogstatsd/#histograms).

### how to use
Import it and register as a middleware. e.g.
```
var ddog = require('koa-datadog-middleware')
app.use(ddog())
```

### configuration / customization
The middleware is based on [hot-shots](https://github.com/brightcove/hot-shots) lib, it will pass an options map forward to hot-shots, so the configuration are the same:

* host: The host to send stats to default: localhost
* port: The port to send stats to default: 8125
* prefix: What to prefix each stat name with default: ''
* suffix: What to suffix each stat name with default: ''
* globalize: Expose this StatsD instance globally? default: false
* cacheDns: Cache the initial dns lookup to host default: **true**
* mock: Create a mock StatsD instance, sending no stats to the server? default: false
* globalTags: Tags that will be added to every metric default: []
* maxBufferSize: If larger than 0, metrics will be buffered and only sent when the string length is greater than the size. default: **1000**
* bufferFlushInterval: If buffering is in use, this is the time in ms to always flush any buffered metrics. * * default: 1000
* telegraf: Use Telegraf's StatsD line protocol, which is slightly different than the rest default: false
* sampleRate: Sends only a sample of data to StatsD for all StatsD methods. Can be overriden at the method level. default: 1
* errorHandler: A function with one argument. It is called to handle various errors. default: none, errors are thrown/logger to console

Note that two options (cacheDns and maxBufferSize) differs from the original lib.

#### Example

```
const ddog = require('koa-datadog-middleware')

const config = {
    "host": my.statsd.host.com,
    "port": 8133,
    "cacheDns": true
}

app.use(ddog(config))
```
