// const fetch = require('node-fetch')
(() => {
  const configs = {
    defaultFetchFeedsAmount: 3,
    GRAPHQL_API: 'https://www.facebook.com/api/graphql/',
    regexp: {
      URL: /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
    },
    profiles: [
      {
        profileName: '德州媽媽沒有崩潰',
        pageUrl: 'https://www.facebook.com/mumumamagogo',
        id: '100050607693965',
        docId: 4309687509094181,
      },
      {
        profileName: "林叨囝仔 The Lins' Kids",
        pageUrl: 'https://www.facebook.com/thelinskids',
        id: '1226268757449496',
        docId: 4580180615344865,
      },
    ],
  }

  const StoryDataExtracter = {
    getStoryMetaData: (story) => {
      return story.node.comet_sections.context_layout.story.comet_sections.metadata;
    },
    getStoryTimeStampMeta(story) {
      const storyMetaData = this.getStoryMetaData(story);
      const timeStamp = storyMetaData.find(s => (
        s.__typename === 'CometFeedStoryMinimizedTimestampStrategy'
      ));
      return timeStamp;
    },

    getStoryPostLink(story) {
      const timeStamp = this.getStoryTimeStampMeta(story);
      return timeStamp ? timeStamp.story.url : '';
    },

    getStoryAttachments: (story) => (
      story.node.comet_sections.content.story.attachments
    ),

    getStoryFeedback: (story) => {
      const feedback = story.node.comet_sections.feedback.story.feedback_context.feedback_target_with_context.comet_ufi_summary_and_actions_renderer.feedback
      const reactionCount = feedback.reaction_count.count;
      const shareCount = feedback.share_count.count;
      return ({
        reactionCount,
        shareCount,
      })
    },

    getStoryComments: (story) => {
      const feedbackCtx = story.node.comet_sections.feedback.story.feedback_context.feedback_target_with_context;
      const comments = feedbackCtx.display_comments;
      return comments;
    },

    getLinksFromMessageTxt: (txt='') => {
      return txt.match(configs.regexp.URL);
    },

    getStoryMessageText(story) {
      return story.node.comet_sections.content.story.comet_sections.message.story.message.text;
    },

    getCreationTime(story) {
      const timeStamp = this.getStoryTimeStampMeta(story);
      const originCreationTime = timeStamp ? timeStamp.story.creation_time : 0;
      return originCreationTime * 1000;
    },

    extractSingleStory(storyData) {
      const creationTime = this.getCreationTime(storyData);
      const storyMessageText = this.getStoryMessageText(storyData);
      const links = this.getLinksFromMessageTxt(storyMessageText);
      const attachments = this.getStoryAttachments(storyData);
      const postLink = this.getStoryPostLink(storyData);
      const feedback = this.getStoryFeedback(storyData);

      return ({
        postLink,
        attachments,
        links,
        creationTime,
        storyMessageText,
        feedback,
      })
    }
  }

  const ProfileStoriesParser = {

    parseQuriedTextToJson: (txt='') => {
      const devided = txt.split('\n');
      const allParsed = devided.map(d => JSON.parse(d));
      return allParsed;
    },

    getDataType: (allParsed=[]) => {
      if(allParsed.length === 0) {
        return ''
      } else {
        const firstParsed = allParsed[0];
        if(firstParsed.data.node.__typename === 'Page') {
          return 'PAGE'
        }
        if(firstParsed.data.node.__typename === 'User') {
          return 'USER'
        }
      }
      return ''
    },

    getStoriesAndPageInfoFromUserTypeData(allParsed=[]) {
      let stories = [];
      let pageInfo = undefined;

      const userStories = allParsed[0].data.node.timeline_list_feed_units.edges;
      stories.push(...userStories);
      const otherStories = allParsed.filter(a => (
        a.label === 'ProfileCometTimelineFeed_user$stream$ProfileCometTimelineFeed_user_timeline_list_feed_units'
      )).map(p => p.data);
      stories.push(...otherStories);
      const extractedStories = stories.map(s => StoryDataExtracter.extractSingleStory(s));
      const pageInfoData = allParsed.find(a => (
        a.label === 'ProfileCometTimelineFeed_user$defer$ProfileCometTimelineFeed_user_timeline_list_feed_units$page_info'
      ));
      pageInfo = pageInfoData ? pageInfoData.data.page_info : undefined;

      return ({
        stories,
        extractedStories,
        pageInfo,
      })
    },

    getStoriesAndPageInfoFromPageTypeData(allParsed=[]) {
      const timeLineFeedUnits = allParsed[0].data.node.timeline_feed_units;
      const stories = timeLineFeedUnits.edges;
      const extractedStories = stories.map(s => StoryDataExtracter.extractSingleStory(s));
      const pageInfo = timeLineFeedUnits.page_info;

      return ({
        stories,
        extractedStories,
        pageInfo,
      })
    },

    parseAndGetAllStories(dataTxt='') {
      try {
        const allParsed = this.parseQuriedTextToJson(dataTxt);
        const dataType = this.getDataType(allParsed);
        
        if(dataType === 'PAGE') {
          return this.getStoriesAndPageInfoFromPageTypeData(allParsed);
        }
        else if(dataType === 'USER') {
          return this.getStoriesAndPageInfoFromUserTypeData(allParsed);
        }
        else {
          return null;
        }
      } catch(e) {
        console.log(e);
        return null;
      }
    },
  }

  class ProfileTimelineFeedQuerier {
    constructor(options={
      profileName: '',
      docId: 0,
      id: '',
    }, initCursor=undefined) {
      this.profileName = options.profileName;
      this.docId = options.docId;
      this.id = options.id;
      this.cursor = initCursor;
    }

    parseQueriedStoryData(dataTxt='') {
      return ProfileStoriesParser.parseAndGetAllStories(dataTxt)
    }

    #makeVariables() {
      return ({
        "cursor": this.cursor,
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
        "id": this.id,
      })
    }
    #makeFetchOptions() {
      const data = {
          'variables': this.#makeVariables(),
          'doc_id': this.docId,
      }
      return ({
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
            "x-fb-lsd": "Iqdy_lz1jIG43_WjsnepFt"
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": `variables=${JSON.stringify(data.variables)}&doc_id=${data.doc_id}&av=100000107785615&__user=100000107785615&__a=1&__dyn=7AzHxqU5a5Q1ryaxG4VuC0BVU98nwgUb84ibyQdwSwAyU8EW0CEboG4E6icwJwpUe8hw2nVEtwMw65xOfwwwto88427Uy11xmfz83WwgEcHAy8aEaoG0Boy1PwBgK7qxS18wc61axe3e9xy3O1mzXxG1Pxi4UaEW2G1jxS6Fobrxu5Elxm3y2K5ojUlDw-wUws9o8oy2a2-2W1TwyBwp8Gdw&__csr=g84dN4BR92clOhind6Nq59q48TvbEWARlRRb9fGB9kWHlFd8Le9-F4KWhWuXqLWoxDjrBZ5HOuBhvinh4u-XUSmFfKl4HqiGQHX8zyfRWGmUBbLximuiLKGxi9gJ6F4ypdeiAiiuVH-jAJ915keFKZqhqDKituaQ9CzHgmKmvy8HV8cAmqUyK4bXhoN2Gy6qfyp448ky44aVUW3imaxdp8hxW7t2ouBUyaxGex2cAKi9BXAxidUOdyk5EWfVUyucDyqx-maGm49ECFWyaDyouwTgaA8yXx4wswpp8-9yEhCy8jAwwUCaK2yqm3W1cBxG58a8jz8Obxm264Ujxuaxe4U4R3EuwxwFwk80h3w3zGg28w5MUtw3h4q3W1gyE0aw80I-05g3w4LobE-4PedwFw7pwvo0x-0g2dkq1yAg0Dq0se0VE7u9wZw0VJ40mU0Zu&__req=x&__hs=18802.EXP2%3Acomet_pkg.2.1.0.0&dpr=1.5&__ccg=EXCELLENT&__rev=1004029258&__s=qejb0n%3Atc8bpz%3Akh3994&__hsi=6977319740667478675-0&__comet_req=1&fb_dtsg=AQHePYcLrK1JQ44%3AAQFTqbHCA8_XGPM&jazoest=22400&lsd=oPWO640KGIFnQ34kWbFSKY&__spin_r=1004029258&__spin_b=trunk&__spin_t=1624533846&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=ProfileCometTimelineFeedRefetchQuery&server_timestamps=true`,
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
      })
    }

    #updateCursor(cursor='') {
      this.cursor = cursor;
    }

    querySingleFeed() {
      const API = configs.GRAPHQL_API;
      const fetchOptions = this.#makeFetchOptions()

      return fetch(API, fetchOptions)
        .then(res=>res)
        .then(res=>{
            return res.text();
        })
    }

    async queryFeeds(fetchPostsAmount = 5) {
      let i = 0;
      let fetchedStories = [];
      let allExtractedStories = [];
      let fetchedDataList = [];

      try {
        while(i < fetchPostsAmount) {
          const res = await this.querySingleFeed();
          const parsed = this.parseQueriedStoryData(res);
          console.log(`${i + 1} feeds fetched.`);
          // console.log(`cursor: ${cursor}`);
          if(!parsed) {
            break;
          } else { 
            fetchedStories.push(...parsed.stories);
            allExtractedStories.push(...parsed.extractedStories);
            fetchedDataList.push(parsed.allParsed);
            const newCursor = parsed.pageInfo.end_cursor;
            this.#updateCursor(newCursor);
          }
          i++;
        }
      } catch(e) {
        console.log(e);
      }
      return ({
        profileName: this.profileName, 
        allExtractedStories,
        fetchedStories,
      })
    }
  }

  async function queryFeeds() {
    let allFetchedFeeds = []
    for await (const profile of configs.profiles) {
      const feedQuerier = new ProfileTimelineFeedQuerier({
        profileName: profile.profileName,
        docId: profile.docId,
        id: profile.id,
      })
      const fetchedFeeds = await feedQuerier.queryFeeds(configs.defaultFetchFeedsAmount)
      allFetchedFeeds.push(fetchedFeeds)
    }
    return allFetchedFeeds;
  }

  queryFeeds()
    .then(res => {
      console.log(res);
    })
})()
