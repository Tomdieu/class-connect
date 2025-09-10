'use client'

import React, { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useSession } from 'next-auth/react'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  User, 
  Loader2, 
  Send, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  XCircle,
  RefreshCw
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { addContact, getContacts } from '@/actions/contact'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import { ContactType } from '@/types'
import { useI18n } from '@/locales/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(2, { message: 'Le nom est requis' }),
  email: z.string().email({ message: 'Format d\'email invalide' }),
  subject: z.string().min(5, { message: 'Le sujet est requis (min. 5 caractères)' }),
  message: z.string().min(10, { message: 'Le message doit contenir au moins 10 caractères' }),
  isAboutStudent: z.enum(['Non', 'Oui']),
})

// Define the type for our form values
type FormValues = z.infer<typeof formSchema>

export default function MessagePage() {
  const t = useI18n()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('new-message')
  const { data: session } = useSession()

  // Query to fetch user's messages
  const {
    data: contacts,
    isLoading: contactsLoading,
    isError: contactsError,
    refetch: refetchContacts
  } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => getContacts(),
  })

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: session?.user ? `${session.user.first_name || ''} ${session.user.last_name || ''}`.trim() : '',
      email: session?.user?.email || '',
      subject: '',
      isAboutStudent: 'Non',
      message: '',
    },
  })
  
  // Update form values when session changes
  useEffect(() => {
    if (session?.user) {
      form.setValue('name', `${session.user.first_name || ''} ${session.user.last_name || ''}`.trim())
      form.setValue('email', session.user.email || '')
    }
  }, [session, form])

  // Mutation to send contact message
  const sendContactMutation = useMutation({
    mutationFn: (data: FormValues) => {
      return addContact({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        concerns_student: data.isAboutStudent === 'Oui'
      })
    },
    onSuccess: () => {
      toast.success(
        t('contact.success.description') || 'Votre message a été envoyé avec succès. Nous vous répondrons bientôt.',
        {
          duration: 5000,
          icon: '✅',
        }
      )
      form.reset({
        name: '',
        email: '',
        subject: '',
        isAboutStudent: 'Non',
        message: '',
      })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      setActiveTab('my-messages')
    },
    onError: (error) => {
      console.error('Error sending contact:', error)
      toast.error(
        t('contact.error.description') || 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.',
        {
          duration: 5000,
          icon: '❌',
        }
      )
    },
  })
  
  // Handle form submission
  const onSubmit = (values: FormValues) => {
    sendContactMutation.mutate(values)
  }

  // Function to format date according to locale
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'PPP', { locale: t('common.locale') === 'fr' ? fr : enUS })
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pt-8 pb-16">
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '8px',
        },
      }} />
      <div className="py-8 px-4 sm:px-6">
        <div className=" mb-8 mx-auto">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-primary/30 rounded-bl-full z-0 opacity-20 hidden md:block"></div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 relative z-10 text-primary flex items-center gap-2">
            <Mail className="h-7 w-7 text-primary" />
            {t('contact.title') || 'Messagerie'}
          </h1>
          <p className="text-muted-foreground relative z-10">
            {t('contact.subtitle') || 'Communiquez avec l\'administration et suivez vos messages.'}
          </p>
        </div>

        <Tabs 
          defaultValue="new-message" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full mx-auto"
        >
          <div className="bg-card rounded-lg p-1 mb-6 flex justify-center shadow-sm border w-full">
            <TabsList className="grid grid-cols-2 w-full flex-1">
              <TabsTrigger value="new-message" className="flex items-center gap-1 flex-1">
                <Send className="h-4 w-4" />
                <span>{t('contact.tabs.newMessage') || 'Nouveau message'}</span>
              </TabsTrigger>
              <TabsTrigger value="my-messages" className="flex items-center gap-1 flex-1">
                <MessageSquare className="h-4 w-4" />
                <span>{t('contact.tabs.myMessages') || 'Mes messages'}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="new-message" className="space-y-4">
            <Card className="border-primary/20 bg-card/95 backdrop-blur shadow-lg overflow-hidden relative">
              <div className="absolute bottom-0 left-0 w-[80px] h-[80px] bg-primary/20 rounded-tr-full z-0 opacity-20 hidden md:block"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Send className="h-5 w-5" />
                  {t('contact.form.title') || 'Envoyer un message'}
                </CardTitle>
                <CardDescription>
                  {t('contact.form.description') || 'Nous vous répondrons dans les plus brefs délais.'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6 relative z-10">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contact.form.name') || 'Nom'}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={t('contact.form.namePlaceholder') || 'Votre nom complet'} 
                                {...field}
                                className="border-primary/20 focus-visible:ring-primary/20" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contact.form.email') || 'Email'}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={t('contact.form.emailPlaceholder') || 'votre.email@exemple.com'} 
                                type="email"
                                {...field}
                                className="border-primary/20 focus-visible:ring-primary/20" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('contact.form.subject') || 'Sujet'}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t('contact.form.subjectPlaceholder') || 'Sujet de votre message'} 
                              {...field}
                              className="border-primary/20 focus-visible:ring-primary/20" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div>
                      <FormLabel className="block text-sm font-medium mb-2">
                        {t('contact.form.isAboutStudent') || 'Ce message concerne un élève suivi :'}
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
                                  <label htmlFor="option-non" className="text-sm">{t('contact.form.no') || 'Non'}</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Oui" id="option-oui" />
                                  <label htmlFor="option-oui" className="text-sm">{t('contact.form.yes') || 'Oui'}</label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormDescription className="text-xs mt-1">
                              {t('contact.form.studentHelp') || 'Sélectionnez "Oui" si votre message concerne un étudiant spécifique.'}
                            </FormDescription>
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
                          <FormLabel>{t('contact.form.message') || 'Message'}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t('contact.form.messagePlaceholder') || 'Saisissez votre message ici...'}
                              className="min-h-[150px] resize-none bg-background border-primary/20 focus-visible:ring-primary/20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-center pt-2">
                      <Button 
                        type="submit"
                        className="bg-primary hover:bg-primary/90 text-white px-8"
                        disabled={sendContactMutation.isPending}
                      >
                        {sendContactMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {t('contact.form.send') || 'Envoyer'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-messages" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                {t('contact.history.title') || 'Historique de mes messages'}
              </h2>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchContacts()}
                className="border-primary/20 text-primary hover:text-primary/80"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('contact.history.refresh') || 'Actualiser'}
              </Button>
            </div>

            {contactsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">
                    {t('contact.history.loading') || 'Chargement de vos messages...'}
                  </p>
                </div>
              </div>
            ) : contactsError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
                <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <p className="font-medium">
                  {t('contact.history.error') || 'Erreur de chargement'}
                </p>
                <p className="mt-1 text-sm">
                  {t('contact.history.tryAgain') || 'Impossible de charger vos messages. Veuillez réessayer.'}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4 border-red-300 text-red-700 hover:bg-red-50"
                  onClick={() => refetchContacts()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('contact.history.retry') || 'Réessayer'}
                </Button>
              </div>
            ) : contacts && contacts.length > 0 ? (
              <div className="space-y-4">
                {contacts.map((contact: ContactType) => (
                  <Card key={contact.id} className="border-primary/10 shadow-sm overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base font-medium">
                            {contact.subject}
                          </CardTitle>
                          <CardDescription className="text-xs flex items-center mt-1 gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(contact.created_at)}
                          </CardDescription>
                        </div>
                        <Badge variant={contact.replies.length > 0 ? "default" : "outline"}>
                          {contact.replies.length > 0 ? (
                            t('contact.status.replied') || 'Répondu'
                          ) : (
                            t('contact.status.pending') || 'En attente'
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="text-sm whitespace-pre-wrap">
                        {contact.message}
                      </div>

                      {contact.replies.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          <div className="mt-3 space-y-3">
                            {contact.replies.map((reply) => (
                              <div key={reply.id} className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                                <div className="flex justify-between mb-2">
                                  <div className="flex items-center gap-1 text-xs font-medium text-primary">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {t('contact.reply.from') || 'Réponse de'} {reply.admin_user_details?.full_name || 'Admin'}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(reply.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm mt-1 whitespace-pre-wrap">
                                  {reply.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-muted/30 border border-dashed border-muted rounded-lg p-10 text-center">
                <Mail className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-muted-foreground/80 mb-1">
                  {t('contact.history.empty') || 'Aucun message envoyé'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  {t('contact.history.emptyDescription') || "Vous n'avez pas encore envoyé de message à l'administration. Utilisez le formulaire pour envoyer votre premier message."}
                </p>
                <Button 
                  onClick={() => setActiveTab('new-message')} 
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {t('contact.history.createFirst') || 'Envoyer un message'}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}