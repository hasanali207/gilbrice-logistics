// "use client";

// import * as React from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import DatePicker, { ReactDatePickerProps } from "react-datepicker";

// import { cn } from "@/lib/utils";
// import { buttonVariants } from "@/components/ui/button";

// interface CalendarProps extends Omit<ReactDatePickerProps, "className" | "calendarClassName"> {
//   className?: string;
//   classNames?: Partial<Record<string, string>>;
//   showOutsideDays?: boolean;
//   selectsRange?: boolean;
// }

// const Calendar: React.FC<CalendarProps> = ({
//   className,
//   classNames,
//   showOutsideDays = true,
//   selectsRange,
//   ...props
// }) => {
//   return (
//     <DatePicker
//       showOutsideDays={showOutsideDays}
//       className={cn("p-3 border rounded w-full", className)}
//       calendarClassName="shadow-md rounded-lg p-2"
//       {...props}
//       // TypeScript-safe: only include selectsRange if true
//       {...(selectsRange ? { selectsRange: true } : {})}
//       renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
//         <div className="flex justify-between items-center mb-2 px-2">
//           <button
//             type="button"
//             onClick={decreaseMonth}
//             className={cn(buttonVariants({ variant: "outline" }), "p-1")}
//           >
//             <ChevronLeft className="w-4 h-4" />
//           </button>
//           <span className="text-sm font-medium">
//             {date.toLocaleString("default", { month: "long" })} {date.getFullYear()}
//           </span>
//           <button
//             type="button"
//             onClick={increaseMonth}
//             className={cn(buttonVariants({ variant: "outline" }), "p-1")}
//           >
//             <ChevronRight className="w-4 h-4" />
//           </button>
//         </div>
//       )}
//       components={{
//         IconPrevious: () => <ChevronLeft className="w-4 h-4" />,
//         IconNext: () => <ChevronRight className="w-4 h-4" />,
//       }}
//     />
//   );
// };

// export { Calendar };
