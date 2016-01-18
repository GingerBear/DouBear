var Request = require('request');

var defaultRequestHeaders = {
  'User-Agent'      : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
  'Accept'          : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Charset'  : 'utf-8;q=0.7,ISO-8859-1;q=0.4,*;q=0.3',
  'Accept-Encoding' : 'gzip',
  'Accept-Language' : 'en-US,en;q=0.8',
  'Cache-Control'   : 'no-cache',
  'Connection'      : 'keep-alive'
};

var request = Request.defaults({
  headers: defaultRequestHeaders,
  gzip: true
});

function paralellFetch(urls, callback) {
  var result = [];
  var counter = 0;

  for(var i = 0; i < urls.length; i++) {
    (function(i) {
      fetch(urls[i], function(error, response, body) {
        if (error) {
          result[i] = error;
        } else {
          result[i] = body;
        }

        counter++;

        if (counter === urls.length) {
          return callback(null, result);
        }
      });
    })(i);
  }
}

function fetch(uri, cb) {
  return request.get(uri, cb);
}

module.exports = {
  getSubjectId: (href) => {
    return ((href || '').match(/subject\/(\d+)/) || []).pop();
  },
  fetch: fetch,
  paralellFetch: paralellFetch
}