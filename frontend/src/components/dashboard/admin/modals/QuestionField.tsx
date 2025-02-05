"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useFieldArray } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type QuestionFieldProps = {
  questionIndex: number;
  control: any;
  removeQuestion: (index: number) => void;
};

export const QuestionField: React.FC<QuestionFieldProps> = ({
  questionIndex,
  control,
  removeQuestion,
}) => {
  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options` as const,
  });

  // Get the question text value for the accordion header
  const questionText = control._getWatch(`questions.${questionIndex}.text`);

  return (
    <Accordion type="single" collapsible className="mb-4">
      <AccordionItem value={`question-${questionIndex}`} className="border rounded-md bg-gray-50">
        <div className="flex items-center justify-between pr-4">
          <AccordionTrigger className="flex-1 hover:no-underline">
            <div className="flex items-center gap-2 px-2">
              <span className="font-medium">Question {questionIndex + 1}</span>
              <span className="text-sm text-muted-foreground truncate">
                {questionText || "New Question"}
              </span>
            </div>
          </AccordionTrigger>
          <Button
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              removeQuestion(questionIndex);
            }}
            size="sm"
          >
            Remove
          </Button>
        </div>

        <AccordionContent className="p-4">
          <FormField
            control={control}
            name={`questions.${questionIndex}.text`}
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormLabel>Question Text</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter question text" />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
            <FormField
              control={control}
              name={`questions.${questionIndex}.type`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choice" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                        <SelectItem value="SINGLE_CHOICE">Single Choice</SelectItem>
                        <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                        <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name={`questions.${questionIndex}.points`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Points</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="Points" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name={`questions.${questionIndex}.order`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="Order" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name={`questions.${questionIndex}.explanation`}
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormLabel>Explanation</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Explanation (optional)" />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Options Section */}
          <div className="mt-4">
            <h5 className="font-medium mb-2">Options</h5>
            <div className="space-y-2">
              {optionFields.map((option, oIndex) => (
                <div
                  key={option.id}
                  className="flex flex-wrap flex-col sm:flex-row sm:items-center gap-2 p-2 border rounded bg-white"
                >
                  <FormField
                    control={control}
                    name={`questions.${questionIndex}.options.${oIndex}.text`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Text</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Option text" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={control}
                    name={`questions.${questionIndex}.options.${oIndex}.is_correct`}
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormLabel>Correct?</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={control}
                    name={`questions.${questionIndex}.options.${oIndex}.order`}
                    render={({ field }) => (
                      <FormItem className="w-fit flex items-center gap-2">
                        <FormLabel>Order</FormLabel>
                        <FormControl>
                          <Input {...field} className="w-20" type="number" placeholder="Order" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    variant="destructive"
                    onClick={() => removeOption(oIndex)}
                    size="sm"
                    className="sm:self-end"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            
            <Button
              onClick={() =>
                appendOption({
                  text: "",
                  is_correct: false,
                  order: optionFields.length + 1,
                })
              }
              size="sm"
              className="mt-2"
            >
              Add Option
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

// "use client";

// import React from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
// } from "@/components/ui/form";
// import { Switch } from "@/components/ui/switch";
// import { useFieldArray } from "react-hook-form";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// type QuestionFieldProps = {
//   questionIndex: number;
//   control: any;
//   removeQuestion: (index: number) => void;
// };

// export const QuestionField: React.FC<QuestionFieldProps> = ({
//   questionIndex,
//   control,
//   removeQuestion,
// }) => {
//   // Now use useFieldArray here for the options of the given question.
//   const {
//     fields: optionFields,
//     append: appendOption,
//     remove: removeOption,
//   } = useFieldArray({
//     control,
//     name: `questions.${questionIndex}.options` as const,
//   });

//   return (
//     <div className="mb-6 p-4 border rounded-md transition-all duration-300 bg-gray-50">
//       <div className="flex justify-between items-center">
//         <h4 className="font-medium">Question {questionIndex + 1}</h4>
//         <Button
//           variant="destructive"
//           onClick={() => removeQuestion(questionIndex)}
//           size={"sm"}
//         >
//           Remove Question
//         </Button>
//       </div>
//       <FormField
//         control={control}
//         name={`questions.${questionIndex}.text`}
//         render={({ field }) => (
//           <FormItem className="mt-2">
//             <FormLabel>Question Text</FormLabel>
//             <FormControl>
//               <Input {...field} placeholder="Enter question text" />
//             </FormControl>
//           </FormItem>
//         )}
//       />
//       <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
//         <FormField
//           control={control}
//           name={`questions.${questionIndex}.type`}
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Type</FormLabel>
//               <FormControl>
//                 <Select value={field.value} onValueChange={field.onChange}>
//                     <SelectTrigger>
//                         <SelectValue placeholder="Choice" />
//                     </SelectTrigger>
//                   <SelectContent>
//                   <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
//                   <SelectItem value="SINGLE_CHOICE">Single Choice</SelectItem>
//                   <SelectItem value="TRUE_FALSE">True/False</SelectItem>
//                   <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </FormControl>
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={control}
//           name={`questions.${questionIndex}.points`}
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Points</FormLabel>
//               <FormControl>
//                 <Input {...field} type="number" placeholder="Points" />
//               </FormControl>
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={control}
//           name={`questions.${questionIndex}.order`}
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Order</FormLabel>
//               <FormControl>
//                 <Input {...field} type="number" placeholder="Order" />
//               </FormControl>
//             </FormItem>
//           )}
//         />
//       </div>
//       <FormField
//         control={control}
//         name={`questions.${questionIndex}.explanation`}
//         render={({ field }) => (
//           <FormItem className="mt-2">
//             <FormLabel>Explanation</FormLabel>
//             <FormControl>
//               <Textarea {...field} placeholder="Explanation (optional)" />
//             </FormControl>
//           </FormItem>
//         )}
//       />

//       {/* Options Section */}
//       <div className="mt-4">
//         <h5 className="font-medium">Options</h5>
//         {optionFields.map((option, oIndex) => (
//           <div
//             key={option.id}
//             className="flex flex-wrap flex-col sm:flex-row sm:items-center gap-2 mt-2 p-2 border rounded transition-all duration-300 bg-white"
//           >
//             <FormField
//               control={control}
//               name={`questions.${questionIndex}.options.${oIndex}.text`}
//               render={({ field }) => (
//                 <FormItem className="flex-1">
//                   <FormLabel>Text</FormLabel>
//                   <FormControl>
//                     <Input {...field} placeholder="Option text" />
//                   </FormControl>
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={control}
//               name={`questions.${questionIndex}.options.${oIndex}.is_correct`}
//               render={({ field }) => (
//                 <FormItem className="flex items-center space-x-2">
//                   <FormLabel>Correct?</FormLabel>
//                   <FormControl>
//                     <Switch
//                       checked={field.value}
//                       onCheckedChange={field.onChange}
//                     />
//                   </FormControl>
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={control}
//               name={`questions.${questionIndex}.options.${oIndex}.order`}
//               render={({ field }) => (
//                 <FormItem className="w-fit flex items-center gap-2">
//                   <FormLabel>Order</FormLabel>
//                   <FormControl>
//                     <Input {...field} className="w-20" type="number" placeholder="Order" />
//                   </FormControl>
//                 </FormItem>
//               )}
//             />
//             <Button
//               variant="destructive"
//               onClick={() => removeOption(oIndex)}
//               className="mt-6"
//               size={"sm"}
//             >
//               Remove
//             </Button>
//           </div>
//         ))}
//         <Button
//           onClick={() =>
//             appendOption({
//               text: "",
//               is_correct: false,
//               order: optionFields.length + 1,
//             })
//           }
//           size={"sm"}
//           className="mt-2"
//         >
//           Add Option
//         </Button>
//       </div>
//     </div>
//   );
// };
