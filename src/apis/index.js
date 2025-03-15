import { toast } from 'react-toastify'
import authorizeAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
/**
 * Không sử dụng try-catch để call api với axios
 * Vì nó gây ra việc dư thừa code quá nhiều
 * Chúng ta chỉ lên catch lỗi tập trung tại một nơi bằng cách sử dụng Interceptors trong axios
 * Interceptors là cách mà chúng ta đánh chặn giữa req và res để xử lý logic mà chúng ta muốn
 */

/**Board */
//Đã move bằng redux
// export const fetchBoardDetailsAPI = async (boardId) => {
//   const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`);
//   //Đối với việc chạy qua axios thì nó sẽ nằm trong request.data
//   return response.data;
// };

export const updateBoardDetailsAPI = async (boardId, updateData) => {
  const response = await authorizeAxiosInstance.put(
    `${API_ROOT}/v1/boards/${boardId}`,
    updateData
  )
  return response.data
}

export const moveCardToDifferentColumnAPI = async updateData => {
  const response = await authorizeAxiosInstance.put(
    `${API_ROOT}/v1/boards/supports/moving_card`,
    updateData
  )
  return response.data
}

export const fetchBoardsAPI = async searchPath => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}/v1/boards${searchPath}`
  )
  return response.data
}

export const createNewBoardAPI = async data => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/v1/boards`,
    data
  )
  toast.success('Created board successfully')
  return response.data
}

/**Columns */

export const updateColumnDetailsAPI = async (columnId, updateData) => {
  const response = await authorizeAxiosInstance.put(
    `${API_ROOT}/v1/columns/${columnId}`,
    updateData
  )
  return response.data
}

export const deleteColumnDetailsAPI = async columnId => {
  const response = await authorizeAxiosInstance.delete(
    `${API_ROOT}/v1/columns/${columnId}`
  )
  return response.data
}

export const createNewColumnAPI = async newColumnData => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/v1/columns`,
    newColumnData
  )
  return response.data
}

/**Cards */
export const createNewCardAPI = async newCardData => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/v1/cards`,
    newCardData
  )
  return response.data
}

export const updateCardDetailsAPI = async (cardId, updateData) => {
  const response = await authorizeAxiosInstance.put(
    `${API_ROOT}/v1/cards/${cardId}`,
    updateData
  )
  return response.data
}

/**Users */
export const registerUserAPI = async data => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/v1/users/register`,
    data
  )
  toast.success(
    'Account created successfully? Please check and verify your account before logging in!',
    {
      theme: 'colored'
    }
  )
  return response.data
}

export const verifyUserAPI = async data => {
  const response = await authorizeAxiosInstance.put(
    `${API_ROOT}/v1/users/verify`,
    data
  )
  toast.success(
    'Account created successfully? Now you can login to enjoy ourr services! Have a good day!',
    {
      theme: 'colored'
    }
  )
  return response.data
}

export const refreshTokenAPI = async () => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}/v1/users/refresh_token`
  )
  return response.data
}
