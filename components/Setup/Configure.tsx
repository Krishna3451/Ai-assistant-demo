import React, { useEffect, useRef, useState } from "react";
import { useVoiceClient } from "realtime-ai-react";
import { LANGUAGES, CATERGORIES } from "@/rtvi.config";
import { useLanguageStore } from "@/lib/stores/languageStore";
import { useCategoryStore } from "@/lib/stores/categoryStore";
import HelpTip from "../ui/helptip";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Select } from "../ui/select";
import DeviceSelect from "./DeviceSelect";
import { Globe } from "lucide-react";
import { Field } from "../ui/field";

interface ConfigureProps {
  state: string;
  startAudioOff?: boolean;
  handleStartAudioOff?: () => void;
  inSession?: boolean;
}

export const Configure: React.FC<ConfigureProps> = React.memo(
  ({ startAudioOff, handleStartAudioOff, inSession = false }) => {
    const [showPrompt, setshowPrompt] = useState<boolean>(false);
    const modalRef = useRef<HTMLDialogElement>(null);
    const voiceClient = useVoiceClient();
    const { selectedLanguage, setLanguage } = useLanguageStore();
    const { selectedCategory, setCategory } = useCategoryStore();

    useEffect(() => {
      const current = modalRef.current;

      if (current && showPrompt) {
        current.inert = true;
        current.showModal();
        current.inert = false;
      }
      return () => current?.close();
    }, [showPrompt]);

    const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (voiceClient) {
        await setLanguage(e.target.value, voiceClient);
      }
    };

    const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCategory(e.target.value);
    };

    return (
      <>
        <section className="flex flex-col flex-wrap gap-3 lg:gap-4">
          <DeviceSelect hideMeter={false} />
          
          {/* <div className="mt-2">
            <Field label="Language" error={false}>
              <Select
                onChange={handleLanguageChange}
                value={selectedLanguage}
                icon={<Globe size={24} />}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div> */}
          <div className="mt-2">
            <Field label="Category" error={false}>
              <Select
                onChange={handleCategoryChange}
                value={selectedCategory}
                icon={<Globe size={24} />}
              >
                {CATERGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </section>

        {!inSession && (
          <section className="flex flex-col gap-4 border-y border-primary-hairline py-4 mt-4">
            <div className="flex flex-row justify-between items-center">
              <Label className="flex flex-row gap-1 items-center">
                Join with mic muted{" "}
                <HelpTip text="Start with microphone muted (click to unmute)" />
              </Label>
              <Switch
                checked={startAudioOff}
                onCheckedChange={handleStartAudioOff}
              />
            </div>
          </section>
        )}
      </>
    );
  },
  (prevProps, nextProps) =>
    prevProps.startAudioOff === nextProps.startAudioOff &&
    prevProps.state === nextProps.state
);

Configure.displayName = "Configure";