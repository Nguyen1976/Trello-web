import axios from 'axios'
import { toast } from 'react-toastify'
import { interceptorLoadingElements } from '~/utils/formatters'
import { refreshTokenAPI } from '~/apis'
import { logoutUserApi } from '~/redux/user/userSlice'
import { original } from '@reduxjs/toolkit'

/**
 * Không thẻ import {store} from '~/redux/store' theo cách thông thường ở đây
 * Giải pháp InJect store là kỹ thuật khi cần sử dụng biến redux store từ file ngoài phạm vi component
 * Hiều đơn giản khi ứng dụng bắt đầu chạy lên code sẽ chạy vào main.jsx, từ bên đố chúng ta gọi injectStore ngay lập tức để gán biến mainStore vào biến axiosReduxStore cục bộ trong file này
 * https://redux.js.org/faq/code-structure#how-can-i-use-the-redux-store-in-non-component-files
 */
let axiosReduxStore
export const injectStore = mainStore => {
  axiosReduxStore = mainStore
}

//Khời tạo 1 đối tượng axios (authorizeAxiosInstance) mục đích để custom vè cấu hình chung cho dự án
let authorizeAxiosInstance = axios.create()

//Thời gian chờ tối đa 10 phút
authorizeAxiosInstance.defaults.timeout = 1000 * 60 * 10

//withCredentials: sẽ cho phép làm việc với cookie và bên backend dùng httpOnly thì sẽ tự động gửi kèm cookie trong req và k phải cấu hình req để gửi cookie nữa
authorizeAxiosInstance.defaults.withCredentials = true

//https://axios-http.com/docs/interceptors
authorizeAxiosInstance.interceptors.request.use(
  config => {
    interceptorLoadingElements(true)

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

//Xử lý refreshToken
/**
 * Tạo 1 cái promise cho việc gọi api refreshToken
 * Sau khi refresh token xong xuôi mới retry lại nhiều api bị lỗi trước đó
 */
let refreshTokenPromise = null

authorizeAxiosInstance.interceptors.response.use(
  response => {
    //Kỹ thuật chặn spam click
    interceptorLoadingElements(false)

    return response
  },
  error => {
    //Kỹ thuật chặn spam click
    interceptorLoadingElements(false)

    /**Xử lý refresh token tự động */
    //TH1: Nếu nhận mã 401 từ be thì call api đăng xuất
    if (error.response?.status === 401) {
      axiosReduxStore.dispatch(logoutUserApi(false))
    }

    //TH2: Nhận mã 410 từ BE thì gọi api refresh token để làm mới accessToken
    //Lấy các req API đang lỗi thông qua error.config
    const originalRequests = error.config
    if (error.response?.status === 410 && !originalRequests._retry) {
      originalRequests._retry = true //_retry là do chúng ta đặt mặc định sẽ k có _retry để đảm bảo là refreshToken chỉ gọi 1 lần

      //Kiểm tra xem nếu chưa có refreshTokenPromise thì thực hiện gán việc gọi api refresh_token đồng thòi gán vào cho cái refreshTokenPromise
      if (!refreshTokenPromise) {
        refreshTokenPromise = refreshTokenAPI()
          .then(data => {
            //Đồng thời accessToken đã nằm trong httpOnly cookie (xử lý từ phía BE)
            return data?.accessToken
          })
          .catch(_error => {
            //Nếu nhận bất kì lỗi nào khi refreshToken thì logout luôn

            axiosReduxStore.dispatch(logoutUserApi(false))
            return Promise.reject(_error) //Dòng này để tránh việc bị gọi API logout 2 lần nếu như rơi vào trường hợp khi API refreshToken trả về lỗi
          })
          .finally(() => {
            //Dù API có ok hay lỗi thì vẫn luôn gán lại cái refreshTokenPromise về null như cái ban đầu
            refreshTokenPromise = null
          })
      }

      return refreshTokenPromise.then(accessToken => {
        //Trường hợp cần lưu accessToken vào local thì xử lý thêm ở đây

        //Bước này để gọi lại các api bị lỗi ban đầu đã được lưu vào originalRequests
        return authorizeAxiosInstance(originalRequests)
      })
    }

    //Mọi mã status code nằm ngoài khoảng 200-299 đều coi là lỗi
    //console.log error ra là sẽ thấy cấu trúc data dẫn đến message lỗi
    let errorMessage = error?.message
    if (error.response?.data?.message) {
      errorMessage = error?.response?.data?.message
    }
    //Hiển thị mọi mã lỗi lên trên màn hình Ngoại trừ mã 410 - GONE phục vụ việc tự động refresh token
    if (error.response?.status !== 410) {
      toast.error(errorMessage)
    }

    return Promise.reject(error)
  }
)

export default authorizeAxiosInstance
