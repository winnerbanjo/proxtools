"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { EyeIcon } from "lucide-react";

export const PasswordInput = ({ name, defaultValue }: { name: string, defaultValue: string }) => {
    const [passwordType, setPasswordType] = useState<"password" | "text">("password")
    return (
        <div>
            <div className="flex relative">
                <div className="absolute top-1/2 -translate-y-1/2 right-3 cursor-pointer" onClick={() => setPasswordType(passwordType === "password" ? "text" : "password")}><EyeIcon /> </div>
                <Input name={name} type={passwordType} defaultValue={defaultValue} required />
            </div>
        </div>
    )
}