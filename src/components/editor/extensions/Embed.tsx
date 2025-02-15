// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { mergeAttributes, Node } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import BaseEmbed from 'react-embed'
import { BareProps } from 'src/components/utils/types'

type Props = BareProps & {
  src: string
}

const ReactEmbed = ({ src, ...props }: Props) => <BaseEmbed url={src} {...props} />

export const ReactWrapEmbed = (props: any) => {
  return (
    <NodeViewWrapper>
      <ReactEmbed src={props.node.attrs.src} />
    </NodeViewWrapper>
  )
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    'subsocial-embed': {
      /**
       * Add an iframe
       */
      setEmbed: (options: { src: string }) => ReturnType
    }
  }
}

export const Embed = Node.create({
  name: 'subsocial-embed',
  group: 'block',
  content: 'inline*',
  draggable: true,

  addAttributes() {
    // Return an object with attribute configuration
    return {
      src: {
        default: '',
      },
    }
  },

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'subsocial-embed',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'subsocial-embed',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['subsocial-embed', mergeAttributes(HTMLAttributes), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ReactWrapEmbed)
  },

  addCommands() {
    return {
      setEmbed:
        options =>
        ({ commands }) => {
          return commands.insertContent([
            {
              type: this.name,
              attrs: options,
            },
            {
              type: 'paragraph',
            },
          ])
        },
    }
  },
})
