import type { Streami18n } from './Streami18n';
import Dayjs from 'dayjs';
import type { Moment } from 'moment-timezone';
import { MessageContextValue } from '../context';
import type { TFunction } from 'i18next';
export type FormatterFactory<V> = (streamI18n: Streami18n) => (value: V, lng: string | undefined, options: Record<string, unknown>) => string;
export type TimestampFormatterOptions = {
    calendar?: boolean;
    calendarFormats?: Record<string, string>;
    format?: string;
};
export type TDateTimeParserInput = string | number | Date;
export type TDateTimeParserOutput = string | number | Date | Dayjs.Dayjs | Moment;
export type TDateTimeParser = (input?: TDateTimeParserInput) => TDateTimeParserOutput;
export type SupportedTranslations = 'de' | 'en' | 'es' | 'fr' | 'hi' | 'it' | 'ja' | 'ko' | 'nl' | 'pt' | 'ru' | 'tr';
export type DateFormatterOptions = TimestampFormatterOptions & {
    formatDate?: MessageContextValue['formatDate'];
    messageCreatedAt?: string | Date;
    t?: TFunction;
    tDateTimeParser?: TDateTimeParser;
    timestampTranslationKey?: string;
};
export type CustomFormatters = Record<string, FormatterFactory<any>>;
export type PredefinedFormatters = {
    timestampFormatter: FormatterFactory<string | Date>;
};
