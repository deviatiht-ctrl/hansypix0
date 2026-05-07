<<<<<<< HEAD
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or webhook secret', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata.bookingId

        if (bookingId) {
          // Update payment status
          await supabase
            .from('payments')
            .update({
              payment_status: 'completed',
              transaction_id: paymentIntent.id,
              payment_details: {
                amount_received: paymentIntent.amount_received,
                status: paymentIntent.status,
              },
            })
            .eq('booking_id', bookingId)
            .eq('payment_method', 'stripe')

          // Update booking status
          await supabase
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', bookingId)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata.bookingId

        if (bookingId) {
          await supabase
            .from('payments')
            .update({
              payment_status: 'failed',
              payment_details: {
                error: paymentIntent.last_payment_error?.message || 'Payment failed',
              },
            })
            .eq('booking_id', bookingId)
            .eq('payment_method', 'stripe')
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = charge.payment_intent

        if (paymentIntentId) {
          await supabase
            .from('payments')
            .update({
              payment_status: 'refunded',
              payment_details: {
                refunded: true,
                refund_amount: charge.amount_refunded,
              },
            })
            .eq('transaction_id', paymentIntentId)
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
=======
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or webhook secret', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata.bookingId

        if (bookingId) {
          // Update payment status
          await supabase
            .from('payments')
            .update({
              payment_status: 'completed',
              transaction_id: paymentIntent.id,
              payment_details: {
                amount_received: paymentIntent.amount_received,
                status: paymentIntent.status,
              },
            })
            .eq('booking_id', bookingId)
            .eq('payment_method', 'stripe')

          // Update booking status
          await supabase
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', bookingId)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata.bookingId

        if (bookingId) {
          await supabase
            .from('payments')
            .update({
              payment_status: 'failed',
              payment_details: {
                error: paymentIntent.last_payment_error?.message || 'Payment failed',
              },
            })
            .eq('booking_id', bookingId)
            .eq('payment_method', 'stripe')
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = charge.payment_intent

        if (paymentIntentId) {
          await supabase
            .from('payments')
            .update({
              payment_status: 'refunded',
              payment_details: {
                refunded: true,
                refund_amount: charge.amount_refunded,
              },
            })
            .eq('transaction_id', paymentIntentId)
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
>>>>>>> a0f94cd2f455cd5b65045c161fc96ba4dddb1da9
