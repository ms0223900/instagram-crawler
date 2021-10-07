
var createDataToIndexedDB = (dataList = [], tableName = '', keyList = [{
  keyName: 'name',
  options: { unique: false, },
}]) => {
  return new Promise((res, rej) => {
    const dbReq = indexedDB.open('TestDB', 2);
    
    dbReq.onerror = (e) => { rej(e.target.error); };
  
    dbReq.onupgradeneeded = (e) => {
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
      let doneCount = 0;
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

        addReq.onsuccess = (e) => {
          // console.log(e.target.result)
          // doneCount += 1;
          // if(doneCount === newDataList.length) {
          //   res('all done.')
          // }
        }
      })
    }

  })
}

var updateIndexedDBVal = () => {
  return new Promise((res, res) => {

  })
}