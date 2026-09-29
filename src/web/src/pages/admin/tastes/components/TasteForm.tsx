import { IconMasterDataForm } from '@/components/IconMasterDataForm'
import { tasteIcons } from '@/lib/tasteIcons'
import type {
  CreateTasteBody,
  Taste,
} from '@/schemas/admin/tastes/tasteSchemas'

type TasteFormProps = {
  taste?: Taste
  submitLabel: string
  onSubmit: (body: CreateTasteBody) => Promise<unknown>
  onCancel: () => void
}

export function TasteForm({ taste, ...props }: TasteFormProps) {
  return (
    <IconMasterDataForm
      idPrefix="taste"
      entityLabel="รสชาติ"
      registry={tasteIcons}
      record={taste}
      {...props}
    />
  )
}
