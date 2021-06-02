from __future__ import unicode_literals

import glob
import json
import os
import re
import sys
import time
import traceback
from builtins import open
from time import sleep, time_ns

from tqdm import tqdm

from . import secret
from .browser import Browser
from .exceptions import RetryException
from .fetch import fetch_caption
from .fetch import fetch_comments
from .fetch import fetch_datetime
from .fetch import fetch_imgs
from .fetch import fetch_likers
from .fetch import fetch_likes_plays
from .fetch import fetch_details
from .utils import instagram_int
from .utils import randmized_sleep
from .utils import retry
from inscrawler import browser


class Logging(object):
    PREFIX = "instagram-crawler"

    def __init__(self):
        try:
            timestamp = int(time.time())
            self.cleanup(timestamp)
            self.logger = open("/tmp/%s-%s.log" % (Logging.PREFIX, timestamp), "w")
            self.log_disable = False
        except Exception:
            self.log_disable = True

    def cleanup(self, timestamp):
        days = 86400 * 7
        days_ago_log = "/tmp/%s-%s.log" % (Logging.PREFIX, timestamp - days)
        for log in glob.glob("/tmp/instagram-crawler-*.log"):
            if log < days_ago_log:
                os.remove(log)

    def log(self, msg):
        if self.log_disable:
            return

        self.logger.write(msg + "\n")
        self.logger.flush()

    def __del__(self):
        if self.log_disable:
            return
        self.logger.close()


