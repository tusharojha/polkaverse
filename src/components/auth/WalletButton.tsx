// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { AvatarOrSkeleton } from '../utils'
import { StepsEnum } from './AuthContext'
import styles from './WalletButton.module.sass'

type Props = {
  setCurrentStep: (step: number) => void
}

const WalletButton = ({ setCurrentStep }: Props) => {
  const handleClick = () => {
    setCurrentStep(StepsEnum.SelectAccount)
  }

  return (
    <div className={styles.WalletButton} onClick={() => handleClick()}>
      <div className='d-flex align-items-center'>
        <AvatarOrSkeleton
          externalIcon
          icon={'/images/wallets/WalletIcon.svg'}
          size={'large'}
          className='mr-2 align-items-start'
        />
        <div className='font-weight-bold'>Connect wallet</div>
      </div>
    </div>
  )
}

export default WalletButton
