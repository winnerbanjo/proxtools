"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SubmitButton({ defaultText, pendingText, disabled = false }: { defaultText: string; pendingText: string; disabled?: boolean }) {
    // pending will be true while the registerAction is executing
    const { pending } = useFormStatus();

    return (
        <Button disabled={disabled || pending} type="submit" className="w-full">
            {pending ? pendingText : defaultText}
        </Button>
    );
}



