import { ConfirmModal } from '@/components/index'
import { useSupabase } from '@/context/SupabaseProvider'
import { DocumentTypes } from '@/types'
import { PaperclipIcon } from 'lucide-react'
import { useState } from 'react'

export default function Attachment({
  doc,
  id,
  file,
}: {
  id: string
  file: string
  doc: DocumentTypes
}) {
  const [downloading, setDownloading] = useState(false)
  const { supabase } = useSupabase()

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [hidden, setHidden] = useState(false)

  const handleDownloadFile = async (file: string) => {
    if (downloading) return

    setDownloading(true)

    const { data, error } = await supabase.storage
      .from('hor_documents')
      .download(`letter_tracker/${id}/${file}`)

    if (error) console.error(error)

    const url = window.URL.createObjectURL(new Blob([data]))

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', file)
    document.body.appendChild(link)
    link.click()
    link.remove()

    setDownloading(false)
  }

  const handleDeleteClick = () => {
    setShowConfirmation(true)
  }

  const handleDeleteFile = async () => {
    setShowConfirmation(false)
    const { error } = await supabase.storage
      .from('hor_documents')
      .remove([`letter_tracker/${id}/${file}`])

    if (error) {
      console.error(error)
    } else {
      const updatedAttachments = doc.attachments.filter(
        (attachment: any) => attachment.name !== file
      )
      await supabase
        .from('asenso_letter_trackers')
        .update({ attachments: updatedAttachments })
        .eq('id', doc.id)
      setHidden(true)
    }
  }

  return (
    <div className={`flex space-x-2 items-center ${hidden ? 'hidden' : ''}`}>
      <PaperclipIcon className="w-4 h-4 text-blue-700 " />
      <span
        onClick={() => handleDownloadFile(file)}
        className="cursor-pointer text-blue-700 font-medium text-[10px]">
        {file}
        {downloading ? ' downloading...' : ''}
      </span>
      <span
        onClick={handleDeleteClick}
        className="text-red-600 cursor-pointer text-xs font-bold">
        [Delete This File]
      </span>
      {showConfirmation && (
        <ConfirmModal
          header="Confirmation"
          btnText="Confirm"
          message="Are you sure you want to delete this file?"
          onConfirm={handleDeleteFile}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  )
}
