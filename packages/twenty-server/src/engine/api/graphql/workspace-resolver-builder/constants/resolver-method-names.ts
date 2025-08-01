export const RESOLVER_METHOD_NAMES = {
  FIND_MANY: 'findMany',
  FIND_ONE: 'findOne',
  FIND_DUPLICATES: 'findDuplicates',
  CREATE_MANY: 'createMany',
  CREATE_ONE: 'createOne',
  UPDATE_MANY: 'updateMany',
  UPDATE_ONE: 'updateOne',
  DELETE_MANY: 'deleteMany',
  DELETE_ONE: 'deleteOne',
  RESTORE_MANY: 'restoreMany',
  RESTORE_ONE: 'restoreOne',
  DESTROY_MANY: 'destroyMany',
  DESTROY_ONE: 'destroyOne',
  MERGE_MANY: 'mergeMany',
} as const;
