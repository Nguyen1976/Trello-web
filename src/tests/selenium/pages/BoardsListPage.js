import { By, until } from 'selenium-webdriver'
import {
  clickByTestId,
  confirmDialog,
  fillReactInputByTestId,
  waitForAxiosIdle
} from '../helpers/seleniumHelpers.js'

const TIMEOUT = 20000
const API_ROOT = 'http://localhost:8017'

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
    await clickByTestId(this.driver, 'open-create-board-modal', TIMEOUT)
    await this.driver.wait(
      until.elementLocated(By.css('[data-testid="create-board-form"]')),
      TIMEOUT
    )
    // Modal MUI có animation; chờ một chút cho input enabled
    await this.driver.sleep(300)
  }

  async fillAndSubmitCreateBoard({ title, description }) {
    // Form dùng react-hook-form (register) → set value + dispatch input/change
    await fillReactInputByTestId(this.driver, 'create-board-title', title, TIMEOUT)
    await fillReactInputByTestId(
      this.driver,
      'create-board-description',
      description,
      TIMEOUT
    )
    await waitForAxiosIdle(this.driver, TIMEOUT)
    await clickByTestId(this.driver, 'create-board-submit', TIMEOUT)

    // Chờ modal đóng (form biến mất) — xác nhận create thành công
    await this.driver.wait(
      async () => {
        const open = await this.driver.executeScript(
          () => document.querySelectorAll('[data-testid="create-board-form"]').length
        )
        return open === 0
      },
      TIMEOUT,
      'Create board form did not close (create likely failed)'
    )
    await waitForAxiosIdle(this.driver, TIMEOUT)
  }

  /** Tìm boardId theo title qua API (poll vì DB có thể trễ) */
  async findBoardIdByTitle(title) {
    let boardId = null
    await this.driver.wait(
      async () => {
        boardId = await this.driver.executeAsyncScript(
          (root, targetTitle, done) => {
            fetch(`${root}/v1/boards?page=1&itemsPerPage=1000`, {
              credentials: 'include'
            })
              .then(response => response.json())
              .then(data => {
                const list = data?.boards || []
                const found = list.find(b => b.title === targetTitle)
                done(found?._id || null)
              })
              .catch(() => done(null))
          },
          API_ROOT,
          title
        )
        return Boolean(boardId)
      },
      TIMEOUT,
      `Board "${title}" not found via API`
    )
    return boardId
  }

  /**
   * Mở đúng board theo title (không fallback sang board khác để tránh dùng nhầm
   * board cũ). Trả về boardId.
   */
  async openBoardByTitle(title) {
    const boardId = await this.findBoardIdByTitle(title)
    await this.driver.get(`${this.baseUrl}/boards/${boardId}`)
    await this.driver.wait(until.urlContains(`/boards/${boardId}`), TIMEOUT)
    return boardId
  }

  /** Thoát khỏi board, quay lại danh sách boards */
  async goToBoardsList() {
    await this.driver.get(`${this.baseUrl}/boards`)
    await this.waitLoaded()
  }

  /**
   * Xóa board (soft-delete) qua API: app hiện chưa có nút xóa board trên UI,
   * backend hỗ trợ _destroy nên dùng PUT để board biến mất khỏi danh sách.
   */
  async softDeleteBoard(boardId) {
    const ok = await this.driver.executeAsyncScript(
      (root, id, done) => {
        fetch(`${root}/v1/boards/${id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _destroy: true })
        })
          .then((r) => done(r.ok))
          .catch(() => done(false))
      },
      API_ROOT,
      boardId
    )
    if (!ok) throw new Error(`Unable to delete board: ${boardId}`)
  }

  /** Chờ board biến mất khỏi danh sách (reload trang list) */
  async waitBoardAbsentById(boardId) {
    await this.driver.get(`${this.baseUrl}/boards`)
    await this.waitLoaded()
    await this.driver.wait(
      async () => {
        const present = await this.driver.executeScript(
          id => document.querySelectorAll(`[data-testid="board-list-item-${id}"]`).length,
          boardId
        )
        return present === 0
      },
      TIMEOUT,
      `Board ${boardId} still present in list`
    )
  }

  /** Đăng xuất qua menu Profile */
  async logout() {
    await clickByTestId(this.driver, 'profile-button', TIMEOUT)
    await clickByTestId(this.driver, 'logout-menuitem', TIMEOUT)
    await confirmDialog(this.driver, 'Confirm', TIMEOUT)
    await this.driver.wait(until.urlContains('/login'), TIMEOUT)
  }
}
