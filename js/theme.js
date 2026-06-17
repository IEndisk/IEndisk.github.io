/*
  完整版主题脚本：支持 系统主题 + 手动切换 + 本地存储 + 多页面同步
*/
const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)');
const THEME_BTN_CLASS = '.icon-btn';
const HTML_ROOT = document.documentElement;

// 读取本地存储的主题
function getLocalTheme() {
  return localStorage.getItem('siteTheme');
}

// 设置主题
function setTheme(isDark) {
  HTML_ROOT.classList.toggle('dark', isDark);
}

// 初始化主题
function initTheme() {
  const localTheme = getLocalTheme();

  if (localTheme) {
    // 优先使用用户手动选择的主题
    setTheme(localTheme === 'dark');
  } else {
    // 没有手动选择，跟随系统主题
    setTheme(darkModeMedia.matches);
  }
}

// 绑定主题切换按钮点击事件
function bindThemeBtn() {
  const themeBtn = document.querySelector(THEME_BTN_CLASS);
  if (!themeBtn) return;

  themeBtn.addEventListener('click', () => {
    const nowDark = !HTML_ROOT.classList.contains('dark');
    setTheme(nowDark);
    // 存入本地存储，所有页面共享
    localStorage.setItem('siteTheme', nowDark ? 'dark' : 'light');
  });
}

// 监听系统主题自动切换
darkModeMedia.addEventListener('change', (e) => {
  // 用户没有手动选主题时，才跟随系统
  if (!getLocalTheme()) {
    setTheme(e.matches);
  }
});

// 导航栏滚动效果
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

// DOM加载完成后执行初始化
document.addEventListener('DOMContentLoaded', () => {
    
    const wrap = document.querySelector('.project-scroll');

if(wrap){

    let isDown = false;
    let startX;
    let startScroll;

    wrap.addEventListener('mousedown',(e)=>{

        isDown = true;

        startX = e.pageX;
        startScroll = wrap.scrollLeft;

        wrap.style.cursor='grabbing';
    });

    document.addEventListener('mouseup',()=>{

        if(!isDown) return;

        isDown = false;

        wrap.style.cursor='grab';

        const max =
            wrap.scrollWidth - wrap.clientWidth;

        if(wrap.scrollLeft < 0){

            wrap.scrollTo({
                left:0,
                behavior:'smooth'
            });
        }

        if(wrap.scrollLeft > max){

            wrap.scrollTo({
                left:max,
                behavior:'smooth'
            });
        }
    });

    wrap.addEventListener('mousemove',(e)=>{

        if(!isDown) return;

        e.preventDefault();

        const move =
            (e.pageX - startX);

        let target =
            startScroll - move;

        const max =
            wrap.scrollWidth - wrap.clientWidth;

        // 左边阻尼
        if(target < 0){

            target *= 0.25;
        }

        // 右边阻尼
        else if(target > max){

            target =
                max +
                (target-max)*0.25;
        }

        wrap.scrollLeft = target;
    });

}

let touchStartX = 0;
let touchScroll = 0;

wrap.addEventListener('touchstart',(e)=>{

    touchStartX =
        e.touches[0].pageX;

    touchScroll =
        wrap.scrollLeft;
});

wrap.addEventListener('touchmove',(e)=>{

    const move =
        e.touches[0].pageX -
        touchStartX;

    let target =
        touchScroll - move;

    const max =
        wrap.scrollWidth -
        wrap.clientWidth;

    if(target < 0){

        target *= 0.25;
    }

    else if(target > max){

        target =
        max +
        (target-max)*0.25;
    }

    wrap.scrollLeft = target;
});

  initTheme();
  bindThemeBtn();
});

// 移动端汉堡菜单交互
document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.querySelector('.hamburger-btn');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-links a');

  // 点击汉堡 切换菜单状态
  if (hamburger && navLinks) {
hamburger.addEventListener('click', function () {

    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');

    document.body.classList.toggle('menu-open');
});

    // 点击导航链接 自动关闭菜单
    navItems.forEach(item => {
      item.addEventListener('click', function () {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    });
  }
});

