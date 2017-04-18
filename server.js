var rp = require('request-promise');

const Koa = require('koa');
const app = new Koa();

app.use(async function (ctx, next) {
  let ipAddress = ctx.request.ip;
  await rp('http://ip-api.com/json/')
    .then(function (resp) {
      let json = JSON.parse(resp);
      return json;
    })
    .then((json) => {
      ctx.request.geoLocation = json;
      return ctx.request.geoLocation;
    })
    .then(async function (geoLocation) {
      let {lat, lon} = geoLocation;
      let appId = '6b2eb6edce79fa8f02b00bc4a4da5b46'
      await rp(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=${appId}`)
      .then(function (resp) {
        let json = JSON.parse(resp);
        return json;
      })
      .then((json) => {
        ctx.request.weatherData = json;
        return ctx.request.weatherData;
      })
      .catch(function (err) {
        ctx.throw(err);
      })
    })
  ctx.body = JSON.stringify(Object.assign({},
    {geoLocation: ctx.request.geoLocation},
    {weatherData: ctx.request.weatherData}), null, 4);
  await next();
});

app.listen(3000);
