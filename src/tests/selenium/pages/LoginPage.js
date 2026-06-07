import { By, Key, until } from 'selenium-webdriver'

const isMac = process.platform === 'darwin'
const SELECT_ALL_KEY = isMac ? Key.COMMAND : Key.CONTROL

export class LoginPage {
  constructor(driver, baseUrl) {
    this.driver = driver
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  async open() {
    await this.driver.get(`${this.baseUrl}/login`)
    await this.driver.wait(
      until.elementLocated(By.css('[data-testid="login-form"]')),
      15000
    )
    // MUI Zoom transitionDelay 200ms — chờ animation xong trước khi gõ
    await this.driver.sleep(400)
  }

  async _waitInteractable(selector) {
    const el = await this.driver.wait(
      until.elementLocated(By.css(selector)),
      15000
    )
    await this.driver.wait(until.elementIsVisible(el), 15000)
    await this.driver.wait(until.elementIsEnabled(el), 15000)
    return el
  }

  // .clear() trên MUI/React controlled input đôi khi không trigger onChange.
  // Dùng select-all + backspace ổn định hơn.
  async _safeClear(el) {
    try {
      const value = await el.getAttribute('value')
      if (value && value.length > 0) {
        await el.sendKeys(SELECT_ALL_KEY, 'a')
        await el.sendKeys(Key.BACK_SPACE)
      }
    } catch {
      // fallback: bỏ qua, sendKeys vẫn ghi nối tiếp được
    }
  }

  async login(email, password) {
    const emailEl = await this._waitInteractable('[data-testid="login-email"]')
    await this._safeClear(emailEl)
    await emailEl.sendKeys(email)

    const passwordEl = await this._waitInteractable(
      '[data-testid="login-password"]'
    )
    await this._safeClear(passwordEl)
    await passwordEl.sendKeys(password)

    const submit = await this._waitInteractable('[data-testid="login-submit"]')
    await submit.click()
  }
}
