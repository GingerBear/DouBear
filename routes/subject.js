var cheerio = require('cheerio');
var _ = require('lodash');
var helpers = require('../lib/helpers');


module.exports = {
  method: 'GET',
  path: '/subject/{subjecteId}',
  handler: (request, reply) => {
    var target = 'http://movie.douban.com/subject/' + request.params.subjecteId + '/';
    helpers.fetch(target, (error, response, body) => {
      var json = parseSubject(body);
      reply(json);
    });
  }
};

function parseSubject(body) {
  var $ = cheerio.load(body);
  var subjectScheme = {
    title: '',
    image: '',
    description: '',
    attributes: [],
    star: 0,
    ratingCount: 0,
    images: [],
    related: [],
    shortReviews: {},
    longReviews: {},
  };

  return _.defaults({
    title: $('h1').text().trim(),
    image: $('.nbgnbg img').attr('src'),
    description: $('#link-report [property="v:summary"]').text().trim(),
    star: 0,
    ratingCount: 0,
    attributes: parseAttributes($),
    images: parseImages($),
    related: parseRelated($),
    shortReviews: parseShortReviews($),
    longReviews: parseLongReviews($),
  }, subjectScheme);
}

function parseAttributes($) {
  var attrs = [];
  $('#info > span').filter((i, item) => $(item).find('.pl').length > 0).map((i, item) => {
    var values = [];
    $(item).find('.attrs > a').each((i, it) => {
      values.push({
        name: $(it).text().trim(),
        href: $(it).attr('href'),
      });
    });
    attrs.push({
      key: $(item).find('.pl').text().trim(),
      values: values,
    });
  });
  return attrs;
}

function parseImages($) {
  var images = [];
  $('.related-pic-bd li').each((i, li) => {
    var li = $(li);
    images.push({
      href: li.find('a').attr('href'),
      src: li.find('img').attr('src')
    });
  });
  return images;
}

function parseRelated($) {
  var related = [];
  $('.recommendations-bd dl').each((i, dl) => {
    var dl = $(dl);
    related.push({
      title: dl.find('dd a').text().trim(),
      href: dl.find('dd a').attr('href'),
      image: dl.find('img').attr('src')
    });
  });
  return related;
}

function parseShortReviews($) {
  var reviews = [];
  var moreLink = $('#hot-comments > a[href]').attr('href');

  $('#hot-comments .comment-item').each((i, comm) => {
    var comm = $(comm);
    reviews.push({
      reviewer: comm.find('.comment-info a[href]').text().trim(),
      stars: (comm.find('.comment-info .rating').attr('class') || 'allstarnull').match(/allstar(\w+)/).pop(),
      date: comm.find('.comment-info span').last().text().trim(),
      votes: comm.find('.comment-vote .votes').text().trim(),
      content: comm.find('.comment > p').text().trim()
    });
  });

  return {reviews, moreLink};
}

function parseLongReviews($) {
  var reviews = [];
  var moreLink = $('.review-more > a[href]').attr('href');

  $('#review_section .review').each((i, review) => {
    var review = $(review);
    reviews.push({
      reviewer: review.find('.review-hd-avatar').attr('title'),
      href: review.find('.review-hd h3 a[onclick]').attr('href'),
      title: review.find('.review-hd h3 a[onclick]').text().trim(),
      stars: (review.find('[class*="allstar"]').attr('class') || 'allstarnull').match(/allstar(\w+)/).pop(),
      date: review.find('.review-hd-info > *').remove() && review.find('.review-hd-info').text().trim(),
      votes: review.find('.review-short .review-short-ft').find('[id*="useful"]').text().trim(),
      content: review.find('.review-short > span').text().trim()
    });
  });
  
  return {reviews, moreLink};
}