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
    var target = 'http://movie.douban.com/subject_search?search_text=' + request.params.keyword;
    if (request.query.start) {
      target += '&start=' + request.query.start;
    }
    console.log(target)

    helpers.fetch(target, (error, response, body) => {
      var $ = cheerio.load(body);
      var json = {
        subjects: parseList($),
        pagination: getPagination($)
      };

      reply(json);
    });
  }
};

function parseList($) {
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
      description: item.find('.pl2 > .pl').text().trim(),
      star: item.find('.rating_nums').text().trim(),
      ratingCount: item.find('.star .pl').text().trim()
    }, itemScheme));
  });

  return items;
}

function getPagination($) {
  return {
    prev: getPaginationUrl($('.paginator .prev a[href]').attr('href')),
    next: getPaginationUrl($('.paginator .next a[href]').attr('href'))
  }
}

function getPaginationUrl(href) {
  href = href || ''
  var keyword = (href.match(/search_text=([^&]+)/)||[]).pop();
  var start = (href.match(/start=(\d+)/)||[]).pop();
  if (keyword && start) {
    return '/search/' + keyword + '?' + 'start=' + start;
  } else {
    return null;
  }
}
