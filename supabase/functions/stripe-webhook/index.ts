import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@11.1.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret!)
  } catch (err) {
    return new Response(err.message, { status: 400 })
  }

  try {
    const session = event.data.object as Stripe.Checkout.Session
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    const customerId = session.customer as string

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (!profile) {
      throw new Error(`Profile not found for customer ${customerId}`)
    }

    const userId = profile.id
    const planIsActive = subscription.status === 'active' || subscription.status === 'trialing'

    await supabaseAdmin
      .from('profiles')
      .update({
        plan: planIsActive ? 'premium' : 'free',
        stripe_plan_active: planIsActive,
        stripe_subscription_id: subscription.id,
      })
      .eq('id', userId)

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }
})
