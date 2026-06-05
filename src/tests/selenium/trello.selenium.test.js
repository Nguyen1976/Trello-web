import { Builder, By, until } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import { LoginPage } from './pages/LoginPage.js'
import { BoardPage } from './pages/BoardPage.js'
import { BoardsListPage } from './pages/BoardsListPage.js'
import { BoardDetailPage } from './pages/BoardDetailPage.js'

// Tránh dùng chromedriver cố định trong node_modules (lệch version Chrome trên máy).
// Selenium 4.6+ Selenium Manager tự tải driver khớp Chrome đã cài.
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

describe('Trello Selenium E2E - UI pages coverage (khóa 4)', () => {
  let driver

  beforeAll(async () => {
    if (!canRunE2E()) {
      return
    }
    clearPinnedChromeDriverEnv()
    const options = new chrome.Options()
    // Cho phép tắt headless để debug (E2E_HEADED=true npm run test:e2e).
    if (process.env.E2E_HEADED !== 'true') {
      options.addArguments('--headless=new')
    }
    options.addArguments('--no-sandbox', '--disable-dev-shm-usage')
    options.addArguments('--window-size=1280,900')
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build()
  }, 60000)

  afterAll(async () => {
    if (driver) {
      await driver.quit()
    }
  })

  const maybeIt = (name, fn, timeout = 60000) => {
    if (canRunE2E()) {
      it(name, fn, timeout)
    } else {
      it.skip(`${name} (set E2E_RUN=true and E2E_TEST_EMAIL/PASSWORD)`, () => {})
    }
  }

  // ---------- Helpers dùng chung ----------

  // Xóa phiên đăng nhập: cookie (BE httpOnly) + localStorage (redux-persist whitelist 'user').
  // Phải mở origin trước thì localStorage mới thuộc đúng domain để xóa được.
  const clearSession = async () => {
    await driver.get(BASE_URL)
    await driver.manage().deleteAllCookies()
    await driver.executeScript(
      'try { window.localStorage.clear(); window.sessionStorage.clear() } catch (e) {}'
    )
  }

  // Đảm bảo đang ở trạng thái đã đăng nhập (đứng tại /boards). Đăng nhập nếu cần.
  const ensureLoggedIn = async () => {
    await driver.get(`${BASE_URL}/boards`)
    // Hoặc là boards list (đã login) hoặc là form login (chưa login) sẽ xuất hiện.
    await driver.wait(
      until.elementLocated(
        By.css(
          '[data-testid="open-create-board-modal"], [data-testid="login-form"]'
        )
      ),
      20000
    )
    const onLogin = await driver.findElements(
      By.css('[data-testid="login-form"]')
    )
    if (onLogin.length > 0) {
      const login = new LoginPage(driver, BASE_URL)
      await login.open()
      await login.login(TEST_EMAIL, TEST_PASSWORD)
      await driver.wait(until.urlContains('/boards'), 20000)
      await driver.wait(
        until.elementLocated(By.css('[data-testid="open-create-board-modal"]')),
        20000
      )
    }
  }

  // ===================================================================
  // Nhóm 1: Các trang public + điều hướng khi CHƯA đăng nhập
  // ===================================================================

  // TC-E2E-01: Trang Login hiển thị form đăng nhập
  maybeIt('login page renders the login form', async () => {
    await clearSession()
    const login = new LoginPage(driver, BASE_URL)
    await login.open()
    const form = await driver.findElement(By.css('[data-testid="login-form"]'))
    expect(await form.isDisplayed()).toBe(true)
  })

  // TC-E2E-02: Login sai → hiển thị thông báo lỗi
  maybeIt('login page shows error on invalid credentials', async () => {
    await clearSession()
    const login = new LoginPage(driver, BASE_URL)
    await login.open()
    await login.login('invalid@example.com', 'WrongPass1')
    await driver.wait(
      until.elementLocated(By.css('.MuiAlert-root, .Toastify__toast')),
      15000
    )
  })

  // TC-E2E-03: Trang Register hiển thị form đăng ký
  maybeIt('register page renders the register form', async () => {
    await clearSession()
    await driver.get(`${BASE_URL}/register`)
    await driver.wait(until.urlContains('/register'), 15000)
    // RegisterForm dùng MUI Zoom transitionDelay 200ms — chờ animation xong
    await driver.sleep(400)
    const registerBtn = await driver.wait(
      until.elementLocated(
        By.xpath('//button[@type="submit" and normalize-space()="Register"]')
      ),
      15000
    )
    await driver.wait(until.elementIsVisible(registerBtn), 15000)
    // Form đăng ký có 2 field password (mật khẩu + xác nhận), khác form login
    await driver.wait(
      async () => {
        const fields = await driver.findElements(
          By.css('input[type="password"]')
        )
        if (fields.length < 2) return false
        const visible = await Promise.all(
          fields.map(f => f.isDisplayed().catch(() => false))
        )
        return visible.filter(Boolean).length >= 2
      },
      15000,
      'Register form should show password and confirmation fields'
    )
  })

  // TC-E2E-04: Route không tồn tại → hiển thị trang 404 Not Found
  maybeIt('unknown route renders the 404 Not Found page', async () => {
    await driver.get(`${BASE_URL}/this-route-does-not-exist-${stamp()}`)
    const goHome = await driver.wait(
      until.elementLocated(By.xpath('//*[normalize-space()="Go Home"]')),
      15000
    )
    expect(await goHome.isDisplayed()).toBe(true)
    const notFoundText = await driver.findElement(
      By.xpath('//*[normalize-space()="404"]')
    )
    expect(await notFoundText.isDisplayed()).toBe(true)
  })

  // TC-E2E-05: Route protected /boards khi chưa đăng nhập → redirect về /login
  maybeIt(
    'protected /boards redirects to /login when not authenticated',
    async () => {
      await clearSession()
      await driver.get(`${BASE_URL}/boards`)
      await driver.wait(until.urlContains('/login'), 15000)
      const form = await driver.wait(
        until.elementLocated(By.css('[data-testid="login-form"]')),
        15000
      )
      expect(await form.isDisplayed()).toBe(true)
    }
  )

  // TC-E2E-06: Route protected /settings/account khi chưa đăng nhập → redirect về /login
  maybeIt(
    'protected /settings/account redirects to /login when not authenticated',
    async () => {
      await clearSession()
      await driver.get(`${BASE_URL}/settings/account`)
      await driver.wait(until.urlContains('/login'), 15000)
      expect(await driver.getCurrentUrl()).toMatch(/\/login/)
    }
  )

  // TC-E2E-07: /account/verification thiếu params hợp lệ → điều hướng sang trang 404
  maybeIt(
    'account verification with invalid params redirects to 404',
    async () => {
      await driver.get(`${BASE_URL}/account/verification`)
      const goHome = await driver.wait(
        until.elementLocated(By.xpath('//*[normalize-space()="Go Home"]')),
        15000
      )
      expect(await goHome.isDisplayed()).toBe(true)
    }
  )

  // ===================================================================
  // Nhóm 2: Các trang yêu cầu ĐÃ đăng nhập
  // ===================================================================

  // TC-E2E-08: Login hợp lệ → điều hướng tới trang danh sách boards
  maybeIt('valid login navigates to boards list page', async () => {
    await clearSession()
    const login = new LoginPage(driver, BASE_URL)
    const board = new BoardPage(driver)
    await login.open()
    await login.login(TEST_EMAIL, TEST_PASSWORD)
    await board.waitForBoardsList()
    expect(await driver.getCurrentUrl()).toMatch(/\/boards/)
  })

  // TC-E2E-09: Trang Boards list hiển thị đúng (tiêu đề + nút tạo board + AppBar)
  maybeIt('boards list page renders its content', async () => {
    await ensureLoggedIn()
    const boards = new BoardsListPage(driver, BASE_URL)
    await boards.waitLoaded()
    const createBtn = await driver.findElement(
      By.css('[data-testid="open-create-board-modal"]')
    )
    expect(await createBtn.isDisplayed()).toBe(true)
    const heading = await driver.findElement(
      By.xpath('//*[contains(normalize-space(),"Your boards")]')
    )
    expect(await heading.isDisplayed()).toBe(true)
    // AppBar (chứa profile menu) phải hiển thị trên trang đã đăng nhập
    const profile = await driver.findElement(
      By.css('[data-testid="profile-button"]')
    )
    expect(await profile.isDisplayed()).toBe(true)
  })

  // TC-E2E-10: Trang Settings - tab Account hiển thị đúng
  maybeIt('settings account page renders tabs and app bar', async () => {
    await ensureLoggedIn()
    await driver.get(`${BASE_URL}/settings/account`)
    await driver.wait(until.urlContains('/settings/account'), 15000)
    await driver.wait(
      until.elementLocated(By.css('[data-testid="profile-button"]')),
      15000
    )
    const tabs = await driver.findElements(By.css('[role="tab"]'))
    expect(tabs.length).toBeGreaterThanOrEqual(2)
  })

  // TC-E2E-11: Trang Settings - tab Security hiển thị đúng
  maybeIt('settings security page renders tabs and app bar', async () => {
    await ensureLoggedIn()
    await driver.get(`${BASE_URL}/settings/security`)
    await driver.wait(until.urlContains('/settings/security'), 15000)
    await driver.wait(
      until.elementLocated(By.css('[data-testid="profile-button"]')),
      15000
    )
    const securityTab = await driver.findElement(
      By.xpath('//*[normalize-space()="Security"]')
    )
    expect(await securityTab.isDisplayed()).toBe(true)
  })

  // TC-E2E-12: Trang Board detail hiển thị đúng (tạo board tạm → mở → kiểm tra → dọn dẹp)
  maybeIt(
    'board detail page renders for a board',
    async () => {
      await ensureLoggedIn()
      const boards = new BoardsListPage(driver, BASE_URL)
      await boards.waitLoaded()

      const id = stamp()
      const boardTitle = `000 UI Coverage Board ${id}`
      await boards.openCreateBoardModal()
      await boards.fillAndSubmitCreateBoard({
        title: boardTitle,
        description: `Created by UI coverage test ${id}`
      })

      const boardId = await boards.openBoardByTitle(boardTitle)
      const boardPage = new BoardDetailPage(driver)
      await boardPage.waitLoaded()
      const boardEl = await driver.findElement(
        By.css('[data-testid="board-page"]')
      )
      expect(await boardEl.isDisplayed()).toBe(true)

      // Dọn dẹp: xóa board tạm để không để lại rác trong DB
      await boards.goToBoardsList()
      await boards.softDeleteBoard(boardId)
      await boards.waitBoardAbsentById(boardId)
    },
    120000
  )
})
