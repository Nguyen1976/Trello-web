import { By, until } from 'selenium-webdriver'

const TIMEOUT = 20000

export class BoardsListPage {
  constructor(driver, baseUrl) {
    this.driver = driver
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  async waitLoaded() {
    await this.driver.wait(until.urlContains('/boards'), TIMEOUT)
    // Sidebar create button có sẵn ngay khi list render
    await this.driver.wait(
      until.elementLocated(By.css('[data-testid="open-create-board-modal"]')),
      TIMEOUT
    )
  }

  async openCreateBoardModal() {
    const trigger = await this.driver.wait(
      until.elementLocated(By.css('[data-testid="open-create-board-modal"]')),
      TIMEOUT
    )
    await this.driver.wait(until.elementIsVisible(trigger), TIMEOUT)
    await trigger.click()
    await this.driver.wait(
      until.elementLocated(By.css('[data-testid="create-board-form"]')),
      TIMEOUT
    )
    // Modal MUI có animation; chờ một chút cho input enabled
    await this.driver.sleep(300)
  }

  async fillAndSubmitCreateBoard({ title, description }) {
    const titleEl = await this.driver.wait(
      until.elementLocated(By.css('[data-testid="create-board-title"]')),
      TIMEOUT
    )
    await this.driver.wait(until.elementIsVisible(titleEl), TIMEOUT)
    await titleEl.sendKeys(title)

    const descEl = await this.driver.findElement(
      By.css('[data-testid="create-board-description"]')
    )
    await descEl.sendKeys(description)

    const submit = await this.driver.findElement(
      By.css('[data-testid="create-board-submit"]')
    )
    await this.driver.wait(until.elementIsEnabled(submit), TIMEOUT)
    await submit.click()
  }

  async openBoardByTitle(title) {
    // Đợi card có title đúng xuất hiện rồi click vào link "Go to board"
    const titleXPath = `//*[@data-testid="board-list-item-title" and normalize-space(text())="${title}"]`
    const titleEl = await this.driver.wait(
      until.elementLocated(By.xpath(titleXPath)),
      TIMEOUT
    )
    await this.driver.wait(until.elementIsVisible(titleEl), TIMEOUT)
    // Lên cha (Card có data-testid bắt đầu bằng board-list-item-) để tìm link bên trong
    const card = await titleEl.findElement(
      By.xpath('./ancestor::*[starts-with(@data-testid,"board-list-item-")][1]')
    )
    const link = await card.findElement(
      By.css('[data-testid="board-list-item-link"]')
    )
    await link.click()
  }
}
