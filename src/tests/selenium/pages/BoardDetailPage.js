import { By, until } from 'selenium-webdriver'

const TIMEOUT = 20000

export class BoardDetailPage {
  constructor(driver) {
    this.driver = driver
  }

  async waitLoaded() {
    await this.driver.wait(
      until.elementLocated(By.css('[data-testid="board-page"]')),
      TIMEOUT
    )
  }

  async addColumn(title) {
    const opener = await this.driver.wait(
      until.elementLocated(By.css('[data-testid="open-new-column-form"]')),
      TIMEOUT
    )
    await this.driver.wait(until.elementIsVisible(opener), TIMEOUT)
    await opener.click()

    const titleEl = await this.driver.wait(
      until.elementLocated(By.css('[data-testid="new-column-title"]')),
      TIMEOUT
    )
    await this.driver.wait(until.elementIsVisible(titleEl), TIMEOUT)
    await titleEl.sendKeys(title)

    const submit = await this.driver.findElement(
      By.css('[data-testid="submit-new-column"]')
    )
    await this.driver.wait(until.elementIsEnabled(submit), TIMEOUT)
    await submit.click()

    // Chờ form đóng (button "Add new Column" lại hiện)
    await this.driver.wait(
      until.elementLocated(By.css('[data-testid="open-new-column-form"]')),
      TIMEOUT
    )
  }

  async addCardToColumnByTitle(columnTitle, cardTitle) {
    // ToggleFocusInput: hiển thị title cột bằng <input value=...> readOnly hoặc <h6> tuỳ trạng thái.
    // Tìm bất kỳ phần tử nào có text = columnTitle nằm trong phần header của Column.
    const columnXPath = `//input[@value="${columnTitle}"]/ancestor::*[self::div][.//*[@data-testid="open-new-card-form"]][1]`
    const columnRoot = await this.driver.wait(
      until.elementLocated(By.xpath(columnXPath)),
      TIMEOUT
    )

    const opener = await columnRoot.findElement(
      By.css('[data-testid="open-new-card-form"]')
    )
    await this.driver.wait(until.elementIsVisible(opener), TIMEOUT)
    await opener.click()

    const titleEl = await columnRoot.findElement(
      By.css('[data-testid="new-card-title"]')
    )
    await this.driver.wait(until.elementIsVisible(titleEl), TIMEOUT)
    await titleEl.sendKeys(cardTitle)

    const submit = await columnRoot.findElement(
      By.css('[data-testid="submit-new-card"]')
    )
    await this.driver.wait(until.elementIsEnabled(submit), TIMEOUT)
    await submit.click()
  }

  async waitCardVisible(cardTitle) {
    const xpath = `//*[@data-testid="card-item"][.//*[normalize-space(text())="${cardTitle}"]]`
    return this.driver.wait(until.elementLocated(By.xpath(xpath)), TIMEOUT)
  }
}
