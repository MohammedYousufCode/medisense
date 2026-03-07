import { supabase } from '../lib/supabase'
import { generateReportFileName } from '../lib/helpers'

export async function uploadReportFile(
  file: File,
  userId: string
): Promise<string> {
  const fileName = generateReportFileName(file.name, userId)

  const { error } = await supabase.storage
    .from('reports')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error
  return fileName
}

export async function getReportFileUrl(path: string): Promise<string> {
  const { data } = await supabase.storage
    .from('reports')
    .createSignedUrl(path, 60 * 60) // 1 hour

  if (!data?.signedUrl) throw new Error('Could not generate file URL')
  return data.signedUrl
}

export async function deleteReportFile(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from('reports')
    .remove([path])

  if (error) throw error
}
