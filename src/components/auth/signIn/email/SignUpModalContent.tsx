// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import HCaptcha from '@hcaptcha/react-hcaptcha'
import { stringToU8a, u8aToHex } from '@polkadot/util'
import { isStr } from '@subsocial/utils'
import { Button, Form, Input } from 'antd'
import clsx from 'clsx'
import jwtDecode from 'jwt-decode'
import { RuleObject } from 'rc-field-form/lib/interface'
import { useEffect, useRef, useState } from 'react'
import { MutedDiv } from 'src/components/utils/MutedText'
import {
  emailSignUp,
  JwtPayload,
  onErrorHandler,
  requestProof,
} from 'src/components/utils/OffchainSigner/api/requests'
import { setAuthOnRequest } from 'src/components/utils/OffchainSigner/api/utils'
import SignerKeyringManager from 'src/components/utils/OffchainSigner/SignerKeyringManager'
import useMnemonicGenerate from 'src/components/utils/OffchainSigner/useMnemonicGenerate'
import { hCaptchaSiteKey } from 'src/config/env'
import useSignerExternalStorage from 'src/hooks/useSignerExternalStorage'
import { StepsEnum, useAuth } from '../../AuthContext'
import { EmailInput, PasswordInput } from './SignInModalContent'
import styles from './SignInModalContent.module.sass'
import useEncryptedStorage from './useEncryptionToStorage'
import { useFormValidation } from './useFormValidation'

type FormValues = {
  email: string
  password: string
  repeatPassword: string
}

type FieldName = keyof FormValues

export const fieldName = (name: FieldName): FieldName => name

type Props = {
  setCurrentStep: (step: number) => void
}

const signerKeyringManager = new SignerKeyringManager()

const SignUpModalContent = ({ setCurrentStep }: Props) => {
  const { mnemonic } = useMnemonicGenerate()
  const { createEncryptedAccountAndSave } = useEncryptedStorage()
  const {
    state: { email },
    setPassword,
    setEmail,
  } = useAuth()
  const { isValidEmail, isValidPassword } = useFormValidation()

  const [form] = Form.useForm()

  const [isFormValid, setIsFormValid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [token, setToken] = useState<string | undefined>()
  const [captchaReady, setCaptchaReady] = useState(false)
  const [loading, setLoading] = useState(false)

  const hCaptchaRef = useRef(null)

  const { setSignerTokensByAddress, setSignerTempRegisterAccount } = useSignerExternalStorage()

  const onExpire = () => {
    setError('hCaptcha Token Expired')
  }

  const onError = (err: any) => {
    setError(`hCaptcha Error: ${err}`)
  }

  const loadCaptcha = () => {
    // this reaches out to the hCaptcha JS API and runs the
    // execute function on it. you can use other functions as
    // documented here:
    // https://docs.hcaptcha.com/configuration#jsapi
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    hCaptchaRef.current?.execute()
  }

  useEffect(() => {
    setCaptchaReady(true)
  }, [])

  useEffect(() => {
    if (!token) return
    handleSubmit(form.getFieldsValue(), token)
  }, [token])

  const handleSubmit = async (values: FormValues, token: string) => {
    try {
      const newPair = signerKeyringManager.generateKeypairBySecret(mnemonic)
      const accountAddress = newPair.address
      const { proof } = await requestProof(newPair.address)

      const message = stringToU8a(proof)
      const signedProof = newPair.sign(message)

      const { email, password } = values

      const props = {
        email,
        password,
        accountAddress,
        signedProof: u8aToHex(signedProof),
        proof,
        hcaptchaResponse: token,
      }

      const data = await emailSignUp(props)
      const { accessToken, refreshToken } = data
      setAuthOnRequest(accessToken as string)

      const decoded = jwtDecode<JwtPayload>(accessToken)
      const { emailVerified } = decoded

      if (!emailVerified) {
        // save to local storage for usage in ConfirmationModal
        setSignerTokensByAddress({
          userAddress: accountAddress,
          token: accessToken,
          refreshToken,
        })
        setSignerTempRegisterAccount(accountAddress)

        // save secret to local storage (in case of page reload)
        createEncryptedAccountAndSave(mnemonic, password)

        // for decryption
        setPassword(password)

        // email to be shown in ConfirmationModal
        setEmail(email)

        setCurrentStep(StepsEnum.Confirmation)
      }
    } catch (error) {
      setLoading(false)
      onErrorHandler(error, setError)
    }
  }

  const handleValuesChange = (_: FormValues, allValues: FormValues) => {
    const isFilled = Object.values(allValues).every(value => Boolean(value))
    const isEmailValid = isValidEmail(allValues.email)
    const isPasswordValid = isValidPassword(allValues.password)
    const isMatched = allValues.password === allValues.repeatPassword
    const isValid = isFilled && isEmailValid && isPasswordValid && isMatched
    setIsFormValid(isValid)
  }

  const validateRepeatPassword = (_: RuleObject, value: RuleObject) => {
    if (value && value !== form.getFieldValue('password')) {
      return Promise.reject(new Error('Passwords do not match.'))
    }
    return Promise.resolve()
  }

  const isError = isStr(error)

  return (
    <Form form={form} onValuesChange={handleValuesChange}>
      <div className={styles.SignInModalContent}>
        <EmailInput
          data={email ?? form.getFieldValue('email')}
          error={error}
          isError={isError}
          form={form}
        />

        <PasswordInput error={error} isError={isError} form={form} />

        <Form.Item
          name={fieldName('repeatPassword')}
          className={clsx(styles.BaseFormItem, isError && styles.BaseFormItemError)}
          validateTrigger='onBlur'
          rules={[{ validator: validateRepeatPassword }]}
        >
          <Input
            required
            type='password'
            onBlur={e => {
              form.validateFields(['repeatPassword'])
              form.setFieldsValue({ [fieldName('repeatPassword')]: e.target.value.trim() })
            }}
            placeholder='Repeat Password'
          />
        </Form.Item>

        <Button
          type='primary'
          size='large'
          htmlType='submit'
          loading={loading}
          disabled={!isFormValid || loading || !captchaReady}
          onClick={() => {
            setLoading(true)
            loadCaptcha()
          }}
          block
        >
          Sign Up
          <HCaptcha
            size='invisible'
            sitekey={hCaptchaSiteKey}
            onVerify={token => {
              setToken(token)
            }}
            onLoad={() => {
              setCaptchaReady(true)
            }}
            onClose={() => {
              setLoading(false)
            }}
            onError={onError}
            onExpire={onExpire}
            ref={hCaptchaRef}
          />
        </Button>
        <div className='d-flex justify-content-center align-items-center'>
          <MutedDiv className='font-weight-normal FontNormal'>
            Already have an account?
            <Button
              className={styles.ButtonLinkDiv}
              type='link'
              onClick={() => setCurrentStep(StepsEnum.SignIn)}
            >
              Sign In
            </Button>
          </MutedDiv>
        </div>
      </div>
    </Form>
  )
}

export default SignUpModalContent
