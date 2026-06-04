import { Builder, By, until } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import { LoginPage } from './pages/LoginPage.js'
import { BoardsListPage } from './pages/BoardsListPage.js'
import { BoardDetailPage } from './pages/BoardDetailPage.js'

const clearPinnedChromeDriverEnv = () => {
  delete process.env.CHROMEDRIVER_PATH
  delete process.env.CHROMEWEBDRIVER
  delete process.env['webdriver.chrome.driver']
}

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173'
const TEST_EMAIL = process.env.E2E_TEST_EMAIL
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD

const canRunE2E = () =>
  process.env.E2E_RUN === 'true' && TEST_EMAIL && TEST_PASSWORD

const stamp = () => Date.now().toString().slice(-6)

describe('Trello full E2E flow (Selenium)', () => {
  let driver

  beforeAll(async () => {
    if (!canRunE2E()) return
    clearPinnedChromeDriverEnv()
    const options = new chrome.Options()
    if (process.env.E2E_HEADED !== 'true') {
      options.addArguments('--headless=new')
    }
    options.addArguments(
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1400,900'
    )
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build()
  }, 90000)

  afterAll(async () => {
    if (driver) await driver.quit()
  })

  const maybeIt = (name, fn, timeout = 120000) => {
    if (canRunE2E()) {
      it(name, fn, timeout)
    } else {
      it.skip(`${name} (set E2E_RUN=true and E2E_TEST_EMAIL/PASSWORD)`, () => {})
    }
  }

  // TC-E2E-FULL-01: full happy path
  maybeIt(
    'login → create board → enter board → create column → create card',
    async () => {
      const id = stamp()
      const boardTitle = `000 E2E Board ${id}`
      const boardDesc = `Created automatically by Selenium ${id}`
      const columnTitle = `E2E Column ${id}`
      const cardTitle = `E2E Card ${id}`

      // 1) Login
      const login = new LoginPage(driver, BASE_URL)
      await login.open()
      await login.login(TEST_EMAIL, TEST_PASSWORD)

      // 2) Boards list
      const boards = new BoardsListPage(driver, BASE_URL)
      await boards.waitLoaded()

      // 3) Create board
      await boards.openCreateBoardModal()
      await boards.fillAndSubmitCreateBoard({
        title: boardTitle,
        description: boardDesc
      })

      // 4) Open the board we just created (modal closes + list refetch)
      await boards.openBoardByTitle(boardTitle)
      console.log('E2E full: opened board')

      const boardPage = new BoardDetailPage(driver)
      await boardPage.waitLoaded()
      console.log('E2E full: board page loaded')

      // 5) Create column
      await boardPage.addColumn(columnTitle)
      console.log('E2E full: column created')

      // 6) Create card in that column
      await boardPage.addCardToColumnByTitle(columnTitle, cardTitle)
      console.log('E2E full: card created')

      // 7) Verify card rendered
      const card = await boardPage.waitCardVisible(cardTitle)
      expect(await card.isDisplayed()).toBe(true)

      // 8) URL still on board detail
      expect(await driver.getCurrentUrl()).toMatch(/\/boards\//)
    }
  )
})
