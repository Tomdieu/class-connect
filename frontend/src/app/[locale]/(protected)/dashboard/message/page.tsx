'use client'

import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'

// Define the form schema with Zod
const formSchema = z.object({
  isAboutStudent: z.enum(['Non', 'Oui']),
  message: z.string().min(1, 'Le message est requis'),
})

// Define the type for our form values
type FormValues = z.infer<typeof formSchema>

export default function MessagePage() {
  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isAboutStudent: 'Non',
      message: '',
    },
  })
  
  // Handle form submission
  const onSubmit = (values: FormValues) => {
    console.log('Form submitted:', values)
    // Here you would typically send the data to an API
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Nous contacter</h1>
      
      <Card className="border rounded-md max-w-3xl">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Envoyer un message</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <FormLabel className="block text-sm font-normal text-gray-600 mb-2">
                  Ce message concerne un élève suivi :
                </FormLabel>
                <FormField
                  control={form.control}
                  name="isAboutStudent"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Non" id="option-non" />
                            <label htmlFor="option-non" className="text-sm">Non</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Oui" id="option-oui" />
                            <label htmlFor="option-oui" className="text-sm">Oui</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Votre message..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-center">
                <Button 
                  type="submit"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-8"
                >
                  Envoyer
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}