/* =========================
   平板端项目卡片居中滑动（含超出回弹）
   ========================= */
document.addEventListener('DOMContentLoaded', function () {
  const projectWrap = document.querySelector('.project-wrap');
  if (!projectWrap) return;

  // 只在平板宽度下启用
  function isTablet() {
    return window.innerWidth >= 769 && window.innerWidth <= 1024;
  }

  let isDown = false;
  let startX = 0;
  let currentTranslate = 0;
  let velocity = 0;
  let lastX = 0;
  let lastTime = 0;
  let animationId = null;
  let rafId = null;

  // 卡片信息
  let cardWidth = 400;
  let gap = 40;
  let totalCards = 3;
  
  // 边界信息
  let leftBoundary = 0;
  let rightBoundary = 0;

  // 初始化：默认中间卡片居中
  function centerInitial() {
    if (!isTablet()) return;
    
    const containerWidth = projectWrap.parentElement.clientWidth;
    const middleIndex = Math.floor(totalCards / 2);
    const middleCardOffset = middleIndex * (cardWidth + gap);
    const centerPosition = middleCardOffset - (containerWidth - cardWidth) / 2;
    
    currentTranslate = -centerPosition;
    projectWrap.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;
    
    // 计算边界
    const firstCardOffset = 0;
    const lastCardOffset = (totalCards - 1) * (cardWidth + gap);
    leftBoundary = -(firstCardOffset - (containerWidth - cardWidth) / 2);
    rightBoundary = -(lastCardOffset - (containerWidth - cardWidth) / 2);
  }

  // 获取当前卡片索引
  function getCurrentCardIndex() {
    const offset = -currentTranslate;
    const index = Math.round(offset / (cardWidth + gap));
    return Math.max(0, Math.min(index, totalCards - 1));
  }

  // 让指定卡片居中（带轻微回弹）
  function snapToCard(index) {
    const containerWidth = projectWrap.parentElement.clientWidth;
    const targetOffset = index * (cardWidth + gap);
    const targetX = -(targetOffset - (containerWidth - cardWidth) / 2);
    
    // 使用CSS transition实现平滑过渡
    projectWrap.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    projectWrap.style.transform = `translate3d(${targetX}px, 0, 0)`;
    currentTranslate = targetX;
    
    // 动画结束后移除transition
    clearTimeout(window.snapTimeout);
    window.snapTimeout = setTimeout(() => {
      projectWrap.style.transition = 'none';
    }, 400);
  }

  // 超出边界回弹
  function bounceBack() {
    if (currentTranslate > leftBoundary) {
      // 超出左边界，回弹到左边界
      projectWrap.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      projectWrap.style.transform = `translate3d(${leftBoundary}px, 0, 0)`;
      currentTranslate = leftBoundary;
      
      setTimeout(() => {
        projectWrap.style.transition = 'none';
      }, 500);
    } else if (currentTranslate < rightBoundary) {
      // 超出右边界，回弹到右边界
      projectWrap.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      projectWrap.style.transform = `translate3d(${rightBoundary}px, 0, 0)`;
      currentTranslate = rightBoundary;
      
      setTimeout(() => {
        projectWrap.style.transition = 'none';
      }, 500);
    }
  }

  // 点击卡片居中功能
  function setupCardClickEvents() {
    if (!isTablet()) return;
    
    const cards = projectWrap.querySelectorAll('.project-card');
    cards.forEach((card, index) => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        if (isDown) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
        
        projectWrap.style.transition = 'none';
        snapToCard(index);
      });
    });
  }

  // 使用requestAnimationFrame优化拖动
  function updateDragPosition(walk) {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    
    rafId = requestAnimationFrame(() => {
      // 应用边界阻尼效果
      let newTranslate = startScroll + walk;
      
      // 如果超出边界，增加阻尼
      if (newTranslate > leftBoundary) {
        // 左边界超出，增加阻尼
        const overscroll = newTranslate - leftBoundary;
        newTranslate = leftBoundary + overscroll * 0.3; // 阻尼系数
      } else if (newTranslate < rightBoundary) {
        // 右边界超出，增加阻尼
        const overscroll = rightBoundary - newTranslate;
        newTranslate = rightBoundary - overscroll * 0.3; // 阻尼系数
      }
      
      currentTranslate = newTranslate;
      projectWrap.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;
    });
  }

  // 鼠标/触摸事件
  projectWrap.addEventListener('mousedown', (e) => {
    if (!isTablet()) return;
    isDown = true;
    projectWrap.classList.add('grabbing');
    startX = e.pageX;
    startScroll = currentTranslate;
    lastX = e.pageX;
    lastTime = Date.now();
    
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    
    projectWrap.style.transition = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDown || !isTablet()) return;
    
    e.preventDefault();
    const x = e.pageX;
    const walk = (x - startX) * 1.0;
    
    updateDragPosition(walk);
    
    // 计算速度
    const now = Date.now();
    const dt = now - lastTime;
    if (dt > 0) {
      velocity = (x - lastX) / dt * 10;
    }
    lastX = x;
    lastTime = now;
  });

  document.addEventListener('mouseup', () => {
    if (!isDown || !isTablet()) return;
    isDown = false;
    projectWrap.classList.remove('grabbing');
    
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    
    // 检查是否超出边界
    if (currentTranslate > leftBoundary || currentTranslate < rightBoundary) {
      // 超出边界，回弹
      bounceBack();
    } else {
      // 未超出边界，正常吸附
      const currentIndex = getCurrentCardIndex();
      let targetIndex = currentIndex;
      
      if (velocity > 0.3) {
        targetIndex = Math.max(0, currentIndex - 1);
      } else if (velocity < -0.3) {
        targetIndex = Math.min(totalCards - 1, currentIndex + 1);
      }
      
      snapToCard(targetIndex);
    }
    
    velocity = 0;
  });

  // 触摸事件支持
  let touchStartX = 0;
  let touchStartScroll = 0;
  
  projectWrap.addEventListener('touchstart', (e) => {
    if (!isTablet()) return;
    isDown = true;
    touchStartX = e.touches[0].pageX;
    touchStartScroll = currentTranslate;
    lastTime = Date.now();
    
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    
    projectWrap.style.transition = 'none';
  });

  projectWrap.addEventListener('touchmove', (e) => {
    if (!isDown || !isTablet()) return;
    
    e.preventDefault();
    const x = e.touches[0].pageX;
    const walk = (x - touchStartX) * 1.0;
    
    updateDragPosition(walk);
    
    const now = Date.now();
    const dt = now - lastTime;
    if (dt > 0) {
      velocity = (x - touchStartX) / dt * 10;
    }
    touchStartX = x;
    lastTime = now;
  });

  projectWrap.addEventListener('touchend', () => {
    if (!isDown || !isTablet()) return;
    isDown = false;
    
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    
    // 检查是否超出边界
    if (currentTranslate > leftBoundary || currentTranslate < rightBoundary) {
      // 超出边界，回弹
      bounceBack();
    } else {
      // 未超出边界，正常吸附
      const currentIndex = getCurrentCardIndex();
      let targetIndex = currentIndex;
      
      if (velocity > 0.3) {
        targetIndex = Math.max(0, currentIndex - 1);
      } else if (velocity < -0.3) {
        targetIndex = Math.min(totalCards - 1, currentIndex + 1);
      }
      
      snapToCard(targetIndex);
    }
    
    velocity = 0;
  });

  // 窗口大小变化时重新居中
  window.addEventListener('resize', centerInitial);
  
  // 初始化
  setTimeout(() => {
    centerInitial();
    setupCardClickEvents();
  }, 100);
});

// 在点击事件中添加一个轻微的缩放效果
card.addEventListener('click', (e) => {
  if (isDown) return;
  
  // 添加点击动画
  card.style.transition = 'transform 0.1s ease';
  card.style.transform = 'scale(0.98)';
  
  setTimeout(() => {
    card.style.transform = 'scale(1)';
  }, 100);
  
  snapToCard(index);
});