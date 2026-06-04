import { By, until } from 'selenium-webdriver'
import {
  clickByTestId,
  fillReactInputByTestId,
  waitForAxiosIdle
} from '../helpers/seleniumHelpers.js'

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
    await waitForAxiosIdle(this.driver, TIMEOUT)
  }

  async addColumn(title) {
    await waitForAxiosIdle(this.driver, TIMEOUT)

    const initialCardOpenerCount = await this.driver.executeScript(() =>
      document.querySelectorAll('[data-testid="open-new-card-form"]').length
    )

    const opened = await this.driver.executeScript(() => {
      const opener = document.querySelector('[data-testid="open-new-column-form"]')
      if (!opener) return false
      opener.click()
      return true
    })

    if (!opened) {
      throw new Error('Unable to open new column form')
    }

    await this.driver.wait(
      until.elementLocated(By.css('[data-testid="submit-new-column"]')),
      TIMEOUT
    )

    await fillReactInputByTestId(this.driver, 'new-column-title', title, TIMEOUT)
    await waitForAxiosIdle(this.driver, TIMEOUT)
    await clickByTestId(this.driver, 'submit-new-column', TIMEOUT)

    // Không dùng input.value === title: form "Add column" vẫn mở cũng khớp nhầm.
    await this.driver.wait(
      async () => {
        const state = await this.driver.executeScript(() => ({
          addColumnFormOpen: Boolean(
            document.querySelector('[data-testid="submit-new-column"]')
          ),
          cardOpenerCount: document.querySelectorAll(
            '[data-testid="open-new-card-form"]'
          ).length
        }))
        return (
          !state.addColumnFormOpen &&
          state.cardOpenerCount > initialCardOpenerCount
        )
      },
      TIMEOUT,
      `Column "${title}" was not created (form still open or no card footer)`
    )
    await waitForAxiosIdle(this.driver, TIMEOUT)
  }

  async addCardToColumnByTitle(columnTitle, cardTitle) {
    await waitForAxiosIdle(this.driver, TIMEOUT)

    await this.driver.wait(
      async () => {
        const count = await this.driver.executeScript(() =>
          document.querySelectorAll('[data-testid="open-new-card-form"]').length
        )
        return count > 0
      },
      TIMEOUT,
      'No column footer with "Add new card" button'
    )

    // Cột vừa tạo được append cuối — mở form card ở cột cuối
    const clicked = await this.driver.executeScript(() => {
      const openers = Array.from(
        document.querySelectorAll('[data-testid="open-new-card-form"]')
      )
      const opener = openers.at(-1)
      if (!opener) return false
      opener.click()
      return true
    })

    if (!clicked) {
      throw new Error(`Unable to open new card form for column: ${columnTitle}`)
    }

    await this.driver.wait(
      until.elementLocated(By.css('[data-testid="new-card-title"]')),
      TIMEOUT
    )

    await fillReactInputByTestId(this.driver, 'new-card-title', cardTitle, TIMEOUT)
    await waitForAxiosIdle(this.driver, TIMEOUT)
    await clickByTestId(this.driver, 'submit-new-card', TIMEOUT)
    await waitForAxiosIdle(this.driver, TIMEOUT)
  }

  async waitCardVisible(cardTitle) {
    const xpath = `//*[@data-testid="card-item"][.//*[normalize-space(.)="${cardTitle}"]]`
    return this.driver.wait(until.elementLocated(By.xpath(xpath)), TIMEOUT)
  }
}
