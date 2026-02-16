import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button" // Not used in simple version
import { Input } from "@/components/ui/input"

export function DatePicker({
    selected,
    onSelect,
    onChange,
    placeholder = "Pick a date",
    disabled = false,
}) {
    const [date, setDate] = React.useState(selected ? format(selected, 'yyyy-MM-dd') : '');

    const handleDateChange = (e) => {
        setDate(e.target.value);

        if (e.target.value) {
            const newDate = new Date(e.target.value);
            if (onSelect) onSelect(newDate);
            if (onChange) onChange(newDate);
        } else {
            if (onSelect) onSelect(undefined);
            if (onChange) onChange(undefined);
        }
    };

    React.useEffect(() => {
        if (selected) {
            setDate(format(selected, 'yyyy-MM-dd'));
        } else {
            setDate('');
        }
    }, [selected]);

    return (
        <div className="relative">
            <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="date"
                value={date}
                onChange={handleDateChange}
                className="pl-9 w-[240px]"
                disabled={disabled}
            />
        </div>
    )
}
