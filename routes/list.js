var Request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');
var helpers = require('../lib/helpers');

var defaultRequestHeaders = {
  'User-Agent'      : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
  'Accept'          : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Charset'  : 'utf-8;q=0.7,ISO-8859-1;q=0.4,*;q=0.3',
  'Accept-Encoding' : 'gzip',
  'Accept-Language' : 'en-US,en;q=0.8',
  'Cache-Control'   : 'no-cache',
  'Pragma'          : 'no-cache',
  'Connection'      : 'keep-alive'
};

module.exports = {
  method: 'GET',
  path: '/search/{keyword}',
  handler: function (request, reply) {
    Request({
      uri: 'http://movie.douban.com/subject_search?search_text=' + request.params.keyword,
      headers: defaultRequestHeaders
    }, (error, response, body) => {
      var json = parseList(body);
      reply(json);
    });
  }
};

function parseList(body) {
  var $ = cheerio.load(body);
  var items = [];
  var itemScheme = {
    title: '',
    href: '',
    image: '',
    description: '',
    star: 0,
    ratingCount: 0
  };

  $('.item').each((i, el) => {
    var item = $(el);
    items.push(_.defaults({
      title: (item.find('.pl2 > a[href]').text() || '').replace(/\n/g, '').trim(),
      href: '/subject/' + helpers.getSubjectId(item.find('.pl2 > a[href]').attr('href')),
      image: item.find('.nbg img').attr('src'),
      description: item.find('.pl2 > .pl').text(),
      star: item.find('.rating_nums').text(),
      ratingCount: item.find('.star .pl').text()
    }, itemScheme));
  });

  return items;
}