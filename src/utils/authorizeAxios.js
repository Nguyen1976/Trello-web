import axios from 'axios'
import { toast } from 'react-toastify'
import { interceptorLoadingElements } from '~/utils/formatters'

//Khời tạo 1 đối tượng axios (authorizeAxiosInstance) mục đích để custom vè cấu hình chung cho dự án
let authorizeAxiosInstance = axios.create()

//Thời gian chờ tối đa 10 phút
authorizeAxiosInstance.defaults.timeout = 1000 * 60 * 10

//withCredentials: sẽ cho phép làm việc với cookie
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

authorizeAxiosInstance.interceptors.response.use(
  response => {
    interceptorLoadingElements(false)

    return response
  },
  error => {
    interceptorLoadingElements(false)

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
