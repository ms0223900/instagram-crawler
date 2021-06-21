const fetch = require('node-fetch')

async function queryData(cursor) {
  const API = 'https://www.facebook.com/api/graphql/';
  const data = {
      'variables': {
          "cursor": cursor,
          "UFI2CommentsProvider_commentsKey": "ProfileCometTimelineRoute",
          "afterTime": null,
          "beforeTime": null,
          "count": 3,
          "displayCommentsContextEnableComment": null,
          "displayCommentsContextIsAdPreview": null,
          "displayCommentsContextIsAggregatedShare": null,
          "displayCommentsContextIsStorySet": null,
          "displayCommentsFeedbackContext": null,
          "feedLocation": "TIMELINE",
          "feedbackSource": 0,
          "focusCommentID": null,
          "memorializedSplitTimeFilter": null,
          "omitPinnedPost": true,
          "postedBy": null,
          "privacy": null,
          "privacySelectorRenderLocation": "COMET_STREAM",
          "renderLocation": "timeline",
          "scale": 1.5,
          "should_show_profile_pinned_post": true,
          "stream_count": 1,
          "taggedInOnly": null,
          "useDefaultActor": false,
          "id": "100050607693965"
      },
      'doc_id': 4076462995767329,
  }

  return await fetch(API, {
      "headers": {
          "accept": "*/*",
          "accept-language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,la;q=0.5",
          "content-type": "application/x-www-form-urlencoded",
          "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"91\", \"Chromium\";v=\"91\"",
          "sec-ch-ua-mobile": "?0",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "viewport-width": "1862",
          "x-fb-friendly-name": "ProfileCometTimelineFeedRefetchQuery",
          "x-fb-lsd": "cMIGXiAY16Xv6sX8PVCfq9"
      },
      "referrer": "https://www.facebook.com/mumumamagogo",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": `variables=${JSON.stringify(data.variables)}&doc_id=${data.doc_id}&av=100000107785615&__user=100000107785615&__a=1&__dyn=7AzHxqU5a5Q1ryaxG4VuC0BVU98nwgUb84ibyQdwSwAyU8EW0CEboG4E6icwJwpUe8hw47w5nCxS320om78-221Rwwwg8vy8465o-cwfG12wOKi8wGwFyE2ly87e2l2UtG7o4y0Mo4G4UcUC68f85qfK6E7e58jwGzEaE5e7oqBwJK5Umxm5oe8aUlxfxmu3W3y1MBwxy88EbUbE7u2am1AyES&__csr=gvl3c478TsbinfOW6NIrdkySDO9tiYBb6lFmyidlAiJQXOA_IOhnh5IB7QQQQXhGGVquDCWLKUFq-yfKFepbGJdamQCDjAHnVqy8OlLAV5AWCjKhUx6ymh93aGqml6yaCAGVWVF9kbVd5xymFWiiKiF8O-nCUGi-59kV8Z3VGGUixe8GfCK8AxiaBK-FbqGuazE-5bxa5WBByGKmbU8Ve46EtwMxCay88oGqK22FUzmuU-48hAzryp8gyXG58C2aieyEjAx2fzogxudAG78bUG4Ft12ewBy9oeZwOxxzEC6ppazU5W6ubyEyi68eoc8K7p43aaypo9omDwjocUO7orG0yU0Laag0ocwdfwlo1YE1wF40iq02Pa0eBw75c0iJxqIi2W680Ce2Kbw8-0p-0Xm5UIAk05682uo0ep81b8EJ02A84J0&__req=s&__hs=18799.EXP2%3Acomet_pkg.2.1.0.0&dpr=1.5&__ccg=EXCELLENT&__rev=1004003765&__s=e0kt02%3Anddru1%3Afljobc&__hsi=6976182287695837750-0&__comet_req=1&fb_dtsg=AQHHc-zdSqlQ9fA%3AAQFdRQ5vyaghigU&jazoest=22691&lsd=LU1nCL2OApkaX9w1DoBQY-&__spin_r=1004003765&__spin_b=trunk&__spin_t=1624269012&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=ProfileCometTimelineFeedRefetchQuery&server_timestamps=true`,
      "method": "POST",
      "mode": "cors",
      "credentials": "include"
  })
  .then(res=>res)
  .then(res=>{
      return res.text();
  });
}

function parseQueriedStoryData(data) {
  try { 
    const devided = data.split('\n');
    const allParsed = devided.map(d => JSON.parse(d));
    const parsedPostData = allParsed[0];
    const otherPosts = allParsed.filter(a => a.label === 'ProfileCometTimelineFeed_user$stream$ProfileCometTimelineFeed_user_timeline_list_feed_units')
    const pageInfo = allParsed.find(a => a.label === 'ProfileCometTimelineFeed_user$defer$ProfileCometTimelineFeed_user_timeline_list_feed_units$page_info');

    return ({
      parsedPostData,
      otherPosts,
      pageInfo,
      allParsed,
    });
  } catch(e) {
    console.log(e);
    return null;
  }
}

(async () => {
  let fetchPostsAmount = 5;
  let i = 0;
  let fetchedPosts = [];
  let fetchedDataList = [];
  let cursor = undefined;

  try {
    while(i < fetchPostsAmount) {
      const res = await queryData(cursor);
      const parsed = parseQueriedStoryData(res);
      console.log(`${i + 1} posts fetched.`);
      console.log(`cursor: ${cursor}`);
      if(!parsed) {
        break;
      } else { 
        fetchedPosts.push(parsed.parsedPostData);
        fetchedPosts.push(...parsed.otherPosts)
        fetchedDataList.push(parsed.allParsed);
        cursor = parsed.pageInfo.data.page_info.end_cursor;
      }
      i++;
    }
  } catch(e) {
    console.log(e);
  }
  console.log(fetchedPosts);
  console.log(`All fetched data list: ${fetchedDataList}`)
})()
