import { Builder, By, until } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import { LoginPage } from './pages/LoginPage.js'
import { BoardPage } from './pages/BoardPage.js'

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

describe('Trello Selenium E2E (khóa 4)', () => {
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

  const maybeIt = (name, fn) => {
    if (canRunE2E()) {
      it(name, fn, 60000)
    } else {
      it.skip(`${name} (set E2E_RUN=true and E2E_TEST_EMAIL/PASSWORD)`, () => {})
    }
  }

  // TC-E2E-01
  maybeIt('shows login form', async () => {
    const login = new LoginPage(driver, BASE_URL)
    await login.open()
    const form = await driver.findElement(By.css('[data-testid="login-form"]'))
    expect(await form.isDisplayed()).toBe(true)
  })

  // TC-E2E-02
  maybeIt('shows error on invalid login', async () => {
    const login = new LoginPage(driver, BASE_URL)
    await login.open()
    await login.login('invalid@example.com', 'WrongPass1')
    await driver.wait(until.elementLocated(By.css('.MuiAlert-root, .Toastify__toast')), 15000)
  })

  // TC-E2E-03
  maybeIt('navigates to boards after valid login', async () => {
    const login = new LoginPage(driver, BASE_URL)
    const board = new BoardPage(driver)
    await login.open()
    await login.login(TEST_EMAIL, TEST_PASSWORD)
    await board.waitForBoardsList()
    expect(await driver.getCurrentUrl()).toMatch(/\/boards/)
  })
})
