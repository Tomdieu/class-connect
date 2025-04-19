"use client";
import React from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    // SelectValue,
} from "@/components/ui/select"
import { useChangeLocale, useCurrentLocale } from '@/locales/client'


function ChangeLanguage() {
    const changeLocalLangauge = useChangeLocale()
    const currentLocale = useCurrentLocale()
    const [value, setValue] = React.useState(currentLocale)

    const flag = {
        'en': '🇺🇸',
        'fr': '🇫🇷'
    }

    const handleChange = (value: "en" | "fr") => {
        changeLocalLangauge(value)
        setValue(value)
    }
    return (
        <Select value={value} onValueChange={handleChange}>
            <SelectTrigger className="w-fit p-1 px-1.5 flex items-center gap-1">
                {/* <Languages className='w-4 h-4 text-muted-foreground'/> */}
                <span>{flag[value]}</span>
                <span className='capitalize font-bold'>{value}</span>
                {/* <SelectValue placeholder="Lang" className='mr-1' /> */}
            </SelectTrigger>
            <SelectContent className='z-[999999999999999999]'>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
            </SelectContent>
        </Select>

    )
}

export default ChangeLanguage
