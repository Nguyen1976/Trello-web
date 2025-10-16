// export const API_ROOT = 'http://localhost:8017';
let apiRoot = ''
if (process.env.BUILD_MODE === 'dev') {
  apiRoot = 'http://50.19.56.60:8017'
}

if (process.env.BUILD_MODE === 'production') {
  apiRoot = 'http://50.19.56.60:8017'
}

export const API_ROOT = apiRoot

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12

export const CARD_MEMBER_ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
}
