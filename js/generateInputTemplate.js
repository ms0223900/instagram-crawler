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
    const FormAndListRoot = document.createElement('div');
    FormAndListRoot.className = 'form-and-list--wrapper';
    
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
})()