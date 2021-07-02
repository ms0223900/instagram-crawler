// const fetch = require('node-fetch')
(() => {
  const configs = {
    // 每次只要替換form body str即可
    defaultFormBodyStr: 'av=100000107785615&__user=100000107785615&__a=1&__dyn=7AzHxqU5a5Q1ryaxG4VuC0BVU98nwgU76byQdwSwAyU8EW0CEboG4E6icwJwpUe8hw47w5nCxS320om78-221Rwwwg8vy8465o-cwfG12wOKdwGwFyE2ly87e2l2UtG7o4y0Mo4G4UcUC68f85qfK6E7e58jwGzEaE5e7oqBwJK5Umxm5oe8aUlxfxmu3W3rws9o8oy2a2-2W1TwyBwJwSyES&__csr=gaky2sRj9h4psLOEn2QTbn9XR4tkjqkI_hcWhbWaAjpAPa9p6G8CApClQbm_rQm8h9bqTKnRhHArV9qybFaWFrhVUOV2eEHlrFvjFZaV-8G8jhkFH-mcJHcQhkAVevDGV94iqW-q9Kalehd2bLVqGi5peq8xiWCgGuUW8hHxXDXrGFBCzbBAHy99ogVoiyaBxa2KubgHgy9BGeUmyay4fAyK5oBa9CAwywKUKdAxeazpUmyCayUSGCyopyE5auu2imbye6Uxu5UoGbmq5GDCKQ6Gt5iKq6V85Gex6dx-bwwgK4oHwzACxK16yoeEK68iwOKqezolwXwWxm0y89E2qw2YU0h5G17w4pw9he1Rw25pA2i032e2205Zb4p8a85AEzDCwFg2YwxU0Xm0rB284e1fA5i02Y81uUfU7B0eu07Ze053yw8K0dvpE&__req=f&__hs=18808.EXP2%3Acomet_pkg.2.1.0.0&dpr=1.5&__ccg=EXCELLENT&__rev=1004060342&__s=qdzign%3Aid6gyt%3Asselew&__hsi=6979560554884785400-0&__comet_req=1&fb_dtsg=AQHpBahIKyTNmMs%3AAQGZc7nLyS8eS2g&jazoest=22631&lsd=IrBm8mFJ2HBu0rTt1Tk-_K&__spin_r=1004060342&__spin_b=trunk&__spin_t=1625055576&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometModernPageFeedPaginationQuery&variables=%7B%22UFI2CommentsProvider_commentsKey%22%3A%22CometSinglePageContentContainerFeedQuery%22%2C%22count%22%3A3%2C%22cursor%22%3A%22AQHRkCBy0ayBEOZfsxeWctAjKqNzxWJ3a_7loHDAy2lsPi_hD1AZHS11UT1dqUDcqkG0mf57CYbz1hQZMjfxj-tPSydzTZLHfRDtwc-BznJJvJ_FB_2A-83X7Y4Gj_qIYii5%22%2C%22displayCommentsContextEnableComment%22%3Anull%2C%22displayCommentsContextIsAdPreview%22%3Anull%2C%22displayCommentsContextIsAggregatedShare%22%3Anull%2C%22displayCommentsContextIsStorySet%22%3Anull%2C%22displayCommentsFeedbackContext%22%3Anull%2C%22feedLocation%22%3A%22PAGE_TIMELINE%22%2C%22feedbackSource%22%3A22%2C%22focusCommentID%22%3Anull%2C%22privacySelectorRenderLocation%22%3A%22COMET_STREAM%22%2C%22renderLocation%22%3A%22timeline%22%2C%22scale%22%3A1.5%2C%22useDefaultActor%22%3Afalse%2C%22id%22%3A%22478111275689824%22%7D&server_timestamps=true&doc_id=4025931797526184',
    options: {
      // 總數量為以下數字*3, e.g. 給2 則會找到 6則
      defaultFetchFeedsAmount: 2,
      // dev會保留fetchedStories等等的原始資料
      isDev: true,
      // isFilteringTodayPosts: true,
      // isFilteringPostsWithLinks: true,
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
      {
          "pageUrl": "https://www.facebook.com/moka700720",
          "profileName": "麻的法課 - 邱豑慶醫師",
          id: '309451919769378',
          docId: 4025931797526184,
      },
      {
          "pageUrl": "https://www.facebook.com/2uncle",
          "profileName": "嘎嫂二伯",
          id: '100044617291038',
          docId: 4754979187852304,
      },
      {
          "pageUrl": "https://www.facebook.com/DOCT0RStrange",
          "profileName": "盾牌牙醫史書華",
          id: '100044115413873',
          docId: 4754979187852304,
      },
      {
          "pageUrl": "https://www.facebook.com/dream76843",
          "profileName": "小A辣",
          id: '100044389150787',
          docId: 4754979187852304,
      },
      {
          "pageUrl": "https://www.facebook.com/grassgrass1218",
          "profileName": "小草Grass 日々は楽しさ",
          id: '100044179236624',
          docId: 4754979187852304,
      },
      {
          "pageUrl": "https://www.facebook.com/mmslovelife/",
          "profileName": "麵麵的l.o.v.e.生活",
          id: '360431040706603',
          docId: 4025931797526184,
      },
      {
          "pageUrl": "https://www.facebook.com/jzmom",
          "profileName": "筋肉媽媽",
          id: '100044446778955',
          docId: 4754979187852304,
      },
      {
          "pageUrl": "https://www.facebook.com/twodeerman",
          "profileName": "鹿人",
          id: '100044200461059',
          docId: 4754979187852304,
      },
      {
          "pageUrl": "https://www.facebook.com/DRWILLYWANG/",
          "profileName": "威力醫師的育兒週記-王韋力",
          id: '293810851462868',
          docId: 4025931797526184,
      },
      {
          "pageUrl": "https://www.facebook.com/riceandshineee/",
          "profileName": "Rice & Shine",
          id: '486183621434791',
          docId: 4025931797526184,
      },
      {
          "pageUrl": "https://www.facebook.com/%E5%A4%A7%E8%B1%A1%E7%99%BC%E7%A6%8F%E5%BB%9A%E6%88%BF-574278822963127/",
          "profileName": "大象發福廚房",
          id: '574278822963127',
          docId: 4025931797526184,
      },
      {
          "pageUrl": "https://www.facebook.com/beevivian111",
          "profileName": "小Bee&森森",
          id: '100044215760246',
          docId: 4754979187852304,
      },
      {
          "pageUrl": "https://www.facebook.com/CLSHIH1029/",
          "profileName": "史佳霖喬韓森",
          id: '872810369735736',
          docId: 4025931797526184,
      },
      {
          "pageUrl": "https://www.facebook.com/technologymommy/",
          "profileName": "科技主婦carolchen",
          id: '526217961092528',
          docId: 4025931797526184,
      },
      {
          "pageUrl": "https://www.facebook.com/TigerblueStory",
          "profileName": "二師兄",
          id: '291618078078594',
          docId: 4025931797526184,
      },
      {
          "pageUrl": "https://www.facebook.com/minminkitchen/",
          "profileName": "MinMin山邊小廚房",
          id: '1059037554121583',
          docId: 4025931797526184,
      },
      {
          "pageUrl": "https://www.facebook.com/permio1",
          "profileName": "跟著左豪吃不胖&親子樂活趣",
          id: '525156674221919',
          docId: 4025931797526184,
      },
      {
          "pageUrl": "https://www.facebook.com/ddcqqmei",
          "profileName": "QQmei",
          id: '100044641830084',
          docId: 4754979187852304,
      },
      {
          "pageUrl": "https://www.facebook.com/DandHsMomCrazyStorage/",
          "profileName": "二寶媽療癒系之變態收納",
          id: '441152742988233',
          docId: 4025931797526184,
      },
      {
          "pageUrl": "https://www.facebook.com/lilyotani928/",
          "profileName": "日式簡單生活",
          id: '1781263275217354',
          docId: 4025931797526184,
      },
      {
          "pageUrl": "https://www.facebook.com/mrstienkitchen/",
          "profileName": "小田太太の玩樂廚房",
          id: '1023392301083526',
          docId: 4025931797526184,
      },
      {
          "pageUrl": "https://www.facebook.com/tastynote.tw/",
          "profileName": "TASTY NOTE 日本男子的日式家庭料理",
          id: '519317411850489',
          docId: 4025931797526184,
      },
      {
          "pageUrl": "https://www.facebook.com/rosalinakitchen/",
          "profileName": "蘿潔塔的廚房",
          id: '478111275689824',
          docId: 4025931797526184,
      },

    {
        "pageUrl": "https://www.facebook.com/kumikomeow.Pretty.Pay",
        "profileName": "柚子萱の小鐵盒"
    },
    {
        "pageUrl": "https://www.facebook.com/lovetoeatYunx2",
        "profileName": "愛吃鬼芸芸"
    },
    {
        "pageUrl": "https://www.facebook.com/kim.hu1025",
        "profileName": "Kimy"
    },
    {
        "pageUrl": "https://www.facebook.com/coomelon",
        "profileName": "I'm哺哺媽咪-哺媽育兒生活"
    },
    {
        "pageUrl": "https://www.facebook.com/nata0912/",
        "profileName": "我可是生活家"
    },
    {
        "pageUrl": "https://www.facebook.com/linkuokuo",
        "profileName": "小林&郭郭的小夫妻生活"
    },
    {
        "pageUrl": "https://www.facebook.com/s.smilelife",
        "profileName": "Smile Life 維媽育兒生活"
    },
    {
        "pageUrl": "https://www.facebook.com/fuchikolovefood",
        "profileName": "誠實吃貨家"
    },
    {
        "pageUrl": "https://www.facebook.com/PerryWife",
        "profileName": "多肉太太 kenalice"
    },
    {
        "pageUrl": "https://www.facebook.com/ovaltine82",
        "profileName": "阿華田的美食日記"
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
    filteredExtractedStoryTitle: '## 符合條件的貼文(發文日期是今天而且貼文內有連結)',
    'filteredExtractedStory.noPosts': '無符合條件的貼文',
    storyMode: configs.options.isDev ? '--開發模式--' : '--簡易模式--',

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
      const filteredStoriesStr = storyData.allFilteredExtractedStories.length > 0 ? (
        storyData.allFilteredExtractedStories.map((s, i) => this.convertSingleExtractedStory(s, i)).join('\n\n')
      ) : this['filteredExtractedStory.noPosts'];
      const storyContentStr = 
        `${this.filteredExtractedStoryTitle}\n${filteredStoriesStr}\n${ configs.options.isDev ? storiesStr : ''}\n`
      return `# ${storyData.profileName}\n${storyContentStr}`;
    },

    parseStoryDataList(stories=[]) {
      const parsedContent = stories.map(s => this.convertToMarkdownFormat(s)).join('\n\n');
      return `${this.storyMode}\n${parsedContent}`;
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

    getMetaOptions(links, creationTimeMs) {
      return ({
        isToday: ProfileStoriesParser.checkPostIsToday(creationTimeMs),
        haveLinks: !!(links.links),
      })
    },

    extractSingleStory(storyData) {
      const creationTime = this.getCreationTime(storyData);
      const storyMessageText = this.getStoryMessageText(storyData);
      const links = this.getLinksFromMessageTxt(storyMessageText.text);
      // const attachments = this.getStoryAttachments(storyData);
      const postLink = this.getStoryPostLink(storyData);
      const feedback = this.getStoryFeedback(storyData);
      // 新增一個欄位來判斷
      const metaOptions = this.getMetaOptions(links, creationTime.creationTimeMs)

      return ({
        metaOptions,
        postLink,
        // attachments: configs.options.isDev ? attachments : undefined,
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

    extractStories(stories=[]) {      
      const extractedStories = stories.map(s => StoryDataExtracter.extractSingleStory(s));
      const filteredExtractedStories = this.filterExtractedStoriesWithMetaOptions([...extractedStories]);
      return ({
        extractedStories,
        filteredExtractedStories,
      })
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

      const {
        extractedStories, filteredExtractedStories,
      } = this.extractStories(stories);

      const pageInfoData = allParsed.find(a => (
        a.label === 'ProfileCometTimelineFeed_user$defer$ProfileCometTimelineFeed_user_timeline_list_feed_units$page_info'
      ));
      pageInfo = pageInfoData ? pageInfoData.data.page_info : undefined;

      return ({
        stories,
        extractedStories,
        filteredExtractedStories,
        pageInfo,
      })
    },

    checkPostIsToday: (creationTimeMs) => {
      const postDate = new Date(creationTimeMs);
      const today = new Date();
      return (
        today.getFullYear() === postDate.getFullYear() &&
        today.getMonth() === postDate.getMonth() &&
        today.getDate() === postDate.getDate()
      )
    },

    filterExtractedStoriesWithMetaOptions(extractedStories=[]) {
      return extractedStories.filter(s => (
        s.metaOptions.isToday && s.metaOptions.haveLinks
      ))
    },

    getStoriesAndPageInfoFromPageTypeData(allParsed=[]) {
      const timeLineFeedUnits = allParsed[0].data.node.timeline_feed_units;
      const stories = timeLineFeedUnits.edges;
      const pageInfo = timeLineFeedUnits.page_info;

      const {
        extractedStories, filteredExtractedStories,
      } = this.extractStories(stories);

      return ({
        stories,
        filteredExtractedStories,
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
      let allFilteredExtractedStories = [];
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
            allFilteredExtractedStories.push(...parsed.filteredExtractedStories);
            fetchedDataList.push(parsed.allParsed);
            const newCursor = parsed.pageInfo.end_cursor;
            this.#updateCursor(newCursor);
          }
          i++;
        }
      } catch(e) {
        console.log(`Query feed: ${this.profileName} failed.`)
        console.log(e);
      }
      return ({
        profileName: this.profileName, 
        allExtractedStories,
        allFilteredExtractedStories,
        fetchedStories: configs.options.isDev ? fetchedStories : undefined,
      })
    }
  }

  async function queryFeeds() {
    let allFetchedFeeds = [];
    const creationTime = new Date().toISOString();

    for await (const profile of configs.profiles) {
      const feedQuerier = new ProfileTimelineFeedQuerier({
        profileName: profile.profileName,
        docId: profile.docId,
        id: profile.id,
      })
      const fetchedFeeds = await feedQuerier.queryFeeds(configs.options.defaultFetchFeedsAmount)
      allFetchedFeeds.push(fetchedFeeds)
    }

    return ({
      creationTime,
      allFetchedFeeds,
    });
  }

  queryFeeds()
    .then(res => {
      if(res) {
        const downloader = new FileDownloader();
        downloader.downloadJsonFile(res);
        downloader.downloadMarkdownFile(res);
      }
      console.log(res);
    })
})()
