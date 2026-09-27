import { HttpError } from '../../lib/httpError'
import * as itemRepository from '../repositories/itemRepository'
import {
  CreateItemInput,
  ReplaceItemInput,
  UpdateItemInput,
} from '../validations/itemValidation'

export function countItems() {
  return itemRepository.countItems()
}

export function listItems() {
  return itemRepository.findItems()
}

export async function getItemById(id: number) {
  const item = await itemRepository.findItemById(id)
  if (!item) {
    throw new HttpError(404, 'Item not found')
  }
  return item
}

// Name and slug must be unique. Pass the current item's id on update so it can keep its own.
async function ensureNameAndSlugAreFree(
  { name, slug }: { name?: string; slug?: string },
  itemId?: number,
) {
  const [nameOwner, slugOwner] = await Promise.all([
    name ? itemRepository.findItemIdByName(name) : null,
    slug ? itemRepository.findItemIdBySlug(slug) : null,
  ])
  if (nameOwner && nameOwner.id !== itemId) {
    throw new HttpError(409, 'Item name is already taken')
  }
  if (slugOwner && slugOwner.id !== itemId) {
    throw new HttpError(409, 'Item slug is already taken')
  }
}

export async function createItem(input: CreateItemInput) {
  await ensureNameAndSlugAreFree(input)
  return itemRepository.createItem(input)
}

// Used by both PUT and PATCH — the schemas decide which fields are required.
export async function updateItem(
  id: number,
  input: ReplaceItemInput | UpdateItemInput,
) {
  await getItemById(id)
  await ensureNameAndSlugAreFree(input, id)
  return itemRepository.updateItem(id, input)
}

export async function deleteItem(id: number) {
  await getItemById(id)
  await itemRepository.deleteItem(id)
}
