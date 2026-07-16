import { mapField } from '@/lib/api/mappers';
import { unwrapList } from '@/lib/api/response';
import type { IField, IFieldAvailability } from '@/lib/api/types';
import { fieldService } from '@/lib/service';

export async function getFields(): Promise<IField[]> {
  return unwrapList(await fieldService.getFields({ limit: 100 })).map(mapField);
}

export async function getFieldById(id: string): Promise<IField> {
  return mapField(await fieldService.getField(id));
}

export async function getFieldAvailability(
  fieldId: string,
  date: string,
): Promise<IFieldAvailability> {
  return fieldService.getAvailability(fieldId, date);
}
