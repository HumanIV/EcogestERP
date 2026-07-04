import React, { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilMagnifyingGlass, cilReload } from '@coreui/icons'
import logoPersonalizado from '../../../assets/images/Minect.jpg'
import logoUnefa from '../../../assets/images/unefa.png'
import { useAuth } from '../../../context/AuthContext'

const Login = () => {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const from = location.state?.from || '/Inicio'

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Ingresa correo y contraseña')
      return
    }

    setIsLoading(true)
    const result = await login(email, password)
    setIsLoading(false)

    if (!result.success) {
      setError(result.error || 'Credenciales inválidas')
      return
    }

    navigate(from, { replace: true })
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6} lg={5} xl={4} className="login-col">
            <CCard className="login-card">
              <div className="login-logos-container">
                <div className="login-logo-wrapper">
                  <img src={logoPersonalizado} alt="Logo Minect" className="login-logo" />
                </div>
                <div className="login-logo-wrapper">
                  <img src={logoUnefa} alt="Logo Unefa" className="login-logo" />
                </div>
              </div>
              <CCardBody className="p-4">
                <CForm onSubmit={handleLogin}>
                  <h1 className="text-center mb-3">Inicio de Sesión</h1>
                  <p className="text-body-secondary text-center mb-4">Ingresa a tu cuenta</p>

                  {error && (
                    <CAlert color="danger" className="mb-3">
                      {error}
                    </CAlert>
                  )}

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      type="email"
                      placeholder="Correo electrónico"
                      autoComplete="username"
                      className="login-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Contraseña"
                      autoComplete="current-password"
                      className="login-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <CButton
                      type="button"
                      color="secondary"
                      variant="outline"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                    >
                      <CIcon icon={showPassword ? cilReload : cilMagnifyingGlass} />
                    </CButton>
                  </CInputGroup>

                  <CRow className="align-items-center">
                    <CCol xs={6}>
                      <CButton
                        type="submit"
                        color="primary"
                        className="px-4 login-btn"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <CSpinner size="sm" className="me-2" />
                            Entrando...
                          </>
                        ) : (
                          'Iniciar Sesión'
                        )}
                      </CButton>
                    </CCol>
                    <CCol xs={6} className="text-end">
                      <CButton type="button" color="link" className="forgot-password-link">
                        <CIcon icon={cilLockLocked} className="me-1" />
                        ¿Olvidaste tu contraseña?
                      </CButton>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
