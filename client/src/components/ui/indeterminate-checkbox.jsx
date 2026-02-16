import React, { useRef, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"

export function IndeterminateCheckbox({
    indeterminate,
    className,
    ...rest
}) {
    const ref = useRef(null)

    useEffect(() => {
        if (typeof indeterminate === "boolean" && ref.current) {
            ref.current.dataState = indeterminate ? "indeterminate" : rest.checked ? "checked" : "unchecked"
        }
    }, [ref, indeterminate, rest.checked])

    return (
        <Checkbox
            ref={ref}
            className={className + (indeterminate ? " data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground" : "")}
            {...rest}
        />
    )
}
