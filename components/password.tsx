"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { EyeIcon } from "lucide-react";

export const PasswordInput = ({ name, defaultValue }: { name: string, defaultValue: string }) => {
    const [passwordType, setPasswordType] = useState<"password" | "text">("password")
    return (
        <div>
            <div className="flex relative">
                <button className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-slate-500 transition hover:bg-slate-950/10 hover:text-slate-950" type="button" onClick={() => setPasswordType(passwordType === "password" ? "text" : "password")} aria-label={passwordType === "password" ? "Show password" : "Hide password"}><EyeIcon className="size-4" /> </button>
                <Input className="pr-12" name={name} type={passwordType} defaultValue={defaultValue} required />
            </div>
        </div>
    )
}
