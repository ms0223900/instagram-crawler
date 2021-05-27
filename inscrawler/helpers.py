def get_next_story_el(index=0, all_stories=[]):
  all_stories_now_length = len(all_stories)
  next_story_el = None

  if index == 0:
      next_story_el = all_stories[0]
  elif index == 1:
      if all_stories_now_length > 1:
          next_story_el = all_stories[1]
  elif index == 2:
      if all_stories_now_length > 2:
          next_story_el = all_stories[2]
  else:
      if all_stories_now_length <= 3:
          next_story_el = all_stories[2]
      else:
          next_story_el = all_stories[3]
          
  return next_story_el