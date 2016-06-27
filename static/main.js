if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(reg => {
    // Registration was successful
    console.log(`ServiceWorker registration successful ` +
        `with scope: ${reg.scope}`);
  }).catch(err => {
    // registration failed :(
    console.log(`ServiceWorker registration failed: ${err}`);
  });
}

let state = {
  tweets: []
};
const startSpinner = () => {
  const spin = document.querySelector('.spin');
  spin.className += ' spin_visible';
};
const stopSpinner = () => {
  const spin = document.querySelector('.spin');
  const spinClassName = spin.className;
  spin.className = spinClassName.replace('spin_visible', '');
};
const showErrorMessage = (err) => {
  console.error(err);
};

const linkText = (sourceText, urls) => {
  let result = '';
  let textPointer = 0;

  if (urls) {
    urls.forEach(url => {
      result += sourceText.substring(textPointer, url.indices[0]) + `<a href="${url.url}">${url.display_url}</a>`;
      textPointer = url.indices[1];
    });
  }
  result += sourceText.substring(textPointer);
  return result;
};
const tagText = (sourceText) => sourceText.replace(/\B#(\w+)/g, '<a href="https://twitter.com/hashtag/$1?src=hash">#$1</a>');

const renderTweets = (data) => {
  let html = data.map(tweet => {
    const date = moment(new Date(tweet.created_at)).fromNow();
    let tweetText = tweet.text;
    let imgHtml = ``;
    if (tweet.entities.media) {
      let media = tweet.entities.media[0];
      imgHtml += `<img class="tweet__img" src="${media.media_url_https}"/>`;
      tweetText = tweetText.substring(0, media.indices[0]);
    }
    let textHtml = tagText(linkText(tweetText, tweet.entities.urls));

    let tweetHtml = `<div class="tweet">
      <div class="tweet__content">
        <div class="tweet__avatar">
          <img class="tweet__avatar-img" src="${tweet.user.profile_image_url_https}"/>
        </div>
        <div>
          <span class="tweet__name"><a href="https://twitter.com/${tweet.user.screen_name}">${tweet.user.name}</a></span>
          <span class="tweet__login"><a href="https://twitter.com/${tweet.user.screen_name}">@${tweet.user.screen_name}</a></span>
          <span class="tweet__date">${date}</span>
        </div>
        <div class="tweet__text">${textHtml}</div>
        ${imgHtml}
      </div>
    </div>`;
    return tweetHtml;
  }).join('');
  return html;
};

const updatePage = () => {
  document.querySelector('.content__tweets').innerHTML = renderTweets(state.tweets);
};

let networkDataReceived = false;

startSpinner();

// fetch fresh data
const networkUpdate = fetch('/ajax/get-frontend-tweets')
  .then(response => response.json())
  .then(data => {
    networkDataReceived = true;
    state.tweets = data.statuses;
    updatePage();
  });

// fetch cached data
caches.match('/ajax/get-frontend-tweets').then(response => {
  if (!response) throw Error("No data");
  return response.json();
}).then(data => {
  // don't overwrite newer network data
  if (!networkDataReceived) {
    state.tweets = data.statuses;
    updatePage();
  }
  // we didn't get cached data, the network is our last hope:
}).catch(() => networkUpdate)
.catch(showErrorMessage).then(stopSpinner);

const shake = (cb) => {
  let count = 3;
  const shiftLeft = () => {
    document.body.style.marginLeft = '-15px';
    setTimeout(shiftRight, 100);
  };
  const shiftRight = () => {
    count--;
    document.body.style.marginLeft = '15px';
    if (count) {
      setTimeout(shiftLeft, 100);
    } else {
      document.body.style.marginLeft = 0;
      cb();
    }
  };
  shiftLeft();
};

document.querySelector('.header__logo').addEventListener('click', function(e) {
  shake(() => {
    state.tweets = _.shuffle(state.tweets);
    updatePage();
  });
});
