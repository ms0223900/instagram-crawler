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
})()