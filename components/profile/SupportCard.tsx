'use client';

import React, { memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Mail, Phone } from 'lucide-react';

const SupportCardComponent = () => {
  const supportEmail = 'rehamansyed07@gmail.com';
  const supportPhone = '+91 78427 22245';

  return (
    <Card className="bg-card shadow-lg border border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Third Umpire Review</CardTitle>
        <CardDescription>Need assistance? Go upstairs to the third umpire for help.</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              size="lg" 
              className="w-full justify-start text-base py-6 bg-primary hover:bg-primary/90 text-primary-foreground" 
            >
              <MessageSquare className="mr-3 h-5 w-5" />
              Contact Support
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Contact Support</DialogTitle>
              <DialogDescription className="text-sm">
                Choose your preferred method to get in touch with our team.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-6">
              {/* EMAIL OPTION */}
              <Button 
                asChild 
                size="lg" 
                className="w-full justify-start text-base py-7 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                <a href={`mailto:${supportEmail}`}>
                  <Mail className="mr-3 h-5 w-5" />
                  <div className="flex flex-col items-start">
                    <span>Email Us</span>
                    <span className="text-xs font-normal opacity-90">{supportEmail}</span>
                  </div>
                </a>
              </Button>

              {/* WHATSAPP OPTION */}
              <Button 
                asChild 
                size="lg" 
                className="w-full justify-start text-base py-7 border-2 border-primary text-primary hover:bg-primary/5 font-semibold"
                variant="outline"
              >
                <a 
                  href={`https://wa.me/917842722245?text=Hello%20IndCric%20Support`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <MessageSquare className="mr-3 h-5 w-5" />
                  <div className="flex flex-col items-start">
                    <span>WhatsApp</span>
                    <span className="text-xs font-normal opacity-70">{supportPhone}</span>
                  </div>
                </a>
              </Button>

              {/* PHONE OPTION */}
              <Button 
                asChild 
                size="lg" 
                className="w-full justify-start text-base py-7 border-2 border-border text-foreground hover:bg-secondary font-semibold"
                variant="outline"
              >
                <a href={`tel:${supportPhone}`}>
                  <Phone className="mr-3 h-5 w-5" />
                  <div className="flex flex-col items-start">
                    <span>Call Us</span>
                    <span className="text-xs font-normal opacity-70">{supportPhone}</span>
                  </div>
                </a>
              </Button>
            </div>

            <DialogFooter className="pt-4 border-t">
              <DialogClose asChild>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full border-primary text-primary hover:bg-primary/5"
                >
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

const SupportCard = memo(SupportCardComponent);
export default SupportCard;
