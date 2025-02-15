// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Button, ButtonProps } from 'antd'
import { useState } from 'react'
import useCountdownTimer from './useCountdownTimer'

interface BaseButtonProps extends ButtonProps {
  baseLabel?: React.ReactNode
  className?: string
  type?: 'text' | 'link' | 'ghost' | 'default' | 'primary' | 'dashed' | undefined
  onClick?: () => void
}

const CountdownTimerButton = ({ className, baseLabel, type, onClick }: BaseButtonProps) => {
  const [isCountingDown, setIsCountingDown] = useState<boolean>(true)
  const remainingSeconds: number = useCountdownTimer(60, isCountingDown) // countdown from 30 seconds

  const handleButtonClick = (): void => {
    setIsCountingDown(true)
    onClick && onClick()
  }

  let buttonLabel = baseLabel
  if (isCountingDown) {
    if (remainingSeconds === 0) {
      setIsCountingDown(false)
    } else {
      buttonLabel = `${baseLabel} in ${remainingSeconds} seconds`
    }
  }

  const BaseButton = (props: BaseButtonProps) => {
    return (
      <Button className={className} type={type} {...props}>
        {buttonLabel}
      </Button>
    )
  }

  return (
    <div>
      {isCountingDown ? (
        <BaseButton disabled>{buttonLabel}</BaseButton>
      ) : (
        <BaseButton onClick={handleButtonClick}>{buttonLabel}</BaseButton>
      )}
    </div>
  )
}

export default CountdownTimerButton
