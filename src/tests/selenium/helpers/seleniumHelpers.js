import { By, until } from 'selenium-webdriver'

/** Chờ axios interceptor tắt pointer-events trên các nút .interceptor-loading */
export async function waitForAxiosIdle(driver, timeout = 20000) {
  await driver.wait(
    async () => {
      const blocked = await driver.executeScript(() =>
        Array.from(document.querySelectorAll('.interceptor-loading')).some(
          el => el.style.pointerEvents === 'none'
        )
      )
      return !blocked
    },
    timeout,
    'Axios interceptor still blocking clicks'
  )
}

/** Gõ vào MUI/React controlled input qua data-testid */
export async function fillReactInputByTestId(driver, testId, value, timeout = 20000) {
  const el = await driver.wait(
    until.elementLocated(By.css(`[data-testid="${testId}"]`)),
    timeout
  )
  await driver.wait(until.elementIsVisible(el), timeout)
  await el.click()
  await driver.executeScript(
    (input, text) => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      ).set
      setter.call(input, text)
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    },
    el,
    value
  )
}

/** Click element (bypass pointer-events: none từ interceptor-loading) */
export async function clickByTestId(driver, testId, timeout = 20000) {
  await driver.wait(
    async () =>
      driver.executeScript(id => {
        const el = document.querySelector(`[data-testid="${id}"]`)
        if (!el) return false
        el.click()
        return true
      }, testId),
    timeout,
    `Unable to click [data-testid="${testId}"]`
  )
}
