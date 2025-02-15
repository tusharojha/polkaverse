// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import Link from 'next/link'
import React from 'react'
import { SpaceId, SpaceWithSomeDetails } from 'src/types'
import { useSelectSpace } from '../../rtk/features/spaces/spacesHooks'
import { createNewPostLinkProps } from './helpers'
import { ViewSpace } from './ViewSpace'

type PreviewProps = {
  space: SpaceWithSomeDetails
}

export const SpacePreview = ({ space }: PreviewProps) => (
  <ViewSpace spaceData={space} withFollowButton preview withTipButton={false} />
)

type PublicSpacePreviewByIdProps = {
  spaceId: SpaceId
}

export const PublicSpacePreviewById = React.memo(({ spaceId }: PublicSpacePreviewByIdProps) => {
  const space = useSelectSpace(spaceId)

  if (!space) return null

  return <SpacePreview space={space} />
})

type LinkSpacePreviewByIdProps = PublicSpacePreviewByIdProps & {
  closeModal: VoidFunction
}

export const LinkSpacePreviewById = React.memo(
  ({ spaceId, closeModal }: LinkSpacePreviewByIdProps) => {
    const space = useSelectSpace(spaceId)

    if (!space) return null

    return (
      <Link {...createNewPostLinkProps(space.struct)}>
        <ViewSpace onClick={closeModal} spaceData={space} miniPreview withFollowButton={false} />
      </Link>
    )
  },
)
