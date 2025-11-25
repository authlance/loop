import * as React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Button } from './button'
import { Calendar } from './calendar'
import { CalendarIcon } from 'lucide-react'
import { Input } from './input'
import moment from 'moment'

function formatDate(date?: Date) {
    if (!date) {
      return ''
    }
    return moment(date).format('MM/DD/YYYY')
}

function parseDate(value: string): Date | undefined {
    const m = moment(value, 'MM/DD/YYYY', true)
    return m.isValid() ? m.toDate() : undefined
}

export function DatePicker({ date, onChange }: { date: Date | undefined; onChange: (date: Date | undefined) => void }) {
    const [open, setOpen] = React.useState(false)
    const [month, setMonth] = React.useState<Date | undefined>(date)
    const [value, setValue] = React.useState(formatDate(date))

    return (
        <div className="relative flex gap-2">
            <Input
                id="date"
                value={value}
                placeholder="MM/DD/YYYY"
                className="bg-background pr-10"
                inputMode="numeric"
                onChange={(e) => {
                    const v = e.target.value
                    setValue(v)
                    const parsed = parseDate(v)
                    if (parsed) {
                        onChange(parsed)
                        setMonth(parsed)
                    }
                }}
                onBlur={() => {
                    const parsed = parseDate(value)
                    if (parsed) {
                      setValue(formatDate(parsed))
                      onChange(parsed)
                      setMonth(parsed)
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                        e.preventDefault()
                        setOpen(true)
                    }
                }}
            />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date-picker"
                        variant="ghost"
                        className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                    >
                        <CalendarIcon className="size-3.5" />
                        <span className="sr-only">Select date</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
                    <Calendar
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        month={month}
                        onMonthChange={setMonth}
                        onSelect={(d) => {
                            onChange(d)
                            setValue(formatDate(d))
                            setMonth(d)
                            setOpen(false)
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
