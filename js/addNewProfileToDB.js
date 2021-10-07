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

  transaction.onerror = (err) => {
    rej(err.target.error)
  }
  transaction.oncomplete = () => {
    res('all done.')
  }
  
  const objStore = transaction.objectStore(tableName);
  dataList.forEach(d => {
    const addReq = objStore.add(d);
  })
}

var createOrWriteNewDataToIndexedDB = (dataList = [], tableName = '', keyList = [{
  keyName: 'name',
  options: { unique: false, },
}]) => {
  return new Promise((res, rej) => {
    const dbReq = indexedDB.open('TestDB', 2);
    
    dbReq.onerror = (e) => { rej(e.target.error); };
  
    dbReq.onupgradeneeded = createNewIndexedDB({
      dataList,
      tableName,
      keyList,
    })(res, rej);

    dbReq.onsuccess = writeNewDataToIndexedDB({
      dataList,
      tableName,
    })(res, rej);
  })
}

var readIndexedDBAllVal = (tableName = '') => {
  return new Promise((res, rej) => {
    let db;
    const dbReq = indexedDB.open('TestDB', 2);

    dbReq.onerror = (e) => { rej(e); };

    dbReq.onsuccess = (ev) => {
      db = ev.target.result;
      let readRes = [];

      // const db = e.target.result;
      const objStore = db.transaction(tableName).objectStore(tableName);
      const cursor = objStore.openCursor();

      cursor.onerror = _ce => rej(_ce);
      cursor.onsuccess = ce => {
        const cursorRes = ce.target.result;
        if(cursorRes) {
          // console.log(cursorRes)
          readRes.push(cursorRes.value);
          cursorRes.continue();
        } else {
          res(readRes)
        }
      }
    }

  })
}

var addNewDataListToIndexedDB = (tableName = '', newDataList = []) => {
  return new Promise((res, rej) => {
    const dbReq = indexedDB.open('TestDB', 2);

    dbReq.onerror = (e) => { rej(e.target.error); };

    dbReq.onsuccess = (ev) => {
      const db = ev.target.result;
      const transaction = db.transaction(tableName, 'readwrite');

      transaction.onerror = (err) => {
        rej(err.target.error)
      }
      transaction.oncomplete = () => {
        res('all done.')
      }
      
      const objStore = transaction.objectStore(tableName);
      newDataList.forEach(d => {
        const addReq = objStore.add(d);
      })
    }

  })
}

var updateIndexedDBVal = () => {
  return new Promise((res, res) => {

  })
}

const extendedProfileListDataKey = 'EXTENDED_PROFILE_LIST_DATA';

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

const getExtendedProfileDataFromLS = () => {
  const dataFromLS = localStorage.getItem(extendedProfileListDataKey);
  const parsedProfileDataFromLS = dataFromLS ? JSON.parse(dataFromLS) : [];
  return parsedProfileDataFromLS
}
const appendProfileDataToLSData = (profileData = {}) => {
  if(profileData) {
    const parsedProfileDataFromLS = getExtendedProfileDataFromLS()
    const res = [...parsedProfileDataFromLS, profileData];
    localStorage.setItem(extendedProfileListDataKey, JSON.stringify(res))
  }
}

const extendNewProfileData = (options) => {
  const profileData = makeSingleProfileConfigFromFormData(options);
  appendProfileDataToLSData(profileData);
  console.log(options.profileName + ' added successfully :)')
}