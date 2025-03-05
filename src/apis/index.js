import axios from "axios";
import { API_ROOT } from "~/utils/constants";
/**
 * Không sử dụng try-catch để call api với axios
 * Vì nó gây ra việc dư thừa code quá nhiều
 * Chúng ta chỉ lên catch lỗi tập trung tại một nơi bằng cách sử dụng Interceptors trong axios
 * Interceptors là cách mà chúng ta đánh chặn giữa req và res để xử lý logic mà chúng ta muốn
 */
export const fetchBoardDetailsAPI = async (boardId) => {
  const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`);
  //Đối với việc chạy qua axios thì nó sẽ nằm trong request.data
  return response.data;
};
