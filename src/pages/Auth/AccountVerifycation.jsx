import React, { useState, useEffect } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import { verifyUserAPI } from '~/apis'

function AccountVerifycation() {
  //Lấy giá trị email và token từ URL
  const [searchParams] = useSearchParams()

  const { email, token } = Object.fromEntries([...searchParams])

  //Tạo 1 biến state để biết được là đã verirfy tài khoản thành công hay chưa
  const [verirfyed, setVerified] = useState(false)

  useEffect(() => {
    if (email && token) {
      verifyUserAPI({
        email,
        token
      })
        .then(() => {
          setVerified(true)
        })
    }
  }, [email, token])

  //Gọi API verify tài khoản
  //Nếu url có vấn đề thì ra trang 404
  if (!email || !token) {
    return <Navigate to="/404" />
  }

  if (!verirfyed) {
    return <PageLoadingSpinner />
  }

  //Nếu chưa verify xong thì hiện loading

  //Cuối cùng nếu k gặp vấn đề gì + verify thành công thì điều hướng về login cùng giá trị verifiedEmail

  return <Navigate to={`/login?verifiedEmail=${email}`} />
}

export default AccountVerifycation
