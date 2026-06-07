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

/** Gán giá trị cho 1 controlled input/textarea của React (set value + dispatch input/change) */
export async function setReactInputValue(driver, el, value) {
  await driver.executeScript(
    (input, text) => {
      const proto =
        input.tagName === 'TEXTAREA'
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set
      setter.call(input, text)
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    },
    el,
    value
  )
}

/** Gõ vào MUI/React controlled input qua data-testid */
export async function fillReactInputByTestId(
  driver,
  testId,
  value,
  timeout = 20000
) {
  const el = await driver.wait(
    until.elementLocated(By.css(`[data-testid="${testId}"]`)),
    timeout
  )
  await driver.wait(until.elementIsVisible(el), timeout)
  await el.click()
  await setReactInputValue(driver, el, value)
}

/**
 * Sửa 1 ToggleFocusInput: set value rồi blur để commit (onChangedValue chạy lúc onBlur).
 * el là WebElement của thẻ <input>.
 */
export async function editToggleInput(driver, el, value) {
  await el.click()
  await setReactInputValue(driver, el, value)
  await driver.executeScript(input => {
    input.dispatchEvent(new Event('blur', { bubbles: false }))
    input.dispatchEvent(new Event('focusout', { bubbles: true }))
  }, el)
}

/**
 * Click element qua data-testid bằng dispatchEvent('click').
 * Dùng dispatchEvent thay vì .click() để chạy được cả thẻ SVG (icon MUI) —
 * SVGElement không có method .click(). Cũng bypass pointer-events:none.
 */
export async function clickByTestId(driver, testId, timeout = 20000) {
  await driver.wait(
    async () =>
      driver.executeScript(id => {
        const el = document.querySelector(`[data-testid="${id}"]`)
        if (!el) return false
        el.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          })
        )
        return true
      }, testId),
    timeout,
    `Unable to click [data-testid="${testId}"]`
  )
}

/**
 * Click nút xác nhận trong dialog của material-ui-confirm.
 * buttonText: text trên nút (vd "Ok", "Confirm").
 */
export async function confirmDialog(driver, buttonText, timeout = 20000) {
  await driver.wait(
    until.elementLocated(By.css('.MuiDialog-container')),
    timeout
  )
  // Bấm nút confirm lặp lại tới khi dialog đóng — tránh miss click trong lúc
  // dialog đang chạy transition mở.
  await driver.wait(
    async () => {
      const open = await driver.executeScript(text => {
        const dialogs = document.querySelectorAll('.MuiDialog-container').length
        if (dialogs === 0) return 0
        const buttons = Array.from(
          document.querySelectorAll('.MuiDialogActions-root button')
        )
        const target = buttons.find(
          b => (b.textContent || '').trim().toLowerCase() === text.toLowerCase()
        )
        if (target) {
          target.dispatchEvent(
            new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            })
          )
        }
        return dialogs
      }, buttonText)
      return open === 0
    },
    timeout,
    `Confirm dialog ("${buttonText}") did not close`
  )
}

/**
 * Mô phỏng kéo-thả của dnd-kit bằng cách bắn chuỗi mouse events.
 * dnd-kit MouseSensor cần: mousedown -> mousemove vượt 10px (activation) -> nhiều
 * mousemove tới đích (để collision detection chạy) -> mouseup.
 */
export async function simulateDnd(driver, sourceEl, targetEl, steps = 18) {
  await driver.executeAsyncScript(
    (source, target, totalSteps, done) => {
      const center = el => {
        const r = el.getBoundingClientRect()
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
      }
      const from = center(source)
      const to = center(target)

      const fire = (type, x, y, el) => {
        const ev = new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: x,
          clientY: y,
          button: 0,
          buttons: type === 'mouseup' ? 0 : 1
        })
        ;(el || document).dispatchEvent(ev)
      }

      // 1) mousedown trên source (kích hoạt activator onMouseDown của dnd-kit)
      fire('mousedown', from.x, from.y, source)

      // 2) move đầu tiên vượt ngưỡng 10px để dnd bắt đầu
      setTimeout(() => {
        fire('mousemove', from.x + 20, from.y, document)

        let i = 0
        const move = () => {
          i++
          if (i <= totalSteps) {
            const t = i / totalSteps
            const x = from.x + (to.x - from.x) * t
            const y = from.y + (to.y - from.y) * t
            fire('mousemove', x, y, document)
            setTimeout(move, 25)
          } else {
            // settle: lặp lại vài lần tại đích cho collision ổn định
            fire('mousemove', to.x, to.y, document)
            setTimeout(() => {
              fire('mousemove', to.x, to.y, document)
              setTimeout(() => {
                fire('mouseup', to.x, to.y, document)
                setTimeout(done, 80)
              }, 40)
            }, 40)
          }
        }
        setTimeout(move, 25)
      }, 30)
    },
    sourceEl,
    targetEl,
    steps
  )
}
