"use client";
import { useEffect, useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCurrentLocale, useI18n } from "@/locales/client";
import { Helmet } from 'react-helmet-async';
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { addContact } from "@/actions/contact";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoaderCircle, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

// Rate limiting token management
const CONTACT_TOKEN_KEY = "contact_rate_limit_token";
const TOKEN_EXPIRY_HOURS = 24;

const generateRateLimitToken = () => {
  const token = {
    timestamp: new Date().getTime(),
    expiry: new Date().getTime() + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
  };
  localStorage.setItem(CONTACT_TOKEN_KEY, JSON.stringify(token));
  return token;
};

const checkRateLimitToken = () => {
  try {
    const storedToken = localStorage.getItem(CONTACT_TOKEN_KEY);
    if (!storedToken) return null;
    
    const token = JSON.parse(storedToken);
    const now = new Date().getTime();
    
    if (now > token.expiry) {
      localStorage.removeItem(CONTACT_TOKEN_KEY);
      return null;
    }
    
    return token;
  } catch {
    localStorage.removeItem(CONTACT_TOKEN_KEY);
    return null;
  }
};

const ContactPage = () => {
  const t = useI18n();
  const locale = useCurrentLocale();
  const { data: session } = useSession();
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitExpiry, setRateLimitExpiry] = useState<Date | null>(null);
  
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact ClassConnect",
    "description": "Get in touch with ClassConnect support team",
    "mainEntity": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "availableLanguage": ["English", "French"]
    }
  };

  // Form schema
  const formSchema = z.object({
    name: z.string().min(2, {
      message: t("contact.form.validation.nameRequired") || "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: t("contact.form.validation.emailInvalid") || "Please enter a valid email address.",
    }),
    subject: z.string().min(3, {
      message: t("contact.form.validation.subjectRequired") || "Subject must be at least 3 characters.",
    }),
    message: z.string().min(10, {
      message: t("contact.form.validation.messageRequired") || "Message must be at least 10 characters.",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  // Check rate limiting on component mount
  useEffect(() => {
    const token = checkRateLimitToken();
    if (token) {
      setIsRateLimited(true);
      setRateLimitExpiry(new Date(token.expiry));
    }
  }, []);

  // Prepopulate form fields for authenticated users
  useEffect(() => {
    if (session?.user && !isRateLimited) {
      form.setValue("name", `${session.user.first_name || ''} ${session.user.last_name || ''}`.trim());
      form.setValue("email", session.user.email || '');
    }
  }, [session, form, isRateLimited]);

  // Contact mutation
  const contactMutation = useMutation({
    mutationFn: addContact,
    onSuccess: (data) => {
      toast.success(t("contact.form.success") || "Message sent successfully! We'll get back to you soon.");
      form.reset();
      // Generate rate limit token
      const token = generateRateLimitToken();
      setIsRateLimited(true);
      setRateLimitExpiry(new Date(token.expiry));
    },
    onError: (error) => {
      console.error("Contact submission error:", error);
      toast.error(t("contact.form.error") || "Failed to send message. Please try again.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isRateLimited) {
      toast.error(t("contact.form.rateLimited") || "You can only send one message per day. Please try again tomorrow.");
      return;
    }
    
    const contactData = {
      name: values.name,
      email: values.email,
      subject: values.subject,
      message: values.message,
      // Add user id if authenticated
      ...(session?.user?.id && { user: session.user.id }),
    };

    contactMutation.mutate(contactData);
  };

  const formatTimeRemaining = (expiry: Date) => {
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    const hours = Math.ceil(diff / (1000 * 60 * 60));
    return hours > 1 ? `${hours} hours` : `${Math.ceil(diff / (1000 * 60))} minutes`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{t("contact.title")} | ClassConnect</title>
        <meta name="description" content="Contactez l'équipe ClassConnect pour toute question ou assistance." />
        <link rel="canonical" href={`https://www.classconnect.cm/${locale}/contact`} />
        <meta property="og:title" content={`${t("contact.title")} | ClassConnect`} />
        <meta property="og:description" content="Contactez l'équipe ClassConnect" />
        <meta property="og:url" content={`https://www.classconnect.cm/${locale}/contact`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
      </Helmet>
      <Header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-5 sticky top-0 z-50" />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">{t("contact.title")}</h1>
            <p className="text-muted-foreground">
              {t("contact.description") || "Get in touch with our support team. We're here to help!"}
            </p>
          </div>

          {/* Rate Limiting Alert */}
          {isRateLimited && rateLimitExpiry && (
            <Alert className="mb-6 border-amber-200 bg-amber-50">
              <Clock className="h-4 w-4" />
              <AlertDescription className="text-amber-800">
                {t("contact.form.rateLimitMessage") || "You've already sent a message today. Please wait"} {formatTimeRemaining(rateLimitExpiry)} {t("contact.form.beforeSendingAgain") || "before sending another message"}.
              </AlertDescription>
            </Alert>
          )}

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                {t("contact.form.title") || "Send us a Message"}
              </CardTitle>
              <CardDescription>
                {t("contact.form.subtitle") || "Fill out the form below and we'll get back to you as soon as possible."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.form.name")}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t("contact.form.namePlaceholder") || "Enter your full name"}
                              {...field}
                              disabled={isRateLimited || contactMutation.isPending}
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
                          <FormLabel>{t("contact.form.email")}</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder={t("contact.form.emailPlaceholder") || "Enter your email address"}
                              {...field}
                              disabled={isRateLimited || contactMutation.isPending}
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
                        <FormLabel>{t("contact.form.subject")}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t("contact.form.subjectPlaceholder") || "What's this about?"}
                            {...field}
                            disabled={isRateLimited || contactMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("contact.form.message")}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={t("contact.form.messagePlaceholder") || "Tell us more about your inquiry..."}
                            className="min-h-[120px]"
                            {...field}
                            disabled={isRateLimited || contactMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* User Status Info */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {session?.user ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{t("contact.form.authenticatedUser") || "Signed in as"} {session.user.email}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <span>{t("contact.form.anonymousUser") || "Sending as anonymous user"}</span>
                      </>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isRateLimited || contactMutation.isPending}
                  >
                    {contactMutation.isPending ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        {t("contact.form.sending") || "Sending..."}
                      </>
                    ) : (
                      t("contact.form.submit") || "Send Message"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
