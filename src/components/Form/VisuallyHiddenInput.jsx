import { styled } from '@mui/material/styles'

/**
 * Ví dụ xử lý custom đẹp cái input file ở đây:
 * Lưu ý thành phần bọc cái VisuallyHiddenInput này phải có chứa component="label" như docs hướng dẫn:
 * https://mui.com/material-ui/react-button/#file-upload
 * ...
 * Ngoài ra note thêm lib này từ docs của MUI nó recommend nếu cần dùng:
 * https://github.com/viclafouch/mui-file-input
 */
const HiddenInputStyles = styled('input')({
  display: 'none' // Docs ở trên làm css dài quá, chỉ cần display none để ẩn thẻ input file đi là đủ rồi :))

  // clip: 'rect(0 0 0 0)',
  // clipPath: 'inset(50%)',
  // height: 1,
  // overflow: 'hidden',
  // position: 'absolute',
  // // bottom: 0, // Nếu dùng bottom: 0 như docs thì sẽ phát sinh lỗi ở Modal ActiveCard mỗi lần click là scroll bị nhảy xuống bottom
  // left: 0,
  // whiteSpace: 'nowrap',
  // width: 1
})

function VisuallyHiddenInput(props) {
  return <HiddenInputStyles {...props} />
}

export default VisuallyHiddenInput
