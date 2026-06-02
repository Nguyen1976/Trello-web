import { By, until } from 'selenium-webdriver'

export class BoardPage {
  constructor(driver) {
    this.driver = driver
  }

  async waitForBoardsList() {
    await this.driver.wait(until.urlContains('/boards'), 20000)
  }

  async waitForBoardDetail() {
    await this.driver.wait(
      until.elementLocated(By.css('[data-testid="board-page"]')),
      20000
    )
  }
}
