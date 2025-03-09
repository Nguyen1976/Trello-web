import axios from "axios";
import { API_ROOT } from "~/utils/constants";
/**
 * Không sử dụng try-catch để call api với axios
 * Vì nó gây ra việc dư thừa code quá nhiều
 * Chúng ta chỉ lên catch lỗi tập trung tại một nơi bằng cách sử dụng Interceptors trong axios
 * Interceptors là cách mà chúng ta đánh chặn giữa req và res để xử lý logic mà chúng ta muốn
 */

/**Board */
export const fetchBoardDetailsAPI = async (boardId) => {
  const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`);
  //Đối với việc chạy qua axios thì nó sẽ nằm trong request.data
  return response.data;
};

export const updateBoardDetailsAPI = async (boardId, updateData) => {
  const response = await axios.put(
    `${API_ROOT}/v1/boards/${boardId}`,
    updateData
  );
  return response.data;
};

export const moveCardToDifferentColumnAPI = async (updateData) => {
  const response = await axios.put(
    `${API_ROOT}/v1/boards/supports/moving_card`,
    updateData
  );
  return response.data;
};

/**Columns */

export const updateColumnDetailsAPI = async (columnId, updateData) => {
  const response = await axios.put(
    `${API_ROOT}/v1/columns/${columnId}`,
    updateData
  );
  return response.data;
};

export const deleteColumnDetailsAPI = async (columnId) => {
  const response = await axios.delete(`${API_ROOT}/v1/columns/${columnId}`);
  return response.data;
};

export const createNewColumnAPI = async (newColumnData) => {
  const response = await axios.post(`${API_ROOT}/v1/columns`, newColumnData);
  return response.data;
};

/**Cards */
export const createNewCardAPI = async (newCardData) => {
  const response = await axios.post(`${API_ROOT}/v1/cards`, newCardData);
  return response.data;
};
