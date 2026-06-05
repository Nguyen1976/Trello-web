import { By, until } from 'selenium-webdriver'
import {
  clickByTestId,
  confirmDialog,
  editToggleInput,
  fillReactInputByTestId,
  simulateDnd,
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

  // ---------- Truy vấn cơ bản ----------

  async getColumnCount() {
    return this.driver.executeScript(
      () => document.querySelectorAll('[data-testid="column"]').length
    )
  }

  /** Trả về thứ tự title các column từ trái sang phải (theo DOM) */
  async getColumnTitlesInOrder() {
    return this.driver.executeScript(() =>
      Array.from(document.querySelectorAll('[data-testid="column"]')).map(
        col => {
          const input = col.querySelector('[data-testid="column-title-input"]')
          return input ? (input.value || '').trim() : ''
        }
      )
    )
  }

  /** WebElement của column theo title (hoặc null) */
  async getColumnElementByTitle(title) {
    return this.driver.executeScript(t => {
      const cols = Array.from(
        document.querySelectorAll('[data-testid="column"]')
      )
      return (
        cols.find(col => {
          const input = col.querySelector('[data-testid="column-title-input"]')
          return input && (input.value || '').trim() === t.trim()
        }) || null
      )
    }, title)
  }

  async waitColumnByTitle(title) {
    return this.driver.wait(
      async () => (await this.getColumnElementByTitle(title)) || false,
      TIMEOUT,
      `Column "${title}" not found`
    )
  }

  /** WebElement của card-item hiển thị (không phải placeholder) theo title */
  async getCardElement(cardTitle) {
    const xpath = `//*[@data-testid="card-item"][.//*[normalize-space(.)="${cardTitle}"]]`
    return this.driver.wait(until.elementLocated(By.xpath(xpath)), TIMEOUT)
  }

  async waitCardVisible(cardTitle) {
    return this.getCardElement(cardTitle)
  }

  /** Card title có nằm trong column title cho trước không */
  async isCardInColumn(cardTitle, columnTitle) {
    return this.driver.executeScript(
      (cTitle, colTitle) => {
        const cols = Array.from(
          document.querySelectorAll('[data-testid="column"]')
        )
        const col = cols.find(c => {
          const input = c.querySelector('[data-testid="column-title-input"]')
          return input && (input.value || '').trim() === colTitle.trim()
        })
        if (!col) return false
        const cards = Array.from(
          col.querySelectorAll('[data-testid="card-item"]')
        )
        return cards.some(card => (card.textContent || '').includes(cTitle))
      },
      cardTitle,
      columnTitle
    )
  }

  // ---------- Tạo column / card ----------

  async addColumn(title) {
    await waitForAxiosIdle(this.driver, TIMEOUT)
    const before = await this.getColumnCount()

    const opened = await this.driver.executeScript(() => {
      const opener = document.querySelector(
        '[data-testid="open-new-column-form"]'
      )
      if (!opener) return false
      opener.click()
      return true
    })
    if (!opened) throw new Error('Unable to open new column form')

    await this.driver.wait(
      until.elementLocated(By.css('[data-testid="submit-new-column"]')),
      TIMEOUT
    )
    await fillReactInputByTestId(
      this.driver,
      'new-column-title',
      title,
      TIMEOUT
    )
    await waitForAxiosIdle(this.driver, TIMEOUT)
    await clickByTestId(this.driver, 'submit-new-column', TIMEOUT)

    await this.driver.wait(
      async () => {
        const formOpen = await this.driver.executeScript(() =>
          Boolean(document.querySelector('[data-testid="submit-new-column"]'))
        )
        const count = await this.getColumnCount()
        return !formOpen && count > before
      },
      TIMEOUT,
      `Column "${title}" was not created`
    )
    await this.waitColumnByTitle(title)
    await waitForAxiosIdle(this.driver, TIMEOUT)
  }

  async addCardToColumn(columnTitle, cardTitle) {
    await waitForAxiosIdle(this.driver, TIMEOUT)
    const columnEl = await this.waitColumnByTitle(columnTitle)

    const opened = await this.driver.executeScript(col => {
      const opener = col.querySelector('[data-testid="open-new-card-form"]')
      if (!opener) return false
      opener.click()
      return true
    }, columnEl)
    if (!opened) {
      throw new Error(`Unable to open new card form for column: ${columnTitle}`)
    }

    await this.driver.wait(
      until.elementLocated(By.css('[data-testid="new-card-title"]')),
      TIMEOUT
    )
    await fillReactInputByTestId(
      this.driver,
      'new-card-title',
      cardTitle,
      TIMEOUT
    )
    await waitForAxiosIdle(this.driver, TIMEOUT)
    await clickByTestId(this.driver, 'submit-new-card', TIMEOUT)
    await this.getCardElement(cardTitle)
    await waitForAxiosIdle(this.driver, TIMEOUT)
  }

  // ---------- Kéo thả ----------

  async dragCardToColumn(cardTitle, targetColumnTitle) {
    await waitForAxiosIdle(this.driver, TIMEOUT)
    const cardEl = await this.getCardElement(cardTitle)
    const targetCol = await this.waitColumnByTitle(targetColumnTitle)

    await simulateDnd(this.driver, cardEl, targetCol)

    await this.driver.wait(
      async () => this.isCardInColumn(cardTitle, targetColumnTitle),
      TIMEOUT,
      `Card "${cardTitle}" did not move into column "${targetColumnTitle}"`
    )
    await waitForAxiosIdle(this.driver, TIMEOUT)
  }

  async dragColumn(sourceTitle, targetTitle) {
    await waitForAxiosIdle(this.driver, TIMEOUT)
    const sourceCol = await this.waitColumnByTitle(sourceTitle)
    const targetCol = await this.waitColumnByTitle(targetTitle)

    const sourceHandle = await this.driver.executeScript(
      col => col.querySelector('[data-testid="column-drag-handle"]'),
      sourceCol
    )
    const targetHandle = await this.driver.executeScript(
      col => col.querySelector('[data-testid="column-drag-handle"]'),
      targetCol
    )

    await simulateDnd(this.driver, sourceHandle, targetHandle)

    await this.driver.wait(
      async () => {
        const titles = await this.getColumnTitlesInOrder()
        return titles.indexOf(sourceTitle) > titles.indexOf(targetTitle)
      },
      TIMEOUT,
      `Column "${sourceTitle}" did not move past "${targetTitle}"`
    )
    await waitForAxiosIdle(this.driver, TIMEOUT)
  }

  // ---------- Edit ----------

  async openCardModal(cardTitle) {
    await this.getCardElement(cardTitle)
    // Tìm card trong trang rồi dispatch "click" (không mousedown) để không kích
    // hoạt dnd-kit; React onClick mở modal.
    await this.driver.wait(
      async () =>
        this.driver.executeScript(title => {
          const cards = Array.from(
            document.querySelectorAll('[data-testid="card-item"]')
          )
          const card = cards.find(
            c =>
              (c.textContent || '').includes(title) && c.offsetParent !== null
          )
          if (!card) return false
          card.dispatchEvent(
            new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            })
          )
          return true
        }, cardTitle),
      TIMEOUT,
      `Unable to click card "${cardTitle}"`
    )
    await this.driver.wait(
      until.elementLocated(By.css('[data-testid="active-card-modal"]')),
      TIMEOUT
    )
  }

  async editActiveCardTitle(newTitle) {
    const input = await this.driver.wait(
      until.elementLocated(By.css('[data-testid="active-card-title-input"]')),
      TIMEOUT
    )
    await editToggleInput(this.driver, input, newTitle)
    await waitForAxiosIdle(this.driver, TIMEOUT)
  }

  async closeCardModal() {
    await clickByTestId(this.driver, 'active-card-close', TIMEOUT)
    await this.driver.wait(
      async () => {
        const open = await this.driver.executeScript(
          () =>
            document.querySelectorAll('[data-testid="active-card-modal"]')
              .length
        )
        return open === 0
      },
      TIMEOUT,
      'Active card modal did not close'
    )
  }

  async editColumnTitle(currentTitle, newTitle) {
    await waitForAxiosIdle(this.driver, TIMEOUT)
    const columnEl = await this.waitColumnByTitle(currentTitle)
    const input = await this.driver.executeScript(
      col => col.querySelector('[data-testid="column-title-input"]'),
      columnEl
    )
    await editToggleInput(this.driver, input, newTitle)
    await this.waitColumnByTitle(newTitle)
    await waitForAxiosIdle(this.driver, TIMEOUT)
  }

  // ---------- Xóa column ----------

  async deleteColumn(columnTitle) {
    await waitForAxiosIdle(this.driver, TIMEOUT)

    // Mở dropdown → "Delete this column" → confirm "Ok". Đôi khi tương tác bị
    // miss giữa các transition của Menu/Dialog nên retry tới khi cột biến mất.
    for (let attempt = 0; attempt < 4; attempt++) {
      const columnEl = await this.getColumnElementByTitle(columnTitle)
      if (!columnEl) {
        await waitForAxiosIdle(this.driver, TIMEOUT)
        return
      }

      await this.driver.executeScript(col => {
        const dd = col.querySelector('[data-testid="column-dropdown"]')
        // dd là thẻ SVG → dùng dispatchEvent thay vì .click()
        if (dd) {
          dd.dispatchEvent(
            new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            })
          )
        }
      }, columnEl)

      try {
        await this.driver.wait(
          until.elementLocated(By.css('[data-testid="delete-column"]')),
          5000
        )
        await clickByTestId(this.driver, 'delete-column', 5000)
        await confirmDialog(this.driver, 'Ok', 5000)
        await this.driver.wait(
          async () => !(await this.getColumnElementByTitle(columnTitle)),
          5000
        )
        await waitForAxiosIdle(this.driver, TIMEOUT)
        return
      } catch {
        // Đóng menu/dialog còn sót rồi thử lại
        await this.driver.executeScript(() => {
          document.body.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
          )
        })
        await this.driver.sleep(300)
      }
    }

    throw new Error(`Column "${columnTitle}" was not deleted after retries`)
  }
}
