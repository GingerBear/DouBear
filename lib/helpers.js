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

module.exports = {
  getSubjectId: (href) => {
    return ((href || '').match(/subject\/(\d+)/) || []).pop();
  },
  fetch: (uri, cb) => {
    request.get(uri, cb);
  }
}