import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const languages = [
  { code: 'de', label: 'Deutsch', description: 'Deutsch (Schweiz)' },
  { code: 'en', label: 'English', description: 'English (International)' },
] as const;

export function LanguagePicker() {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedLanguage(i18n.language);
  }, [i18n.language]);

  const handleSave = async () => {
    setIsSaving(true);
    await i18n.changeLanguage(selectedLanguage);
    setIsSaving(false);
  };

  return (
    <div className="space-y-4">
      <RadioGroup
        value={selectedLanguage}
        onValueChange={setSelectedLanguage}
        className="grid gap-4"
      >
        {languages.map((language) => (
          <div key={language.code} className="flex items-center space-x-2">
            <RadioGroupItem value={language.code} id={language.code} />
            <Label htmlFor={language.code} className="flex flex-col">
              <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {language.label}
              </span>
              <span className="text-sm text-muted-foreground">
                {language.description}
              </span>
            </Label>
          </div>
        ))}
      </RadioGroup>
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving || selectedLanguage === i18n.language}
        >
          {t('actions.save', 'Speichern')}
        </Button>
      </div>
    </div>
  );
}
