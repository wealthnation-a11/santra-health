import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface VoiceLanguage {
  code: string;
  name: string;
  flag: string;
}

export const VOICE_LANGUAGES: VoiceLanguage[] = [
  { code: "en-US", name: "English (US)", flag: "🇺🇸" },
  { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
  { code: "es-ES", name: "Spanish", flag: "🇪🇸" },
  { code: "fr-FR", name: "French", flag: "🇫🇷" },
  { code: "de-DE", name: "German", flag: "🇩🇪" },
  { code: "it-IT", name: "Italian", flag: "🇮🇹" },
  { code: "pt-BR", name: "Portuguese (BR)", flag: "🇧🇷" },
  { code: "zh-CN", name: "Chinese (Mandarin)", flag: "🇨🇳" },
  { code: "ja-JP", name: "Japanese", flag: "🇯🇵" },
  { code: "ko-KR", name: "Korean", flag: "🇰🇷" },
  { code: "ar-SA", name: "Arabic", flag: "🇸🇦" },
  { code: "hi-IN", name: "Hindi", flag: "🇮🇳" },
  { code: "ru-RU", name: "Russian", flag: "🇷🇺" },
  { code: "nl-NL", name: "Dutch", flag: "🇳🇱" },
  { code: "pl-PL", name: "Polish", flag: "🇵🇱" },
  { code: "tr-TR", name: "Turkish", flag: "🇹🇷" },
  { code: "vi-VN", name: "Vietnamese", flag: "🇻🇳" },
  { code: "th-TH", name: "Thai", flag: "🇹🇭" },
  { code: "id-ID", name: "Indonesian", flag: "🇮🇩" },
  { code: "ms-MY", name: "Malay", flag: "🇲🇾" },
];

interface VoiceLanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function VoiceLanguageSelector({
  value,
  onChange,
  disabled = false,
}: VoiceLanguageSelectorProps) {
  const selectedLanguage = VOICE_LANGUAGES.find((lang) => lang.code === value);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-[140px] h-9 text-xs">
        <div className="flex items-center gap-1.5">
          <Globe size={14} className="text-muted-foreground" />
          <SelectValue>
            {selectedLanguage && (
              <span>
                {selectedLanguage.flag} {selectedLanguage.name.split(" ")[0]}
              </span>
            )}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {VOICE_LANGUAGES.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
