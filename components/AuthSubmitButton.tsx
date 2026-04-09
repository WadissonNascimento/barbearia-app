"use client";

import SubmitButton from "@/components/SubmitButton";

type Props = {
  idleText: string;
  loadingText: string;
};

export default function AuthSubmitButton({
  idleText,
  loadingText,
}: Props) {
  return <SubmitButton idleText={idleText} loadingText={loadingText} />;
}
