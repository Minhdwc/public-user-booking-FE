import { mapField } from '@/lib/api/mappers';
import { unwrapList, unwrapPage } from '@/lib/api/response';
import type { FieldListParams, IField, IFieldAvailability } from '@/lib/api/types';
import { fieldService } from '@/lib/service';

export async function getFields(params: FieldListParams = {}): Promise<IField[]> {
  return unwrapList(await fieldService.getFields({ limit: 100, ...params })).map(mapField);
}

export async function getFieldsPage(params: FieldListParams = {}) {
  const page = unwrapPage(await fieldService.getFields({ limit: 12, ...params }));
  return {
    ...page,
    data: page.data.map(mapField),
  };
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