class InsCrawler(Logging):
    URL = "https://www.instagram.com"
    RETRY_LIMIT = 10

    def __init__(self, has_screen=False):
        super(InsCrawler, self).__init__()
        self.browser = Browser(has_screen)
        self.page_height = 0
        self.login()

    def _dismiss_login_prompt(self):
        ele_login = self.browser.find_one(".Ls00D .Szr5J")
        if ele_login:
            ele_login.click()

    def login(self):
        browser = self.browser
        url = "%s/accounts/login/" % (InsCrawler.URL)
        browser.get(url)
        u_input = browser.find_one('input[name="username"]')
        u_input.send_keys(secret.username)
        p_input = browser.find_one('input[name="password"]')
        p_input.send_keys(secret.password)

        login_btn = browser.find_one(".L3NKy")
        login_btn.click()

        @retry()
        def check_login():
            if browser.find_one('input[name="username"]'):
                raise RetryException()

        check_login()

    def make_userpage_url(self, username):
        return "%s/%s/" % (InsCrawler.URL, username)

    def get_user_profile(self, username):
        browser = self.browser
        url = "%s/%s/" % (InsCrawler.URL, username)
        browser.get(url)
        name = browser.find_one(".rhpdm")
        desc = browser.find_one(".-vDIg span")
        photo = browser.find_one("._6q-tv")
        statistics = [ele.text for ele in browser.find(".g47SY")]
        post_num, follower_num, following_num = statistics
        return {
            "name": name.text,
            "desc": desc.text if desc else None,
            "photo_url": photo.get_attribute("src"),
            "post_num": post_num,
            "follower_num": follower_num,
            "following_num": following_num,
        }

    def get_user_profile_from_script_shared_data(self, username):
        browser = self.browser
        url = "%s/%s/" % (InsCrawler.URL, username)
        browser.get(url)
        source = browser.driver.page_source
        p = re.compile(r"window._sharedData = (?P<json>.*?);</script>", re.DOTALL)
        json_data = re.search(p, source).group("json")
        data = json.loads(json_data)

        user_data = data["entry_data"]["ProfilePage"][0]["graphql"]["user"]

        return {
            "name": user_data["full_name"],
            "desc": user_data["biography"],
            "photo_url": user_data["profile_pic_url_hd"],
            "post_num": user_data["edge_owner_to_timeline_media"]["count"],
            "follower_num": user_data["edge_followed_by"]["count"],
            "following_num": user_data["edge_follow"]["count"],
            "website": user_data["external_url"],
        }

    def get_user_posts(self, username, number=None, detail=False):
        user_profile = self.get_user_profile(username)
        if not number:
            number = instagram_int(user_profile["post_num"])

        self._dismiss_login_prompt()

        if detail:
            return self._get_posts_full(number)
        else:
            return self._get_posts(number)

    def get_latest_posts_by_tag(self, tag, num):
        url = "%s/explore/tags/%s/" % (InsCrawler.URL, tag)
        self.browser.get(url)
        return self._get_posts(num)

    def auto_like(self, tag="", maximum=1000):
        self.login()
        browser = self.browser
        if tag:
            url = "%s/explore/tags/%s/" % (InsCrawler.URL, tag)
        else:
            url = "%s/explore/" % (InsCrawler.URL)
        self.browser.get(url)

        ele_post = browser.find_one(".v1Nh3 a")
        ele_post.click()

        for _ in range(maximum):
            heart = browser.find_one(".dCJp8 .glyphsSpriteHeart__outline__24__grey_9")
            if heart:
                heart.click()
                randmized_sleep(2)

            left_arrow = browser.find_one(".HBoOv")
            if left_arrow:
                left_arrow.click()
                randmized_sleep(2)
            else:
                break

    def _get_posts_full(self, num):
        @retry()
        def check_next_post(cur_key):
            ele_a_datetime = browser.find_one(".eo2As .c-Yi7")

            # It takes time to load the post for some users with slow network
            if ele_a_datetime is None:
                raise RetryException()

            next_key = ele_a_datetime.get_attribute("href")
            if cur_key == next_key:
                raise RetryException()

        browser = self.browser
        browser.implicitly_wait(1)
        browser.scroll_down()
        ele_post = browser.find_one(".v1Nh3 a")
        ele_post.click()
        dict_posts = {}

        pbar = tqdm(total=num)
        pbar.set_description("fetching")
        cur_key = None

        all_posts = self._get_posts(num)
        i = 0

        # Fetching all posts
        for _ in all_posts:
            dict_post = {}

            # Fetching post detail
            try:
                # post_key is post's url
                post_key = all_posts[i]['key']
                # print('post_key', post_key)
                # Fetching datetime and url as key
                browser.get(post_key)
                # ele_a_datetime = browser.find_one(".eo2As .c-Yi7")
                # cur_key = ele_a_datetime.get_attribute("href")
                cur_key = post_key
                dict_post["key"] = cur_key
                fetch_datetime(browser, dict_post)
                fetch_imgs(browser, dict_post)
                fetch_likes_plays(browser, dict_post)
                fetch_likers(browser, dict_post)
                fetch_caption(browser, dict_post)
                fetch_comments(browser, dict_post)

                if(i < num):
                    # check_next_post(post_key)
                    i = i + 1

            except RetryException:
                sys.stderr.write(
                    "\x1b[1;31m"
                    + "Failed to fetch the post: "
                    + cur_key or 'URL not fetched'
                    + "\x1b[0m"
                    + "\n"
                )
                break

            except Exception:
                sys.stderr.write(
                    "\x1b[1;31m"
                    + "Failed to fetch the post: "
                    + cur_key if isinstance(cur_key,str) else 'URL not fetched'
                    + "\x1b[0m"
                    + "\n"
                )
                traceback.print_exc()

            self.log(json.dumps(dict_post, ensure_ascii=False))
            dict_posts[browser.current_url] = dict_post
                    
            pbar.update(1)

        pbar.close()
        posts = list(dict_posts.values())
        if posts:
            posts.sort(key=lambda post: post["datetime"], reverse=True)
        return posts

    def _get_posts(self, num):
        """
            To get posts, we have to click on the load more
            button and make the browser call post api.
        """
        TIMEOUT = 600
        browser = self.browser
        key_set = set()
        posts = []
        pre_post_num = 0
        wait_time = 1

        pbar = tqdm(total=num)

        def start_fetching(pre_post_num, wait_time):
            ele_posts = browser.find(".v1Nh3 a")
            for ele in ele_posts:
                key = ele.get_attribute("href")
                if key not in key_set:
                    dict_post = { "key": key }
                    ele_img = browser.find_one(".KL4Bh img", ele)
                    dict_post["caption"] = ele_img.get_attribute("alt")
                    dict_post["img_url"] = ele_img.get_attribute("src")

                    fetch_details(browser, dict_post)

                    key_set.add(key)
                    posts.append(dict_post)

                    if len(posts) == num:
                        break

            if pre_post_num == len(posts):
                pbar.set_description("Wait for %s sec" % (wait_time))
                sleep(wait_time)
                pbar.set_description("fetching")

                wait_time *= 2
                browser.scroll_up(300)
            else:
                wait_time = 1

            pre_post_num = len(posts)
            browser.scroll_down()

            return pre_post_num, wait_time

        pbar.set_description("fetching")
        while len(posts) < num and wait_time < TIMEOUT:
            post_num, wait_time = start_fetching(pre_post_num, wait_time)
            pbar.update(post_num - pre_post_num)
            pre_post_num = post_num

            loading = browser.find_one(".W1Bne")
            if not loading and wait_time > TIMEOUT / 2:
                break

        pbar.close()
        print("Done. Fetched %s posts." % (min(len(posts), num)))
        # print('posts', posts[:num])
        return posts[:num]

    def get_stories(self, story_buttons=[], num=100):
        browser = self.browser
        story_buttons_length = len(story_buttons)
        all_stories = []

        if story_buttons:
            # 點進限時動態頁面
            story_buttons[0].click()
            sleep(0.5)

            # 找目前呈現在頁面的，所有限時動態元素(小的縮圖那個)
            all_stories_now = browser.find(".jVLDv")
            # for _ in range(3): # 先測3個
            for i in range(story_buttons_length):
                if i == num:
                    break

                story_data = {}

                # 先暫停限時動態的輪播
                play_pause_btn = browser.find_one("button.wpO6b")
                if play_pause_btn:
                    play_pause_btn.click()
                
                # 抓連結
                # 連結按鈕
                see_more_button = browser.find_one('.scRau')
                url = ''
                # 取得連結
                if see_more_button:
                    see_more_button.click()
                    sleep(0.5)
                    # 切到下一個tab
                    browser.switch_to_tab(1)
                    url = browser.current_url
                    browser.close_current_tab()
                story_data['story_url'] = url
                sleep(0.5)

                # 抓時間
                time_el = browser.find_one("time.BPyeS.Nzb55")
                if time_el:
                    datetime = time_el.get_attribute("datetime")
                    story_data['datetime'] = datetime

                # 抓圖片
                story_img = browser.find_one("img.y-yJ5")
                if story_img:
                    srcset = story_img.get_attribute("srcset")
                    src = story_img.get_attribute("src")
                    story_data['img_src'] = src or srcset;
                
                all_stories.append(story_data)

                # 更新目前的限時動態元素
                all_stories_now = browser.find(".jVLDv")
                all_stories_now_length = len(all_stories_now)
                # print('all_stories_now_length: ', all_stories_now_length)
                next_story_el = None

                # 抓標題
                caption = browser.find_one(".FPmhX.notranslate._1PU_r")
                story_data['caption'] = caption.text

                # 找下一個限時動態
                if i == 0:
                    next_story_el = all_stories_now[0]
                elif i == 1:
                    if all_stories_now_length > 1:
                        next_story_el = all_stories_now[1]
                elif i == 2:
                    if all_stories_now_length > 2:
                        next_story_el = all_stories_now[2]
                else:
                    if all_stories_now_length <= 3:
                        next_story_el = all_stories_now[2]
                    else:
                        next_story_el = all_stories_now[3]
                        
                # 點擊下個限時動態
                print('%s stories finished.' % str(i + 1))
                if next_story_el:
                    next_story_el.click()
                    randmized_sleep(0.5)

        print('Stories fetched completed.')
        return all_stories 

    def get_user_story_highlights(self, username, num=100):
        browser = self.browser
        url = self.make_userpage_url(username)
        browser.get(url)
        story_buttons = browser.find(".aoVrC.D1yaK")
        return self.get_stories(story_buttons, num)
    
    # 取得首頁的所有限時動態
    def get_all_stories(self, num=100):
        browser = self.browser
        browser.get('https://www.instagram.com/')
        see_later_btn = browser.find_one("button.aOOlW.HoLwm")
        if see_later_btn:
            see_later_btn.click()
        story_buttons = browser.find(".OE3OK")
        return self.get_stories(story_buttons, num)