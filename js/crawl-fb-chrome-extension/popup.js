const main = () => {
  const btn = document.getElementById('activeFbCrawl');
  btn && btn.addEventListener('click', () => {
    const message = {
      action: 'INIT_FB_CRAWL'
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
        
      });
    });
  })
}

main();