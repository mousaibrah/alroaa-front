import { CircleCheck, CirclePlay, FileText, Lock } from 'lucide-react';

// Lesson/exam status icons (lucide), sized to sit next to a line of text.
const cls = 'size-5 shrink-0';

export const LockIcon = () => <Lock aria-hidden className={cls} />;
export const CheckIcon = () => <CircleCheck aria-hidden className={cls} />;
export const PlayIcon = () => <CirclePlay aria-hidden className={cls} />;
export const TextIcon = () => <FileText aria-hidden className={cls} />;
