// const fetch = require('node-fetch')
(() => {
  const configs = {
    // 每次只要替換form body str即可
    defaultFormBodyStr: 'av=100000107785615&__user=100000107785615&__a=1&__dyn=7AzHxqU5a5Q1ryaxG4VuC0BVU98nwgUb84ibyQdwSwAyU8EW0CEboG4E6icwJwpUe8hw2nVEtwMw65xOfwwwto88427Uy11xmfz83WwgEcHzoaEaoG0Boy1PwBgK7qxS18wc61axe3e9xy3O1mzXxG1Pxi4UaEW2G1jxS6Fobrxu5Elxm3y2K5ojUlDw-wAxe1MBwxy88EbUbHwsU8Fo6iazo&__csr=guW1d2AZTdkr34j6gwJW8wEl8kBdkoD8OcmSHniLRhBFlYx4l4O6QXmXSKXCa9BDQXp9qKRh2XKqWqJaiBQF5nVXCV7Zdqy4FZx1WDy4StJ9Ki4KiHYwGaW9BHavKFoKjUPUyFpoy-eohDF16fG9Zy8KeHm-UiGjHGKiEoh9UKml5jDBzCqbCQEGdzGJ151h6LAzp8lyo9oybCWUhwCzppFeaKEJ7wIzoOexq4ahVF-8GUGeGu9yojxx2UR1u25aq5az8-nwMF28jAwEXUhFkbyA58gyolwlUN4VXxW9wByE4ii7UryUiht28kwJzEC7EapK5ovgC3eu6o5a2m1OzoS58foK0s20fRw8q0Bo4PG0LK0_o1So5Oi9w20ofA03tm06wod84-dgCh0DuazQ4KU0y26U2gww4CQ1kw8K0yC0I86u05QE4i9wHw0Y1w6EBl02w8y&__req=f&__hs=18807.EXP2%3Acomet_pkg.2.1.0.0&dpr=1.5&__ccg=EXCELLENT&__rev=1004052785&__s=qw8kgn%3Advrsik%3Arg5jse&__hsi=6979194400383577320-0&__comet_req=1&fb_dtsg=AQHWI3P2SGfN8Tw%3AAQFTAkCPGV0qbps&jazoest=22472&lsd=e8-H2THMLnXUQIoZg9Ln2j&__spin_r=1004052785&__spin_b=trunk&__spin_t=1624970324&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=ProfileCometTimelineFeedRefetchQuery&variables=%7B%22UFI2CommentsProvider_commentsKey%22%3A%22ProfileCometTimelineRoute%22%2C%22afterTime%22%3Anull%2C%22beforeTime%22%3Anull%2C%22count%22%3A3%2C%22cursor%22%3A%22AQHRy8HG3fqB6wvWFNJK9XKVqboQz6a8N5UtKXuCpR-HrGOc4PAHYQKmZNvR-Pl_kn9otW266B3BjHTvqZZPbVeLxSl_Q4B99w3GbHA2HJTzSjMe19NZBeFqfmFcdqr6xOM1%22%2C%22displayCommentsContextEnableComment%22%3Anull%2C%22displayCommentsContextIsAdPreview%22%3Anull%2C%22displayCommentsContextIsAggregatedShare%22%3Anull%2C%22displayCommentsContextIsStorySet%22%3Anull%2C%22displayCommentsFeedbackContext%22%3Anull%2C%22feedLocation%22%3A%22TIMELINE%22%2C%22feedbackSource%22%3A0%2C%22focusCommentID%22%3Anull%2C%22memorializedSplitTimeFilter%22%3Anull%2C%22omitPinnedPost%22%3Atrue%2C%22postedBy%22%3Anull%2C%22privacy%22%3Anull%2C%22privacySelectorRenderLocation%22%3A%22COMET_STREAM%22%2C%22renderLocation%22%3A%22timeline%22%2C%22scale%22%3A1.5%2C%22should_show_profile_pinned_post%22%3Atrue%2C%22stream_count%22%3A1%2C%22taggedInOnly%22%3Anull%2C%22useDefaultActor%22%3Afalse%2C%22id%22%3A%22100050607693965%22%7D&server_timestamps=true&doc_id=4801601979866648',
    options: {
      defaultFetchFeedsAmount: 3,
      // dev會保留fetchedStories等等的原始資料
      isDev: false,
      isFilteringTodayPosts: false,
      isFilteringPostsWithLinks: false,
    },
    GRAPHQL_API: 'https://www.facebook.com/api/graphql/',
    regexp: {
      URL: /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
    },
    profiles: [
      {
        profileName: '德州媽媽沒有崩潰',
        pageUrl: 'https://www.facebook.com/mumumamagogo',
        id: '100050607693965',
        docId: 4801601979866648,
      },
      {
        profileName: "林叨囝仔 The Lins' Kids",
        pageUrl: 'https://www.facebook.com/thelinskids',
        id: '1226268757449496',
        docId: 4580180615344865,
      },
    ],
  }

  const locales = {
    zh: {
      postLink: '貼文連結',
      creationTime: '發文時間',
      attachments: '貼文附件',
      feedback: '貼文反饋',
      linksInPost: '貼文內連結',
      messageText: '貼文內容'
    }
  }

  const StoryMarkdownParser = {
    parseLinks: (linksData) => {
      const linksStr = linksData.links ? linksData.links.join('\n') : '無連結';
      return `### ${linksData.name}` + '\n' + linksStr;
    },

    convertSingleExtractedStory(extractedStory, storyIndex=0) {
      const res = 
        `## 貼文: ${storyIndex + 1}` + '\n' + 
        `### ${extractedStory.creationTime.name}` + '\n' + (extractedStory.creationTime.timeLocaleStr) + '\n' +
        `### ${extractedStory.postLink.name}` + '\n' + extractedStory.postLink.link + '\n' +
        this.parseLinks(extractedStory.links) + '\n' +
        `### ${extractedStory.storyMessageText.name}` + '\n' + (extractedStory.storyMessageText.text) + '\n';
      return res;
    },

    convertToMarkdownFormat(storyData) {
      const storiesStr = storyData.allExtractedStories.map((s, i) => this.convertSingleExtractedStory(s, i)).join('\n\n');
      return `# ${storyData.profileName}\n${storiesStr}`;
    },

    parseStoryDataList(stories=[]) {
      return stories.map(s => this.convertToMarkdownFormat(s)).join('\n\n')
    }
  }

  class FileDownloader {
    constructor(exportName='') {
      this.exportName = exportName || this.getFileExportName();
    }

    getFileExportName() {
      const today = new Date();
      const dateArr = [
        today.getFullYear(),
        today.getMonth() + 1,
        today.getDate(),
      ]
      const timesArr = [
        today.getHours(),
        today.getMinutes(),
        today.getSeconds(),
      ]
      return dateArr.join('-') + '-' + timesArr.join(':')
    }

    donwloadFile(dataStr='', fileFormat='.json') {
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", this.exportName + fileFormat);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      console.log('File download completed.')
    }

    downloadJsonFile(jsonData) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonData));
      this.donwloadFile(dataStr);
    }

    downloadMarkdownFile(storyData) {
      const markdownStr = StoryMarkdownParser.parseStoryDataList(storyData)
      const dataStr = "data:text/*;charset=utf-8," + encodeURIComponent(markdownStr);
      this.donwloadFile(dataStr, '.md');
    }
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
      const link = timeStamp ? timeStamp.story.url : '';
      const name = locales.zh.postLink;
      return ({
        name,
        link,
      });
    },

    getStoryAttachments: (story) => (
      story.node.comet_sections.content.story.attachments
    ),

    getStoryFeedback: (story) => {
      const feedback = story.node.comet_sections.feedback.story.feedback_context.feedback_target_with_context.comet_ufi_summary_and_actions_renderer.feedback
      const reactionCount = feedback.reaction_count.count;
      const shareCount = feedback.share_count.count;
      return ({
        name: locales.zh.feedback,
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
      const links = txt.match(configs.regexp.URL)
      return ({
        name: locales.zh.linksInPost,
        links,
      });
    },

    getStoryMessageText(story) {
      const text = story.node.comet_sections.content.story.comet_sections.message.story.message.text
      return ({
        name: locales.zh.messageText,
        text,
      });
    },

    getCreationTime(story) {
      const timeStamp = this.getStoryTimeStampMeta(story);
      const originCreationTime = timeStamp ? timeStamp.story.creation_time : 0;
      const creationTimeMs = originCreationTime * 1000;
      const utcTime = new Date(creationTimeMs).toLocaleString();
      return ({
        name: locales.zh.creationTime,
        creationTimeMs,
        timeLocaleStr: utcTime,
      });
    },

    extractSingleStory(storyData) {
      const creationTime = this.getCreationTime(storyData);
      const storyMessageText = this.getStoryMessageText(storyData);
      const links = this.getLinksFromMessageTxt(storyMessageText.text);
      // const attachments = this.getStoryAttachments(storyData);
      const postLink = this.getStoryPostLink(storyData);
      const feedback = this.getStoryFeedback(storyData);

      return ({
        postLink,
        attachments: configs.options.isDev ? attachments : undefined,
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
      
      let extractedStories = stories.map(s => StoryDataExtracter.extractSingleStory(s));
      extractedStories = this.filterExtractedStoriesWithOptions(extractedStories);

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

    checkPostIsToday: (story) => {
      const postDate = new Date(story.creationTime.creationTimeMs);
      const today = new Date();
      return (
        today.getFullYear() === postDate.getFullYear() &&
        today.getMonth() === postDate.getMonth() &&
        today.getDate() === postDate.getDate()
      )
    },

    filterExtractedStoriesWithOptions(extractedStories=[]) {
      let res = [...extractedStories];
      if(configs.options.isFilteringPostsWithLinks) {
        res = res.filter(r => !!(r.links.links))
      }
      if(configs.options.isFilteringTodayPosts) {
        res = res.filter(r => this.checkPostIsToday(r))
      }
      return res;
    },

    getStoriesAndPageInfoFromPageTypeData(allParsed=[]) {
      const timeLineFeedUnits = allParsed[0].data.node.timeline_feed_units;
      const stories = timeLineFeedUnits.edges;
      const pageInfo = timeLineFeedUnits.page_info;

      let extractedStories = stories.map(s => StoryDataExtracter.extractSingleStory(s));
      extractedStories = this.filterExtractedStoriesWithOptions(extractedStories);

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

  const FormBodyHandlers = {
    extractVariablesAndDocId(formBodyStr='') {
      const devided = formBodyStr.split('&');
      const filtered = devided.filter(s => (
        !s.match(/variables|doc_id/g)
      ))
      return filtered;
    },

    combineWithVariablesAndDocId(formBodyAttrs=[], variablesStr='', docId=0) {
      return [
        ...formBodyAttrs, `variables=${variablesStr}`, `doc_id=${docId}`
      ].join('&')
    },

    makeFormBody(variablesStr='', docId=0) {
      const filteredFormBodyAttrs = this.extractVariablesAndDocId(
        configs.defaultFormBodyStr
      )
      const combinedFormBody = this.combineWithVariablesAndDocId(filteredFormBodyAttrs, variablesStr, docId)
      return combinedFormBody
    }
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
      const body = FormBodyHandlers.makeFormBody(
        JSON.stringify(data.variables), data.doc_id
      )
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
        "body": body,
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
        fetchedStories: configs.options.isDev ? fetchedStories : undefined,
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
      const fetchedFeeds = await feedQuerier.queryFeeds(configs.options.defaultFetchFeedsAmount)
      allFetchedFeeds.push(fetchedFeeds)
    }
    return allFetchedFeeds;
  }

  queryFeeds()
    .then(res => {
      if(res) {
        const downloader = new FileDownloader();
        // downloader.downloadJsonFile(res);
        setTimeout(() => {
          downloader.downloadMarkdownFile(res);
        }, 200)
      }
      console.log(res);
    })
})()
