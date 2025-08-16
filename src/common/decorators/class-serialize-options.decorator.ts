import { SetMetadata } from '@nestjs/common';
import { SerializeDefaults } from '@common/@types';

export const SERIALIZE_OPTIONS_KEY = 'class_serializer_options';

export const ClassSerializeOptions = (opts: SerializeDefaults) =>
  SetMetadata(SERIALIZE_OPTIONS_KEY, opts);
