// export const API_ROOT = 'http://localhost:8017';
let apiRoot = ''
if (process.env.BUILD_MODE === 'dev') {
  apiRoot = 'http://trello-alb-1749900621.us-east-1.elb.amazonaws.com'
}

if (process.env.BUILD_MODE === 'production') {
  apiRoot = 'http://trello-alb-1749900621.us-east-1.elb.amazonaws.com'
}

export const API_ROOT = apiRoot

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12

export const CARD_MEMBER_ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
}
