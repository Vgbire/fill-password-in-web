// 密码DOM对象
let passwordDom;
// 插件获取的用户配置
let config;

// 根据配置填充密码
function fillPassword() {
  if (config) {
    if (passwordDom) {
      const lastValue = passwordDom.value;
      passwordDom.value = config.password;
      // react 特殊处理，否则不触发react响应式
      const tracker = passwordDom._valueTracker;
      if (tracker) {
        tracker.setValue(lastValue);
      }
      // react 特殊处理
      passwordDom.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
}

// 监听DOM变动，更改密码
function observePasswordDomDisplay() {
  const observe = new MutationObserver(() => {
    let current = document.querySelector(config.selector);
    if (current !== passwordDom) {
      passwordDom = current;
      fillPassword();
    }
  });
  observe.observe(document.querySelector("body"), {
    attributes: true,
    childList: true,
    subtree: true,
  });
}

// 初始化获取插件配置
function init() {
  chrome.storage.local.get("config", (data) => {
    config = data?.config;
    if (config && location.href.includes(config.domain)) {
      passwordDom = document.querySelector(config.selector);
      fillPassword();
      observePasswordDomDisplay();
    }
  });
}

// 确保密码DOM能获取到
const observer = new PerformanceObserver(function (list) {
  for (const entry of list.getEntries()) {
    init();
  }
});

observer.observe({ entryTypes: ["largest-contentful-paint"] });

// 监听插件
chrome.runtime.onMessage.addListener(() => {
  chrome.storage.local.get("config", (data) => {
    config = data?.config;
    if (config && location.href.includes(config.domain)) {
      fillPassword();
    }
  });
});
