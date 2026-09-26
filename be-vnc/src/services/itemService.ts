import * as itemRepository from '../repositories/itemRepository'

export function countItems() {
  return itemRepository.countItems()
}
