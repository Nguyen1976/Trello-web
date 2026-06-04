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

  const maybeIt = (name, fn, timeout = 180000) => {
    if (canRunE2E()) {
      it(name, fn, timeout)
    } else {
      it.skip(`${name} (set E2E_RUN=true and E2E_TEST_EMAIL/PASSWORD)`, () => {})
    }
  }

  // TC-E2E-FULL-01: kịch bản đầy đủ end-to-end
  // login → tạo board → vào board → tạo 2 cột → tạo card → kéo card sang cột khác
  // → edit tên card → kéo cột → edit tên cột → xóa 2 cột → thoát + xóa board → đăng xuất
  maybeIt(
    'login → 2 columns → card → drag card → edit card → drag column → edit column → delete columns → delete board → logout',
    async () => {
      const id = stamp()
      const boardTitle = `000 E2E Board ${id}`
      const boardDesc = `Created automatically by Selenium ${id}`
      const colA = `Col A ${id}`
      const colB = `Col B ${id}`
      const cardTitle = `Card ${id}`
      const cardTitleEdited = `Card ${id} edited`
      const colAEdited = `Col A ${id} edited`

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

      // 4) Mở board vừa tạo
      const boardId = await boards.openBoardByTitle(boardTitle)
      expect(boardId).toBeTruthy()

      const boardPage = new BoardDetailPage(driver)
      await boardPage.waitLoaded()
      console.log('E2E full: board page loaded')

      // 5) Tạo 2 column
      await boardPage.addColumn(colA)
      await boardPage.addColumn(colB)
      expect(await boardPage.getColumnCount()).toBe(2)
      console.log('E2E full: 2 columns created')

      // 6) Tạo card trong Col A
      await boardPage.addCardToColumn(colA, cardTitle)
      expect(await boardPage.isCardInColumn(cardTitle, colA)).toBe(true)
      console.log('E2E full: card created in Col A')

      // 7) Kéo card từ Col A sang Col B (chỉ 1 lần kéo)
      await boardPage.dragCardToColumn(cardTitle, colB)
      expect(await boardPage.isCardInColumn(cardTitle, colB)).toBe(true)
      console.log('E2E full: card dragged to Col B')

      // 8) Edit tên card (mở modal → đổi title → đóng)
      await boardPage.openCardModal(cardTitle)
      await boardPage.editActiveCardTitle(cardTitleEdited)
      await boardPage.closeCardModal()
      await boardPage.getCardElement(cardTitleEdited)
      console.log('E2E full: card title edited')

      // 9) Kéo cột: đưa Col A ra sau Col B → thứ tự [Col B, Col A]
      await boardPage.dragColumn(colA, colB)
      const order = await boardPage.getColumnTitlesInOrder()
      expect(order.indexOf(colA)).toBeGreaterThan(order.indexOf(colB))
      console.log('E2E full: columns reordered')

      // 10) Edit tên cột (Col A → Col A edited)
      await boardPage.editColumnTitle(colA, colAEdited)
      expect(await boardPage.getColumnTitlesInOrder()).toContain(colAEdited)
      console.log('E2E full: column title edited')

      // 11) Xóa 2 cột
      await boardPage.deleteColumn(colAEdited)
      await boardPage.deleteColumn(colB)
      expect(await boardPage.getColumnCount()).toBe(0)
      console.log('E2E full: both columns deleted')

      // 12) Thoát ra ngoài + xóa board (app chưa có nút xóa board → dùng API _destroy)
      await boards.goToBoardsList()
      await boards.softDeleteBoard(boardId)
      await boards.waitBoardAbsentById(boardId)
      console.log('E2E full: board deleted')

      // 13) Đăng xuất
      await boards.logout()
      expect(await driver.getCurrentUrl()).toMatch(/\/login/)
      console.log('E2E full: logged out')
    }
  )
})
