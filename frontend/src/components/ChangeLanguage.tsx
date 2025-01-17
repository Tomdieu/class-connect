"use client";
import React from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useChangeLocale, useCurrentLocale } from '@/locales/client'
import { Languages } from 'lucide-react'


function ChangeLanguage() {
    const changeLocalLangauge = useChangeLocale()
    const currentLocale = useCurrentLocale()
    const [value, setValue] = React.useState(currentLocale)

    const handleChange = (value: "en" | "fr") => {
        changeLocalLangauge(value)
        setValue(value)
    }
    return (
        <Select value={value} onValueChange={handleChange}>
            <SelectTrigger className="w-fit flex items-center gap-1">
                <Languages className='w-4 h-4 text-muted-foreground'/>
                <SelectValue placeholder="Lang" className='mr-1' />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
            </SelectContent>
        </Select>

    )
}

export default ChangeLanguage
