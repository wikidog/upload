const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  // app.use(proxy('/chunksdone', { target: 'http://localhost:5000/' }));
  // app.use(proxy('/upload', { target: 'http://localhost:5000/' }));
  // app.use(proxy('/uploads', { target: 'http://localhost:5000/' }));

  app.use(proxy('/chunksdone', { target: 'http://dekostactrs04.ugs.com/' }));
  app.use(proxy('/upload', { target: 'http://dekostactrs04.ugs.com/' }));
  app.use(proxy('/uploads', { target: 'http://dekostactrs04.ugs.com/' }));
};
