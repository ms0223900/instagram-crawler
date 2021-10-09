(async () => {
  (() => {
    const configs = {
      tableName: 'EXTENDED_PROFILE_LIST_DATA',
      tableKeyList: [
        {
          keyName: 'id',
          options: { unique: true, },
        },
        {
          keyName: 'docId',
          options: { unique: false, },
        },
        {
          keyName: 'profileName',
          options: { unique: false, },
        },
        {
          keyName: 'pageUrl',
          options: { unique: false, },
        },
      ],
      formBodyDataTableName: 'LATEST_FORM_BODY_STR',
      formBodyDataTableKeyList: [
        {
          keyName: 'id',
          options: { unique: true, },
        },
        {
          keyName: 'formBodyStr',
          options: { unique: false, },
        },
      ]
    }
  
    const makeSingleProfileConfigFromFormData = ({
      formDataStr = '', // 剛剛從標頭複製來的那一長串文字
      profileName = '', // 粉絲專頁名稱
      pageUrl = '', // 粉絲專頁連結
    }) => {
      const matched = formDataStr.match(/((doc_id\=.+|(%22id%22%3A%22)(.+)%22))/g);
      
      if(matched) {
        const originIdStr = matched.find(t => t.includes('%22'));
        const originDocIdStr = matched.find(t => t.includes('doc_id'));
    
        const id = originIdStr.replace(/%22|%3A|id/g, '')
        const docId = originDocIdStr.replace(/doc_id=/g, '')
    
        return ({
          profileName,
          pageUrl,
          id,
          docId: Number(docId),
        })
      }
      return undefined
    }
  
    const catchDBError = (rej) => (e) => {
      const db = e.target.result;
      // db.close();
      rej(e.target.error)
    }
    
    const createNewIndexedDB = ({
      dataList,
      tableName,
      keyList,
    } = {
      dataList: [],
      tableName: '',
      keyList: [{
        keyName: 'name',
        options: { unique: false, },
      }]
    }) => (res, rej) => (e) => {
      const db = e.target.result;
    
      const objStore = db.createObjectStore(tableName, {
        keyPath: 'id'
      });
    
      keyList.forEach(key => {
        objStore.createIndex(key.keyName, key.keyName, {...key.options})
      })
    
      dataList.forEach(data => {
        objStore.add(data)
      })
    
      db.close();
      res('Created done.');
    }
    
    const writeNewDataToIndexedDB = ({
      dataList,
      tableName,
    } = {
      dataList: [],
      tableName: '',
    }) => (res, rej) => (ev) => {
      const db = ev.target.result;
      const transaction = db.transaction(tableName, 'readwrite');
      if(transaction)
    
      transaction.onerror = (err) => {
        db.close();
        rej(err.target.error)
      }
      transaction.oncomplete = () => {
        db.close();
        res('all done.')
      }
      
      const objStore = transaction.objectStore(tableName);
      dataList.forEach(d => {
        const addReq = objStore.add(d);
      })
    }
    
    class MyIndexedDB {
      constructor({
        dbName = 'TestDB', 
        tableName = '', 
        keyList = [], 
        dbVersion = undefined,
      }) {
        this.dbName = dbName;
        this.tableName = tableName;
        this.keyList = keyList;
        this.dbVersion = dbVersion;
      }
  
      checkDBExist() {
        return new Promise((res, rej) => {
          let isDbExist = true;
          const dbReq = indexedDB.open(this.dbName, this.dbVersion);
          dbReq.onerror = catchDBError(rej);
  
          dbReq.onupgradeneeded = (e) => {
            isDbExist = false;
            e.target.transaction.abort();
            res(isDbExist)
          }
  
          dbReq.onsuccess = () => {
            res(isDbExist)
          }
        })
      }
  
      checkTableExist(objStoreNames = []) {
        return objStoreNames.includes(this.tableName)
      }
  
      updateDbVersion(ev) {
        this.dbVersion = ev.target.result.version;
        this.dbVersion++;
      }
    
      createOrWriteNewDataToIndexedDB(dataList = []) {
        // const isDbExist = await this.checkDBExist();
        // console.log(isDbExist)
        console.log('create or write')
        return new Promise((res, rej) => {
          const tableName = this.tableName;
          const keyList = this.keyList;
          const dbReq = indexedDB.open(this.dbName, this.dbVersion);
          
          dbReq.onerror = catchDBError(rej);
        
          dbReq.onupgradeneeded = (e) => {
            console.log('create new db or db upgraded.')
            createNewIndexedDB({
              dataList,
              tableName,
              keyList,
            })(res, rej)(e)
          }
      
          dbReq.onsuccess = (ev) => {
            // if(isDbExist) {
              const db = ev.target.result;
              const isTableExist = this.checkTableExist([
                ...db.objectStoreNames
              ]);
  
              if(isTableExist) {
                console.log('write new data to db.')
                writeNewDataToIndexedDB({
                  dataList,
                  tableName,
                })(res, rej)(ev)
                db.close();
              } else {
                console.log('db exist and update version.')
                this.updateDbVersion(ev);
                db.close();
                this.createOrWriteNewDataToIndexedDB(dataList).then(r => {
                  console.log(`update version to ${this.dbVersion} and create.`)
                  return res(r)
                });
              }
            // }
          }
        })
      }
    
      readAllData() {
        return new Promise((res, rej) => {
          let db;
          const dbReq = indexedDB.open(this.dbName, this.dbVersion);
      
          dbReq.onerror = catchDBError(rej);
      
          dbReq.onsuccess = (ev) => {
            db = ev.target.result;
            
            const isTableExist = this.checkTableExist([
              ...db.objectStoreNames
            ]);
            if(!isTableExist) {
              db.close();
              const tableNotFoundMessage = `table: ${this.tableName} does not exist, please create table first.`;
              console.log(tableNotFoundMessage)
              return res([])
              // return rej(`table: ${this.tableName} is not exist, please create first.`);
            }
            let readRes = [];
      
            // const db = e.target.result;
            const objStore = db.transaction(this.tableName).objectStore(this.tableName);
            const cursor = objStore.openCursor();
      
            cursor.onerror = catchDBError(rej);
            cursor.onsuccess = ce => {
              const cursorRes = ce.target.result;
              if(cursorRes) {
                // console.log(cursorRes)
                readRes.push(cursorRes.value);
                cursorRes.continue();
              } else {
                db.close();
                res(readRes)
              }
            }
          }
      
        })
      }
  
      updateByVal({
        comparedDataKey = 'name',
        comparedVal = 'abc',
        updatedDataKey = 'email',
        updatedVal = 'aaa@com.tw'
      }) {
        return new Promise((res, rej) => {
          const dbReq = indexedDB.open(this.dbName, this.dbVersion);
          dbReq.onerror = catchDBError(rej);
  
          dbReq.onsuccess = ev => {
            const db = ev.target.result;
            const transaction = db.transaction(this.tableName, 'readwrite');
            transaction.oncomplete = () => {
              db.close();
              res('updated done.')
            }
  
            const objStore = transaction.objectStore(this.tableName);
            const cursor = objStore.openCursor();
  
            cursor.onerror = catchDBError(rej);
            cursor.onsuccess = ce => {
              const cursorRes = ce.target.result;
              if(cursorRes) {
                if(cursorRes.value[comparedDataKey] === comparedVal) {
                  let newData = cursorRes.value
                  newData[updatedDataKey] = updatedVal
                  const updateReq = cursorRes.update(newData)
                  updateReq.onsuccess = (e) => {
                    res(newData)
                  }
                }
                cursorRes.continue();
              } else {
                rej(`data with ${comparedDataKey} have no ${comparedVal} value :(`)
              }
            }
  
          }
        })
      }
    }
  
    function addNewProfileToIndexedDB(db) {
      return ({
      formDataStr = '', // 剛剛從標頭複製來的那一長串文字
      profileName = '', // 粉絲專頁名稱
      pageUrl = '', // 粉絲專頁連結
    }) => {
        const singleProfileData = makeSingleProfileConfigFromFormData({
          formDataStr,
          profileName,
          pageUrl,
        });
        if(singleProfileData) {
          return db.createOrWriteNewDataToIndexedDB([singleProfileData])
            .then(res => {
              console.log(res);
              const addedStatus = {
                type: 200,
                message: `New profile added :)`,
                newData: singleProfileData,
              }
              console.log(addedStatus.message)
              // return res;
              return addedStatus
            })
            .catch(err => {
              console.log(`Error: ${err}`)
            })
        }
      }
    }
  
    function createOrUpdateFormBodyStr(db = new MyIndexedDB()) {
      return async ({
        formBodyStr = '',
      }) => {
        try {
          let res;
          const readData = await db.readAllData();
          if(
            (Array.isArray(readData) && readData.length === 0) || !readData
          ) {
            res = await db.createOrWriteNewDataToIndexedDB([{
              id: 0, formBodyStr
            }])
          } else {
            res = await db.updateByVal({
              comparedDataKey: 'id',
              comparedVal: 0,
              updatedDataKey: 'formBodyStr',
              updatedVal: formBodyStr,
            })
          }
          console.log(res);
          const successStatus = {
            type: 200,
            message: 'FormbodyStr is updated done :)',
            newData: formBodyStr
          }
          console.log(successStatus.message)
          return successStatus;
        } catch (error) {
          console.log(`Error: ${error}`)
        }
      }
    }
  
    function makeFormBodyStrDB() {
      const myDb = new MyIndexedDB({
        tableName: configs.formBodyDataTableName,
        keyList: configs.formBodyDataTableKeyList,
      })
      window.formbodyStrIndexedDB = myDb
      // window.formbodyStrAddNewProfileToIndexedDB = addNewProfileToIndexedDB(myDb);
      window.formbodyStrCreateOrUpdateFormBodyStr = createOrUpdateFormBodyStr(myDb);
      console.log('formbodyStr indexedDB created.');
    }
  
    function makeProfileIndexedDB() {
      const myDb = new MyIndexedDB({
        tableName: configs.tableName,
        keyList: configs.tableKeyList,
      })
      window.myIndexedDB = myDb
      window.addNewProfileToIndexedDB = addNewProfileToIndexedDB(myDb);
      console.log('profile indexedDB created.');
    }
  
    function main() {
      makeFormBodyStrDB();
      makeProfileIndexedDB();
    }
  
    main();
  })();

  const initFbQuery = async () => {
    const asyncGetExtendedProfileListFromIndexedDB = async () => {
      if(!window.myIndexedDB) {
        console.log('Please init "addProfileToIndexedDB" file.')
        return [];
      }
      const res = await window.myIndexedDB.readAllData()
      return res
    }

    const asyncGetBodyStr = async () => {
      if(!window.formbodyStrIndexedDB) {
        console.log('Please init "MyIndexedDB" first');
        return ''
      }

      const res = await window.formbodyStrIndexedDB.readAllData();
      if(!res.length) {
        console.log('Please update formBodyStr first :)')
        return ''
      }
      return res[0].formBodyStr;
    }

    const extendProfileListData = await asyncGetExtendedProfileListFromIndexedDB();
    const formBodyStr = await asyncGetBodyStr();

    if(!formBodyStr) {
      console.log('Please add form body str first!!!');
      console.log(`Enter this page ${'https://www.facebook.com/thelinskids'} to get form body str :)`)
      return;
    }
    
    const configs = {
      // 每次只要替換form body str即可
      defaultFormBodyStr: formBodyStr,
      // defaultFormBodyStr: 'av=100000107785615&__user=100000107785615&__a=1&__dyn=7AzHxqU5a5Q1ryaxG4VuC0BVU98nwgUb84i5QdwSwAyU8EW0CEboG4E762S1DwUx609vCxS320om78-221Rwwwg8vy8465o-cwfG12wOKdwGwFyE2ly87e2l2Utwwwi831wiEjwPyoowYwlE-UqwsUkxe2GewGwkUtxGm2SUnxq5olwUwgojUlDw-wUws9o8oy2a2-0FE8Fo6iazo2NwwwOg&__csr=g922islN58tOR4h4QgBkaiq9ZYIjjlJ-zOHmAJAAAKGWArVbvjt35FZ6GWp9Tya-r8V45pifFtaK-UjUy_J-eWUVmECmibyAl7y94F7F4G5A9V9FdeungFami9VKuhWG48yF8Z3uleiagCi9Km8AyJ5UXVe9BDzESbmGzXgmybyoC4U99F8WEprDJ12quaUKaCyoIw88Smi9xGm9hUSfypVrwDyFFbxqeK4obocXxeF99Xyox6ypbXxGdyoWES4ovgW36Eao8FA3uUa999UZohxm6aKp2oK8z8a99Eco8FEf8O7em17G68qwLg5m4EW9xy22V8swJxO68txa2m3S02ky1Qw159026Q0UdwSg05sZ0bBaKz11xa0MKE0za0rG1Gw2Lo1Y5ojwyw51xi2C3m1BDyrm0oO9CwFbVayF49w6_w0KcwPy8vw43dDw18d1F053yo&__req=i&__hs=18886.EXP2%3Acomet_pkg.2.1.0.0.0&dpr=1.5&__ccg=EXCELLENT&__rev=1004405568&__s=wxyars%3Akwsxmf%3Ahlh6z8&__hsi=7008556544619121267-0&__comet_req=1&fb_dtsg=AQGqfAD-mo4P7TQ%3A33%3A1553618719&jazoest=21926&lsd=tv32wzt_Eeu8ZJiFQv7UAz&__spin_r=1004405568&__spin_b=trunk&__spin_t=1631806731&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=ProfileCometTimelineFeedRefetchQuery&variables=%7B%22UFI2CommentsProvider_commentsKey%22%3A%22ProfileCometTimelineRoute%22%2C%22afterTime%22%3Anull%2C%22beforeTime%22%3Anull%2C%22count%22%3A3%2C%22cursor%22%3A%22AQHR-mCxHeUky1fMrVTsz1Hh9D3IQte52BOdPaIf8MOADL43KAmLxXux3lBgbd2sg2BLPn2deLc16waX69twrqPlpRp4SdSv1-tNltsyI3asfU9OuokWTQLmWEi-H2EaP7BY%22%2C%22displayCommentsContextEnableComment%22%3Anull%2C%22displayCommentsContextIsAdPreview%22%3Anull%2C%22displayCommentsContextIsAggregatedShare%22%3Anull%2C%22displayCommentsContextIsStorySet%22%3Anull%2C%22displayCommentsFeedbackContext%22%3Anull%2C%22feedLocation%22%3A%22TIMELINE%22%2C%22feedbackSource%22%3A0%2C%22focusCommentID%22%3Anull%2C%22memorializedSplitTimeFilter%22%3Anull%2C%22omitPinnedPost%22%3Atrue%2C%22postedBy%22%3A%7B%22group%22%3A%22OWNER%22%7D%2C%22privacy%22%3Anull%2C%22privacySelectorRenderLocation%22%3A%22COMET_STREAM%22%2C%22renderLocation%22%3A%22timeline%22%2C%22scale%22%3A1.5%2C%22should_show_profile_pinned_post%22%3Atrue%2C%22stream_count%22%3A1%2C%22taggedInOnly%22%3Anull%2C%22useDefaultActor%22%3Afalse%2C%22id%22%3A%22100050607693965%22%7D&server_timestamps=true&doc_id=4345796105515300',
      jsonBinConfigs: {
        binId: '',
        apiKey: '',
      },
      firebaseConfigs: {
        config: {
          apiKey: '',
          authDomain: 'fb-crawled.firebaseapp.com',
          databaseURL: 'https://fb-crawled-default-rtdb.firebaseio.com',
          storageBucket: 'fb-crawled.appspot.com'
        }
      },
      options: {
        latestStoriesDaysAmount: 7,
        // 總數量為以下數字*3, e.g. 給2 則會找到 6則
        defaultFetchFeedsAmount: 2,
        // dev會保留fetchedStories等等的原始資料
        isDev: false,
        // isFilteringTodayPosts: true,
        // isFilteringPostsWithLinks: true,
      },
      GRAPHQL_API: 'https://www.facebook.com/api/graphql/',
      regexp: {
        URL: /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
      },
      profiles: [
        ...extendProfileListData,
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
            "profileName": "柚子萱の小鐵盒",
            id: '651029542000798',
            docId: 3456446391124496,
        },
        {
            "pageUrl": "https://www.facebook.com/lovetoeatYunx2",
            "profileName": "愛吃鬼芸芸",
            id: '100044343583557',
            docId: 3820813564695818,
        },
        {
            "pageUrl": "https://www.facebook.com/kim.hu1025",
            "profileName": "Kimy",
            id: '437147409797347',
            docId: 3456446391124496,
        },
        {
            "pageUrl": "https://www.facebook.com/coomelon",
            "profileName": "I'm哺哺媽咪-哺媽育兒生活",
            id: '126559634670144',
            docId: 3456446391124496,
        },
        {
            "pageUrl": "https://www.facebook.com/nata0912/",
            "profileName": "我可是生活家",
            id: '124721477573662',
            docId: 3456446391124496,
        },
        {
            "pageUrl": "https://www.facebook.com/linkuokuo",
            "profileName": "小林&郭郭的小夫妻生活",
            id: '660915803981397',
            docId: 3456446391124496,
        },
        {
            "pageUrl": "https://www.facebook.com/s.smilelife",
            "profileName": "Smile Life 維媽育兒生活",
            id: '355338101207834',
            docId: 3456446391124496,
        },
        {
            "pageUrl": "https://www.facebook.com/fuchikolovefood",
            "profileName": "誠實吃貨家",
            id: '792415717576951',
            docId: 3456446391124496,
        },
        {
            "pageUrl": "https://www.facebook.com/PerryWife",
            "profileName": "多肉太太 kenalice",
            id: '100044446688982',
            docId: 3820813564695818,
        },
        {
            "pageUrl": "https://www.facebook.com/ovaltine82",
            "profileName": "阿華田的美食日記",
            id: '100044150663659',
            docId: 3820813564695818,
        },

        // 7/1 added
        {
            "pageUrl": "https://www.facebook.com/hahan.mammy",
            "profileName": "哈韓孕媽咪．正韓直送",
            id: '205200392829655',
            docId: 4347196085360470,
        },
        {
            "pageUrl": "https://www.facebook.com/yukiclub/",
            "profileName": "Yuki's Life",
            id: '100044499336931',
            docId: 4072975462739051,
        },
        {
            "pageUrl": "https://www.facebook.com/fb.paine0602",
            "profileName": "小不點看世界",
            id: '722554827858608',
            docId: 4347196085360470,
        },
        {
            "pageUrl": "https://www.facebook.com/HELLOFIFI",
            "profileName": "I am FiFi",
            id: '211264105579183',
            docId: 4347196085360470,
        },
        {
            "pageUrl": "https://www.facebook.com/terrilee1026",
            "profileName": "人字拖小姮",
            id: '100044563803872',
            docId: 4072975462739051,
        },
        {
            "pageUrl": "https://www.facebook.com/smallwen53/",
            "profileName": "小文甜生活 Evelyn Wang",
            id: '100044454758711',
            docId: 4072975462739051,
        },
        {
            "pageUrl": "https://www.facebook.com/HCSxSummer/",
            "profileName": "HCS x Summer",
            id: '1648960168505905',
            docId: 4347196085360470,
        },
        {
            "pageUrl": "https://www.facebook.com/kingbabytw/",
            "profileName": "妞媽分享愛",
            id: '100044525377225',
            docId: 4072975462739051,
        },
        {
            "pageUrl": "https://www.facebook.com/tainan.sunny",
            "profileName": "媽媽我想嫁去台南",
            id: '100044360203170',
            docId: 4072975462739051,
        },
        {
            "pageUrl": "https://www.facebook.com/yoke918",
            "profileName": "青青小熊＊旅遊札記",
            id: '100044282386832',
            docId: 4072975462739051,
        },
        {
            "pageUrl": "https://www.facebook.com/sophiemommy/",
            "profileName": "蘇菲媽咪的異想世界",
            id: '1437485393164901',
            docId: 4347196085360470,
        },
        {
            "pageUrl": "https://www.facebook.com/topniniko",
            "profileName": "翁瑋嬪 Niniko",
            id: '1780865216',
            docId: 4072975462739051,
        },
        {
            "pageUrl": "https://www.facebook.com/venuslin0113/",
            "profileName": "跟著小V吃喝玩樂",
            id: '105430266170453',
            docId: 4347196085360470,
        },
        {
            "pageUrl": "https://www.facebook.com/LoveColleenWei/",
            "profileName": "可藍 Colleen wei",
            id: '100044325011793',
            docId: 4072975462739051,
        },
        {
            "pageUrl": "https://www.facebook.com/migaomom",
            "profileName": "米糕媽媽 x 與兩個老公的生活 蕊秋",
            id: '393416930830937',
            docId: 4347196085360470,
        },

        // 7/3 ~ 7/5 added
        {
            "pageUrl": "https://www.facebook.com/takecareofyourknee",
            "profileName": "膝關節",
            id: '100044274074089',
            docId: 4072975462739051,
        },
        {
            "pageUrl": "https://www.facebook.com/u5u5u5u",
            "profileName": "肉桂打噴嚏Homemade Kitchen",
            id: '100044612371429',
            docId: 4072975462739051,
        },
        {
            "pageUrl": "https://www.facebook.com/icooktw",
            "profileName": "iCook 愛料理",
            id: '227685837266552',
            docId: 4347196085360470,
        },
        {
            "pageUrl": "https://www.facebook.com/minamizaleski",
            "profileName": "K & C 凱勒與夏綠妹",
            id: '100043987576094',
            docId: 4072975462739051,
        },
        {
            "pageUrl": "https://www.facebook.com/shintaroReview",
            "profileName": "冏冏子Kyon",
            id: '100044252388413',
            docId: 4072975462739051,
        },
        {
            "pageUrl": "https://www.facebook.com/ShaNice1003.tw/",
            "profileName": "ShaNice食光旅人筆記",
            id: '358337081463235',
            docId: 4347196085360470,
        },
        {
            "pageUrl": "https://www.facebook.com/ethansmomlife",
            "profileName": "伊森媽咪 × Ethan's mom 親子日常",
            id: '493450664166120',
            docId: 4347196085360470,
        },
        {
            "pageUrl": "https://www.facebook.com/MissTaiwanfriedchicken",
            "profileName": "顏酥雞小姐的成長日誌",
            id: '1121575887974452',
            docId: 4347196085360470,
        },
        {
            "pageUrl": "https://www.facebook.com/yangyoyoblog",
            "profileName": "環遊世界的小羊兒 （美食旅遊生活）",
            id: '767399773323379',
            docId: 4347196085360470,
        },
        {
            "pageUrl": "https://www.facebook.com/Babynina.tw",
            "profileName": "Nina 瑄寶",
            id: '868679366617306',
            docId: 4347196085360470,
        },
        {
            "pageUrl": "https://www.facebook.com/Helensdiary",
            "profileName": "海倫日記Helen's diary",
            id: '729433100531623',
            docId: 4347196085360470,
        },
        {
            "pageUrl": "https://www.facebook.com/RiinsFL",
            "profileName": "Riin’s life 好感生活",
            id: '100045185975264',
            docId: 4072975462739051,
        },
        {
            "pageUrl": "https://www.facebook.com/dj.kaihan/",
            "profileName": "DJ 楊凱涵 Hannah",
            id: '426903057358032',
            docId: 4347196085360470,
        },
        {
            "pageUrl": "https://www.facebook.com/stacey0805",
            "profileName": "梁太的婚顧生活",
            id: '100047250031203',
            docId: 4072975462739051,
        },
        {
            "pageUrl": "https://www.facebook.com/momojerryplay",
            "profileName": "Momo姐｜在玩．傑瑞大叔｜再玩",
            id: '205238703641213',
            docId: 4347196085360470,
        },
        {
            "pageUrl": "https://www.facebook.com/Komomwithkobe",
            "profileName": "摳媽與摳比",
            id: '179030132999619',
            docId: 4347196085360470,
        },
        {
            "pageUrl": "https://www.facebook.com/yunba8",
            "profileName": "雲爸的3c學園",
            id: '414062265302035',
            docId: 4347196085360470,
        },
        {
            "pageUrl": "https://www.facebook.com/BabyWoodygogogo",
            "profileName": "寶寶吳迪 Babywoody",
            id: '100052930634732',
            docId: 4072975462739051,
        },
        {
            "pageUrl": "https://www.facebook.com/HanHanMurMurShow/",
            "profileName": "HANNAH小涵X育兒生活X高雄台北美食",
            id: '903627549651473',
            docId: 4347196085360470,
        },

        {
            "pageUrl": "https://www.facebook.com/profile.php?id=100063526248425",
            "profileName": "大公主與三千金的生活記事",
            id: '100063526248425',
            docId: 3514278682008910,
        },
        {
            "pageUrl": "https://www.facebook.com/dearjoy1124",
            "profileName": "Joy Lee",
            id: '100044574780084',
            docId: 3514278682008910,
        },
        {
            "pageUrl": "https://www.facebook.com/yufangkemomo/",
            "profileName": "Momo 小桃",
            id: '156298774576046',
            docId: 3805022272943106,
        },
        {
            "pageUrl": "https://www.facebook.com/mrjimrsji",
            "profileName": "吉先生與吉太太的吉霸婚生活",
            id: '814128585383684',
            docId: 3805022272943106,
        },
        {
            "pageUrl": "https://www.facebook.com/Janemyhouse/",
            "profileName": "高個夫妻。Janemy 珍米 House",
            id: '529940837393462',
            docId: 3805022272943106,
        },
        {
            "pageUrl": "https://www.facebook.com/Lydia628",
            "profileName": "Lydia Tsai 蔡沐妍",
            id: '100044198840961',
            docId: 3514278682008910,
        },
        {
            "pageUrl": "https://www.facebook.com/veganlady.iris/",
            "profileName": "田系女子 Iris",
            id: '291849705056969',
            docId: 3805022272943106,
        },
        {
            "pageUrl": "https://www.facebook.com/lulula",
            "profileName": "美花的時尚、慢活、輕旅行",
            id: '100044293126331',
            docId: 3514278682008910,
        },
        {
            "pageUrl": "https://www.facebook.com/Claire.Diary",
            "profileName": "Claire's Diary。C妞日記 x 臘腸寶貝 Tila",
            id: '100044567253505',
            docId: 3514278682008910,
        },
        {
            "pageUrl": "https://www.facebook.com/yamutsuri",
            "profileName": "【天啊，拎杯的日本丈夫好靠北】",
            id: '100044497563745',
            docId: 3514278682008910,
        },
        {
            "pageUrl": "https://www.facebook.com/icecreamlovelife",
            "profileName": "冰淇淋妹 愛生活",
            id: '100044274961962',
            docId: 3514278682008910,
        },
        {
            "pageUrl": "https://www.facebook.com/YJ0428/",
            "profileName": "汀尼扣 Nicole",
            id: '310623392421864',
            docId: 3805022272943106,
        },
        {
            "pageUrl": "https://www.facebook.com/endlesschenmama2.0",
            "profileName": "EndlessChenmama。陳媽媽的兒童餐2.0",
            id: '100044542054688',
            docId: 3514278682008910,
        },
        {
            "pageUrl": "https://www.facebook.com/weiweicouple",
            "profileName": "喂喂卡波",
            id: '1690259141271341',
            docId: 3805022272943106,
        },
        {
            "pageUrl": "https://www.facebook.com/%E9%A3%AF%E5%8C%99%E5%AA%BD%E5%AA%BD%E9%A3%9F%E5%85%89%E6%9C%AD%E8%A8%98-478836762495732/",
            "profileName": "飯匙媽媽。食光札記",
            id: '478836762495732',
            docId: 3805022272943106,
        },
        {
            "pageUrl": "https://www.facebook.com/jubbyfan/",
            "profileName": "林小乖的養成計畫",
            id: '1242892389105197',
            docId: 3805022272943106,
        },
        {
            "pageUrl": "https://www.facebook.com/pisces.sister/",
            "profileName": "雙魚姊姊美食旅遊",
            id: '383173185125512',
            docId: 3805022272943106,
        },
        {
            "pageUrl": "https://www.facebook.com/banana065",
            "profileName": "香蕉太太MrsBanana",
            id: '100044229169602',
            docId: 3514278682008910,
        },
        {
            "pageUrl": "https://www.facebook.com/Host.kiki/",
            "profileName": "Dj琦琦-醫師娘陪你當媽媽",
            id: '168519849855368',
            docId: 3805022272943106,
        },
        {
            "pageUrl": "https://www.facebook.com/Summer.pace17/",
            "profileName": "Summer 沙莫太太",
            id: '254099902047279',
            docId: 3805022272943106,
        },
        {
            "pageUrl": "https://www.facebook.com/yunimama.Ali/",
            "profileName": "婗媽。甜栗子",
            id: '1402176656508704',
            docId: 3805022272943106,
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

    class FirebaseUploader {
      constructor() {
        this.addScriptToBody();
      }

      init() {
        return new Promise((res, rej) => {
          setTimeout(() => {
            const firebase = window.firebase;
            firebase.initializeApp(configs.firebaseConfigs.config);
            this.database = firebase.database();
            console.log('init completed.')
            return res('init completed.');
          }, 2000)
        })
      }

      checkScriptAdded() {
        const scripts = document.getElementsByTagName('script');
        const firebaseScript = [...scripts].find(s => (
          s.attributes.src?.value === 'https://www.gstatic.com/firebasejs/8.7.0/firebase-app.js'
        ));
        return !!firebaseScript;
      }

      addScriptToBody() {
        if(!this.checkScriptAdded()) {
          const coreScript = document.createElement('script');
          coreScript.setAttribute('src', 'https://www.gstatic.com/firebasejs/8.7.0/firebase-app.js');
          const databaseScript = document.createElement('script');
          databaseScript.setAttribute('src', 'https://www.gstatic.com/firebasejs/8.7.0/firebase-database.js');
          const body = document.getElementsByTagName('head')[0];

          body.appendChild(coreScript);
          body.appendChild(databaseScript);
        }
      }

      uploadData(data) {
        this.database.ref('crawled-data/').set(data);
        console.log('Data uploaded successfully.')
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

      parseStoryDataList(res) {
        const parsedContent = res.allFetchedFeeds.map(s => this.convertToMarkdownFormat(s)).join('\n\n');
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
      getFeedbackContext: (story) => (
        story.node.comet_sections.feedback.story.feedback_context.feedback_target_with_context
      ),

      getStoryId(story) {
        const id = this.getFeedbackContext(story).subscription_target_id;
        return id;
      },

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

      getStoryFeedback(story) {
        const feedbackCtx = this.getFeedbackContext(story)
        // console.log(feedbackCtx)
        const feedback = (feedbackCtx.comet_ufi_summary_and_actions_renderer || feedbackCtx.ufi_renderer.feedback.comet_ufi_summary_and_actions_renderer).feedback
        const reactionCount = feedback.reaction_count.count;
        const shareCount = feedback.share_count.count;
        return ({
          name: locales.zh.feedback,
          reactionCount,
          shareCount,
        })
      },

      getStoryComments(story) {
        const feedbackCtx = this.getFeedbackContext(story);
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
        const id = this.getStoryId(storyData)
        const creationTime = this.getCreationTime(storyData);
        const storyMessageText = this.getStoryMessageText(storyData);
        const links = this.getLinksFromMessageTxt(storyMessageText.text);
        // const attachments = this.getStoryAttachments(storyData);
        const postLink = this.getStoryPostLink(storyData);
        const feedback = this.getStoryFeedback(storyData);
        // 新增一個欄位來判斷
        const metaOptions = this.getMetaOptions(links, creationTime.creationTimeMs)

        return ({
          id,
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
        let extractedStories = stories.map(s => StoryDataExtracter.extractSingleStory(s));
        extractedStories = this.filterStoriesByDaysAmountBetweenCreationTime(extractedStories)
        let filteredExtractedStories = this.filterExtractedStoriesWithMetaOptions([...extractedStories]);
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
      filterStoriesByDaysAmountBetweenCreationTime(extractedStories=[]) {
        const nowMs = new Date().getTime()
        const daysAmountBetweenCreationTimeMs = configs.options.latestStoriesDaysAmount * 24 * 60 * 60 * 1000
        return extractedStories.filter(s => (
          (nowMs - s.creationTime.creationTimeMs) <= daysAmountBetweenCreationTimeMs
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
      let i = 0;
      let somethingFailed = false
      let allFetchedFeeds = [];
      const creationTime = new Date().toISOString();

      for await (const profile of configs.profiles) {
        i++;
        try {
          if(!somethingFailed) {
            console.log(`Querying: ${profile.profileName}`)
            const feedQuerier = new ProfileTimelineFeedQuerier({
              profileName: profile.profileName,
              docId: profile.docId,
              id: profile.id,
            })
            const fetchedFeeds = await feedQuerier.queryFeeds(configs.options.defaultFetchFeedsAmount);

            if(window.ctx) {
              const queriedPostsPercentage = Math.floor(
                (i / configs.profiles.length) * 100
              )
              window.ctx.setState(s => ({
                queriedPostsPercentage,
              }))
            }
            allFetchedFeeds.push(fetchedFeeds)
          }
        } catch (error) {
          console.log(`Query feed error: ${error}`);
          return;
        }
      }

      // res output
      return ({
        creationTime,
        allFetchedFeeds,
      });
    }

    // bin max file size is 100KB :(

    // async function uploadJson(
    //   binId=configs.jsonBinConfigs.binId, jsonData={}
    // ) {
    //   const api = `https://json.extendsclass.com/bin/${binId}`;
    //   try {
    //     const res = await fetch(api, {
    //       method: 'POST',
    //       headers: {
    //         'Api-key': configs.jsonBinConfigs.apiKey,
    //       },
    //       body: JSON.stringify(jsonData)
    //     }).then(r => r).then(r => r.json());
    //     console.log('json data upload successfully.')
    //     return res.id;
    //   } catch (e) {
    //     console.log(e)
    //     return undefined;
    //   }
    // }

    window.queryFbPosts = async () => {
      try {
        const queriedFeeds = await queryFeeds();
        if(queriedFeeds) {
          const downloader = new FileDownloader();
          downloader.downloadJsonFile(queriedFeeds);
          downloader.downloadMarkdownFile(queriedFeeds);
        }
      } catch (error) {
        console.log(e);
      }
    }
  };
  initFbQuery();

  (() => {
    const clearWholePage = () => {
      document.body.innerHTML = ''
    }
  
    const style = `
      <style>
        body {
          padding: 0px;
          margin: 0px;
          text-align: center;
        }
  
        .fetch-fb-post--wrapper {
          position: sticky;
          top: 0;
          padding: 1rem;
          background: #fff;
          box-shadow: 0px 0px 10px #00000050;
        }
  
        .fetch-fb-post--wrapper h2 {
          padding-bottom: 1rem;
          font-size: 24px;
        }
  
        button.fetch-post:disabled {
          color: #f00;
        }
  
        .add-profile-form-template {
          padding: 2rem;
          margin: auto;
          max-width: 400px;
          border-radius: 1rem;
          background-color: #fff;
          box-shadow: 0px 0px 10px #ddd;
        }
  
        label {
          display: flex;
          justify-content: center;
          align-items: center;
          padding-bottom: 1rem;
        }
  
        input,
        textarea {
          box-sizing: border-box;
          padding: 0.5rem;
          width: 80%;
          margin-left: 0.5rem;
          min-width: 300px;
        }
        
        textarea {
          min-height: 400px;
        }
  
        button {
          padding: 1rem;
          border-radius: 0.25rem;
        }
  
        .profile-list--wrapper {
          max-width: 1200px;
          margin: auto;
          padding: 2rem;
        }
  
        .profile-item {
          display: flex;
          justify-content: flex-start;
          padding-bottom: 1rem;
        }
  
        .profile-item :nth-child(n) {
          width: 25%;
          padding-left: 1rem;
        }
      </style>
    `
  
    const formDescp = `
      <div>
        <h1>Desp</h1>
        <p>${'如果只填長串參數，不填粉絲專頁名稱和粉絲專頁網址，就是直接更新爬文的參數'}</p>
        <hr />
      </div>
    `
  
    const addProfileFormTemplate = `
      <div class="root add-profile-form-template">
        ${formDescp}
        <div>
          <div>
            <label>
              粉專名稱
              <input id="profileName" />
            </label>
            <label>
              粉專網址
              <input id="pageUrl" />
            </label>
          </div>
          <label>
            長串參數
            <textarea id="formDataStr" /></textarea>
          </label>
          <button id="send">送出</button>
        </div>    
      </div>
    `
  
    const API = {
      errorMessages: {
        initDBFirst: 'Init MyIndexedDB first!!'
      },
  
      updateFormDataStr: async (formDataStr = '') => {
        if(!formDataStr) return;
        if(!window.formbodyStrCreateOrUpdateFormBodyStr) {
          window.alert(API.errorMessages.initDBFirst)
        } else {
          try {
            const res = await window.formbodyStrCreateOrUpdateFormBodyStr({ 
              formBodyStr: formDataStr, 
            });
            res && window.alert(`Success!! formDataStr have been updated.`)
          } catch (error) {
            window.alert(`Update formDataStr error!! ${JSON.stringify(error)}`)
          }
        }
      },
  
      addProfile: async ({
        formDataStr = '',
        profileName = '',
        pageUrl = '',
      }) => {
        if(!formDataStr || !profileName || !pageUrl) {
          window.alert(`Some value missed, please input all value.`)
          return;
        }
        if(!window.addNewProfileToIndexedDB) {
          window.alert(API.errorMessages.initDBFirst);
          return;
        }
        try {
          const res = await window.addNewProfileToIndexedDB({ formDataStr, profileName, pageUrl });
          console.log('New profile added: ', res)
          res && window.alert(`Success!! New profiel data have been added.`)
          return res;
        } catch (error) {
          window.alert(`Add new profile data error!! ${JSON.stringify(error)}`)
          return undefined;
        }
      },
  
      queryProfileList: async () => {
        if(!window.myIndexedDB) {
          throw new Error(API.errorMessages.initDBFirst)
        }
        return window.myIndexedDB.readAllData()
      }
    }
  
    class StateStore {
      constructor(initS = {}) {
        this.state = { ...initS };
        this.listeners = [];
      }
  
      update() {
        this.listeners.forEach(l => {
          l(this.state);
        })
      }
  
      setState(partialS = {}) {
        let partialNewS = {}
        if(typeof partialS === 'function') {
          partialNewS = partialS(this.state)
        } else {
          partialNewS = {...partialS}
        }
        this.state = { ...this.state, ...partialNewS };
        // console.log(this.state);
        this.update();
      }
  
      addListener(listner = () => {}) {
        this.listeners.push(listner);
      }
    }
  
    const initCtxState = {
      loading: false,
      error: '',
      profileListData: [],
    }
    const ctx = new StateStore(initCtxState)
  
    const initState = {
      formDataStr: '',
      profileName: '',
      pageUrl: '',
    };
  
    const FetchFbPostEl = () => {
      const wrapper = document.createElement('div');
      wrapper.className = 'fetch-fb-post--wrapper';
  
      const Title = document.createElement('h2');
      Title.innerText = '按下按鈕直接抓取貼文'
  
      const FetchPostBtn = document.createElement('button');
      FetchPostBtn.className = 'fetch-post';
      FetchPostBtn.innerText = '抓取貼文';
      
      wrapper.appendChild(Title)
      wrapper.appendChild(FetchPostBtn)
  
      const fetchFbPost = async () => {
        if(!window.queryFbPosts) {
          window.alert('Please re initialize data :(');
        } else {
          FetchPostBtn.disabled = true;
          await window.queryFbPosts();
          FetchPostBtn.disabled = false;
        }
      }
  
      FetchPostBtn.addEventListener('click', () => {
        fetchFbPost()
      });
  
      function init() {
        ctx.addListener(s => {
          if(typeof s.queriedPostsPercentage === 'number') {
            if(s.queriedPostsPercentage === 100) {
              FetchPostBtn.innerText = '抓取貼文';
            } else {
              FetchPostBtn.innerText = `Querying... ${s.queriedPostsPercentage}%`
            }
          }
        })
      };
      init();
  
      return wrapper;
    }
  
    const makeFormElByTemplate = () => {
      let state = {
        ...initState,
      };
  
      const template = `
        ${style}
        ${addProfileFormTemplate}
      `
      const root = document.createElement('div')
      root.innerHTML = template
      // document.body.innerHTML = style;
      // document.body.innerHTML += formDescp;
      // document.body.innerHTML += addProfileFormTemplate;
  
      function init() {
        const handleResetElValue = (el) => {
          el.value = '';
        }
    
        const profileNameInput = document.getElementById('profileName');
        profileNameInput && profileNameInput.addEventListener('input', (e) => {
          state.profileName = e.target.value;
        })
    
        const pageUrlInput = document.getElementById('pageUrl');
        pageUrlInput && pageUrlInput.addEventListener('input', (e) => {
          state.pageUrl = e.target.value;
        })
    
        const formDataStrTextarea = document.getElementById('formDataStr');
        formDataStrTextarea && formDataStrTextarea.addEventListener('input', (e) => {
          state.formDataStr = e.target.value;
        })
    
        const handleResetAllInputValue = () => {
          state = {...initState};
          handleResetElValue(pageUrlInput)
          handleResetElValue(profileNameInput)
          handleResetElValue(formDataStrTextarea)
        }
    
        const handleSendData = async () => {
          // console.log(state);
          
          if(state.pageUrl && state.profileName && state.formDataStr) {
            const res = await API.addProfile(state);
            res && ctx.setState(s => ({
              ...initState,
              profileListData: [...s.profileListData, res.newData]
            }))
          } else {
            await API.updateFormDataStr(state.formDataStr)
          }
          
          handleResetAllInputValue();
        }
    
        const sendBtn = document.getElementById('send');
        sendBtn && sendBtn.addEventListener('click', async () => {
          // console.log(state);
          sendBtn.disabled = true;
          await handleSendData();
    
          sendBtn.disabled = false;
        })
      }
  
      return ({ root, init, })
    }
  
    const ProfileItem = ({
      profileName,
      pageUrl,
      id,
      docId,
    }) => {
      return `
        <li class=${'profile-item'}>
          <div>${id}</div>
          <div>${profileName}</div>
          <div>${pageUrl}</div>
          <div>${docId}</div>
        </li>
      `
    }
  
    const ProfileList = ({
      profileListData
    }) => {
      const Header = ProfileItem({
        id: 'ID',
        profileName: '粉絲專頁名稱',
        pageUrl: '粉專連結',
        docId: 'DOC_ID'
      })
      return `
        <ul class="${'profile-list--wrapper'}">
          ${Header}
          <hr />
          ${profileListData.map(p => (
            ProfileItem(p)
          )).join('')}
        </ul>
      `
    }
  
    const renderProfileList = () => {
      const Loading = `<p>Loading....</p>`
      // const Loading = document.createElement('p')
      // Loading.innerText = 'Loading...';
      
      const FetchBtn = document.createElement('button');
      FetchBtn.innerText = 'Get Latest Profile List';
  
      const ProfileListPart = document.createElement('div');
  
      const ProfileListWrapper = document.createElement('div');
      ProfileListWrapper.appendChild(ProfileListPart);
      ProfileListWrapper.appendChild(FetchBtn);
  
      const handleFetchProfileListData = async () => {
        try {
          ctx.setState({ loading: true, })
          const res = await API.queryProfileList();
          ctx.setState({ 
            profileListData: res, error: false, loading: false, 
          })
          return res
        } catch (error) {
          ctx.setState({ error, })
          return error;
        }
      }
  
      const updateEl = async ({ loading, profileListData, error, }) => {
        // console.log({ loading, profileListData, })
        ProfileListPart.innerHTML = '';
        if(error) {
          ProfileListPart.innerHTML = `Error: ${error}`;
          return;
        }
        if(loading) {
          ProfileListPart.innerHTML = Loading;
        } else {
          ProfileListPart.innerHTML = ProfileList({ profileListData, });
        }
      }
      
      FetchBtn.addEventListener('click', () => {
        handleFetchProfileListData()
      })
  
      // document.body.appendChild(ProfileListWrapper);
      
      function init() {
        (async () => {
          ctx.addListener((s) => {
            updateEl(s)
          })
          handleFetchProfileListData();
        })()
      }
  
      init()
  
      return ProfileListWrapper;
    }
  
    function render() {
      const FormEl = makeFormElByTemplate()
      const elements = [
        FetchFbPostEl(),
        FormEl.root,
        renderProfileList(),
      ]
      
      elements.forEach(el => {
        document.body.appendChild(
          el
        )
      })
      FormEl.init()
    }
    
    function main() {
      clearWholePage();
      // makeFormEl();
      render();
      window.ctx = ctx;
      console.log('Template generated.')
    }
    
    main()
  })();
  
})()