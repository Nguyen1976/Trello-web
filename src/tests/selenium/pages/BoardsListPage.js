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
    const boardId = await this.driver.executeAsyncScript(
      (targetTitle, done) => {
        fetch('http://localhost:8017/v1/boards?page=1&itemsPerPage=1000', {
          credentials: 'include'
        })
          .then((response) => response.json())
          .then((data) => {
            const boards = data?.boards || []
            const found = boards.find((board) => board.title === targetTitle)
            done(found?._id || null)
          })
          .catch(() => done(null))
      },
      title
    )

    if (boardId) {
      await this.driver.get(`${this.baseUrl}/boards/${boardId}`)
      await this.driver.wait(until.urlContains(`/boards/${boardId}`), TIMEOUT)
      return
    }

    const firstLink = await this.driver.wait(
      until.elementLocated(By.css('[data-testid="board-list-item-link"]')),
      TIMEOUT
    )
    const href = await firstLink.getAttribute('href')

    if (!href) {
      throw new Error(`Unable to locate board by title: ${title}`)
    }

    await this.driver.get(href)
    await this.driver.wait(until.urlContains('/boards/'), TIMEOUT)
  }
}
