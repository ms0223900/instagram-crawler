(() => {
  const clearWholePage = () => {
    document.body.innerHTML = ''
  }

  const style = `
    <style>
      body {
        text-align: center;
      }

      .add-profile-form-template {
        padding: 2rem;
        margin: auto;
        max-width: 400px;
      }

      label {
        display: flex;
        justify-content: center;
        align-items: center;
        padding-bottom: 1rem;
      }

      input,
      textarea {
        width: 80%;
        margin-left: 0.5rem;
        min-width: 300px;
      }
      
      textarea {
        min-height: 400px;
      }
    </style>
  `

  const formDescp = `
    <div>
      <h1>Desp</h1>
      <p>${'如果不填粉絲專頁名稱和粉絲專頁網址，就是直接更新爬文的參數'}</p>
      <hr />
    </div>
  `

  const addProfileFormTemplate = `
    <div class="root add-profile-form-template">
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
  `
  
  const makeFormEl = () => {
    const state = {
      bodyFormStr: '',
      profileName: '',
      pageUrl: '',
    };

    const wrapper = document.createElement('div')
    wrapper.className = 'root-wrapper'
    wrapper.style.padding = '20px';
    wrapper.style.margin = 'auto';
  
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Input form body';
    textarea
    textarea.oninput = (e) => {
      state.bodyFormStr = e.target.value;
    }
  
    const input = document.createElement('input');
    input.placeholder = 'Input profile name';
    input.oninput = (e) => {
      state.profileName = e.target.value;
    }
  
    const sendButton = document.createElement('button');
    sendButton.innerText = 'Enter';
    sendButton.addEventListener('click', () => {
      console.log(state)
    })

    const elementList = [
      textarea,
      input,
      sendButton
    ]
    
  
    elementList.forEach(el => {
      // document.body.appendChild(el)
      wrapper.appendChild(el)
    })
    document.body.appendChild(wrapper)
  }

  const API = {
    updateFormDataStr: async (formDataStr = '') => {
      if(!formDataStr) return;
      if(!window.formbodyStrCreateOrUpdateFormBodyStr) {
        window.alert('Init MyIndexedDB first!!')
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
        window.alert('Init MyIndexedDB first!!');
        return;
      }
      try {
        const res = await window.addNewProfileToIndexedDB({ formDataStr, profileName, pageUrl });
        console.log('New profile added: ', res)
        res && window.alert(`Success!! New profiel data have been added.`)
      } catch (error) {
        window.alert(`Add new profile data error!! ${JSON.stringify(error)}`)
      }
    }
  }

  const initState = {
    formDataStr: '',
    profileName: '',
    pageUrl: '',
  };

  const makeFormElByTemplate = () => {
    let state = {
      ...initState,
    };

    document.body.innerHTML = style;
    document.body.innerHTML += formDescp;
    document.body.innerHTML += addProfileFormTemplate;

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

    const sendBtn = document.getElementById('send');
    sendBtn && sendBtn.addEventListener('click', async () => {
      console.log(state);
      sendBtn.disabled = true;
      
      if(state.pageUrl && state.profileName) {
        await API.addProfile(state)
      } else {
        await API.updateFormDataStr(state.formDataStr)
      }

      handleResetAllInputValue();
      sendBtn.disabled = false;
    })
  }
  
  function main() {
    clearWholePage();
    // makeFormEl();
    makeFormElByTemplate()
    console.log('Template generated.')
  }
  
  main()
})()