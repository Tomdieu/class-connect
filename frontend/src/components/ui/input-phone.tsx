// import React, { forwardRef, useCallback, useState } from 'react';
// import { Popover, PopoverContent, PopoverTrigger } from './popover';
// import * as RPNInput from "react-phone-number-input";
// import flags from "react-phone-number-input/flags";
// import { Button } from './button';
// import { cn } from '@/lib/utils';
// import { CheckIcon, ChevronsUpDown } from 'lucide-react';
// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
// import { ScrollArea } from './scroll-area';
// import { Input } from "./input"

// const CustomInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
//   ({ className, ...props }, ref) => {
//     return (
//       <Input
//         ref={ref}
//         className={`rounded-e-lg rounded-s-none ${className}`}
//         {...props}
//       />
//     );
//   }
// );

// type InputPhoneProps = Omit<
//   React.InputHTMLAttributes<HTMLInputElement>,
//   "onChange" | "value"
// > &
//   Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
//     onChange?: (value: RPNInput.Value) => void;
//   };
// export const InputPhone: React.ForwardRefExoticComponent<InputPhoneProps> =
//   React.forwardRef<React.ElementRef<typeof RPNInput.default>, InputPhoneProps>(
//     ({ className, onChange, ...props }, ref) => {
//       return (
//         <RPNInput.default
//           ref={ref}
//           className={cn("flex", className)}
//           flagComponent={FlagComponent}
//           countrySelectComponent={CountrySelect}
//           inputComponent={CustomInput}

//           /**
//            * Handles the onChange event.
//            *
//            * react-phone-number-input might trigger the onChange event as undefined
//            * when a valid phone number is not entered. To prevent this,
//            * the value is coerced to an empty string.
//            *
//            * @param {E164Number | undefined} value - The entered value
//            */
//           onChange={(value) => {
//             if (value) onChange?.(value);
//           }}
//           {...props}
//         />
//       );
//     },
//   );
// InputPhone.displayName = "InputPhone";

// const CountrySelect = ({ disabled, value, onChange, options }: CountrySelectProps) => {
//   const handleSelect = useCallback(
//     (country: RPNInput.Country) => {
//       onChange(country);
//     },
//     [onChange],
//   );

//   const [search, setSearch] = useState("")
//   const [open, setOpen] = useState(false)

//   return (
//     <Popover modal open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <Button
//           type="button"
//           variant={"outline"}
//           className={cn("flex gap-1 rounded-e-none rounded-s-lg px-3")}
//           disabled={disabled}
//         >
//           <FlagComponent country={value} countryName={value} />
//           <ChevronsUpDown
//             className={cn("-mr-2 size-4 opacity-50", disabled ? "hidden" : "opacity-100")}
//           />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent align='start' className="w-[300px] p-1 z-[5000] flex flex-col gap-2 bg-transparent border-none">
//         <Input
//           type="text"
//           placeholder="Search country..."
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-full p-2 border-b"
//         />

//         <ScrollArea className="h-72 rounded-md">
//           {search && options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase())).length === 0 && (
//             <div className="p-2 text-sm text-gray-500">No country found.</div>
//           )}
//           <div className="z-[1200] bg-white">
//             {options
//               .filter((option) => option.label.toLowerCase().includes(search.toLowerCase()))
//               .map((option) => (
//                 <div
//                   className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100"
//                   key={option.value}
//                   onClick={() => { handleSelect(option.value); setOpen(false) }}
//                 >
//                   <FlagComponent country={option.value} countryName={option.label} />
//                   <span className="flex-1 text-sm">{option.label}</span>
//                   {option.value && (
//                     <span className="text-sm text-foreground/50">
//                       {`+${RPNInput.getCountryCallingCode(option.value)}`}
//                     </span>
//                   )}
//                   <CheckIcon
//                     className={cn(
//                       "ml-auto size-4",
//                       option.value === value ? "opacity-100" : "opacity-0",
//                     )}
//                   />
//                 </div>
//               ))}
//           </div>
//         </ScrollArea>
//       </PopoverContent>
//     </Popover>
//   );
// };


// const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
//   const Flag = flags[country];

//   return (
//     <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20">
//       {Flag && <Flag title={countryName} />}
//     </span>
//   );
// };
// FlagComponent.displayName = "FlagComponent";

// type CountrySelectOption = { label: string; value: RPNInput.Country };

// type CountrySelectProps = {
//   disabled?: boolean;
//   value: RPNInput.Country;
//   onChange: (value: RPNInput.Country) => void;
//   options: CountrySelectOption[];
// };
