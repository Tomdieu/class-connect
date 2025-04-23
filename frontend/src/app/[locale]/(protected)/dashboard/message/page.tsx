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
import { Mail, User } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-2xl">
        <div className="relative mb-8">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-primary/30 rounded-bl-full z-0 opacity-20 hidden md:block"></div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 relative z-10 text-primary flex items-center gap-2">
            <Mail className="h-7 w-7 text-primary" />
            Nous contacter
          </h1>
          <p className="text-muted-foreground relative z-10">
            Envoyez-nous un message, nous vous répondrons rapidement.
          </p>
        </div>
        
        <Card className="border-primary/20 bg-card/95 backdrop-blur shadow-lg overflow-hidden relative">
          <div className="absolute bottom-0 left-0 w-[80px] h-[80px] bg-primary/20 rounded-tr-full z-0 opacity-20 hidden md:block"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-primary">Envoyer un message</h2>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <FormLabel className="block text-sm font-normal text-muted-foreground mb-2">
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
                          className="min-h-[120px] resize-none bg-background border-primary/20 focus-visible:ring-primary/20"
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
                    className="bg-primary hover:bg-primary/90 text-white px-8"
                  >
                    Envoyer
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}