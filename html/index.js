const configs = {
  IG_JSON_FILE_URL: '../outputs/ig-crawled-output-2021-06-02-00:56:28.json',
}

const fetchFile = (url = '') => {
  return fetch(url, {
    mode: 'cors',
  })
    .then(res => {
      // console.log(res)
      return res
    })
    .then(res => res.json())
    .catch(err => {
      console.log(err)
    })
}

const renderSingleIgStoryEl = ({
  imgSrc = '',
  title = '',
  date = ''
}) => {
  const wrapper = document.createElement('div')
  wrapper.className = 'ig-story-wrapper'

  const img = document.createElement('img')
  img.src = 'https://cors-anywhere.herokuapp.com/' + imgSrc;
  img.crossOrigin = 'Anonymous';

  const titleEl = document.createElement('h2')
  titleEl.innerText = title

  const time = document.createElement('time')
  time.innerText = date

  const children = [titleEl, img, time]
  children.forEach(child => {
    wrapper.appendChild(child)
  })
  return wrapper
}

const ListDataHandler = {
  handleRaw(data = {}) {
    return ({
      title: data.caption,
      imgSrc: data.img_src,
      date: data.datetime,
    })
  },
}

const renderList = (listData = [], _rootEl = undefined) => {
  const handledListData = listData.map(d => (
    ListDataHandler.handleRaw(d)
  ))
  const els = handledListData.map(d => (
    renderSingleIgStoryEl(d)
  ))
  els.forEach(el => {
    _rootEl && _rootEl.appendChild(el)
  })
  return els
}

(function () {
  window.onload = async () => {
    const rootEl = document.getElementById('root');
    const res = await fetchFile(configs.IG_JSON_FILE_URL)
    console.log(res)
    renderList(res, rootEl)
  }
}())